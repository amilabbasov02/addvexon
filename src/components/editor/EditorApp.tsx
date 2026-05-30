"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { useSearchParams } from "next/navigation";
import { EditorHeader } from "@/components/site/EditorHeader";
import { useSession } from "@/lib/auth-client";
import { useEditorStore } from "./useEditorStore";
import { useDocumentSync } from "./useDocumentSync";
import { useMe } from "./useMe";
import { CanvasStage } from "./CanvasStage";
import { ToolbarLeft } from "./ToolbarLeft";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { TemplatePicker } from "./TemplatePicker";
import { ExportDialog } from "./ExportDialog";
import { SellDialog } from "@/components/dashboard/SellDialog";
import { getTemplate, type Template } from "./templates";

export type EditorAppProps = {
  pro?: boolean;
};

function EditorAppInner({ pro = false }: EditorAppProps) {
  const search = useSearchParams();
  // Arriving with ?template= / ?doc= / ?new= means the caller wants a clean
  // slate — skip localStorage hydration so the user doesn't see a flash of
  // their last edit before the requested template loads on top.
  const skipHydration =
    !!search.get("template") || !!search.get("doc") || !!search.get("new");
  const store = useEditorStore(undefined, { skipHydration });
  const stageRef = useRef<Konva.Stage>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [templateName, setTemplateName] = useState<string | undefined>();
  // Show a clean loading overlay while a ?template= is being fetched so the
  // brief gap between mount and loadDocument() doesn't render an empty
  // canvas (which feels like the wrong banner opened).
  const [templateLoading, setTemplateLoading] = useState(
    !!search.get("template"),
  );
  const initialResolved = useRef(false);
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const me = useMe(signedIn);
  const sync = useDocumentSync(store, { signedIn });
  const canAccessPro = me?.limits.canAccessProTemplates ?? false;
  const canUseAiText = me?.limits.canUseAiText ?? false;
  const canExportClean = me?.limits.canExportWithoutWatermark ?? false;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const pickTemplate = useCallback(
    (t: Template) => {
      store.loadDocument(t.document);
      setTemplateName(t.name);
      sync.setTitle(t.name);
      setPickerOpen(false);
    },
    [store, sync],
  );

  // First-load resolution: ?doc=ID is handled by useDocumentSync. If
  // ?template=X is present, hydrate from the catalog (local first, then
  // DB).  Otherwise the editor opens with a blank canvas — users browse
  // templates from /marketplace and arrive here with a ?template= param.
  useEffect(() => {
    if (initialResolved.current) return;
    if (search.get("doc")) {
      initialResolved.current = true;
      return;
    }
    initialResolved.current = true;
    const tid = search.get("template");
    if (tid) {
      // Hard cap — under no circumstance keep "Loading template…" overlay
      // visible past 8s. If the fetch hangs (offline, CDN issue, missing
      // slug) the user still gets a usable empty canvas to work with.
      const safetyTimer = window.setTimeout(() => setTemplateLoading(false), 8000);
      const clear = () => {
        window.clearTimeout(safetyTimer);
        setTemplateLoading(false);
      };
      const local = getTemplate(tid);
      if (local) {
        store.loadDocument(local.document);
        setTemplateName(local.name);
        sync.setTitle(local.name);
        clear();
        return;
      }
      // Fetch the specific slug. Slug goes in the POST body (not URL path)
      // because many marketplace slugs contain words like "banner" or IAB
      // ad dimensions ("728x90", "300x250") that uBlock / AdBlock filter
      // lists treat as ad-tracker patterns and blanket-block. The body-
      // based path keeps the URL itself neutral.
      fetch("/api/lib/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tid }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (data: {
            template?: { slug: string; name: string; document: typeof store.doc };
          } | null) => {
            const found = data?.template;
            if (found) {
              store.loadDocument(found.document);
              setTemplateName(found.name);
              sync.setTitle(found.name);
            }
          },
        )
        .catch(() => {})
        .finally(clear);
      return;
    }
    // ?new=1 → reset() to ensure no stale state (skipHydration already ran,
    // but the user may have hit "New design" from inside the editor too).
    if (search.get("new")) {
      store.reset();
    }
    setTemplateLoading(false);
    // No template, no doc → leave canvas blank. User can pick a template
    // from the toolbar button or open /marketplace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if (inField) return;

      const meta = e.ctrlKey || e.metaKey;
      if ((e.key === "Delete" || e.key === "Backspace") && store.selectedId) {
        e.preventDefault();
        store.removeLayer(store.selectedId);
      } else if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if (meta && (e.key === "Z" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        store.redo();
      } else if (meta && e.key.toLowerCase() === "d" && store.selectedId) {
        e.preventDefault();
        store.duplicateLayer(store.selectedId);
      } else if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (store.save()) showToast("Saved");
      } else if (meta && e.key === "]" && store.selectedId) {
        // Ctrl/Cmd + ]   — bring forward
        // Ctrl/Cmd + Shift + ]  — bring to front
        e.preventDefault();
        store.reorderLayer(store.selectedId, e.shiftKey ? "top" : "up");
      } else if (meta && e.key === "[" && store.selectedId) {
        // Ctrl/Cmd + [   — send backward
        // Ctrl/Cmd + Shift + [  — send to back
        e.preventDefault();
        store.reorderLayer(store.selectedId, e.shiftKey ? "bottom" : "down");
      } else if (e.key === "Escape") {
        store.setSelectedId(null);
      } else if (
        store.selectedId &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const sel = store.selected;
        if (sel) {
          const dx =
            e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy =
            e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          store.updateLayer(sel.id, { x: sel.x + dx, y: sel.y + dy });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, showToast]);

  const handleSave = useCallback(() => {
    if (store.save()) showToast("Saved locally");
  }, [store, showToast]);

  const handleExport = useCallback(() => {
    // Opens the ExportDialog — actual rendering happens off-screen via the
    // export engine (PNG / JPG / PDF / Magic-Resize pack ZIPs).
    setExportOpen(true);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-surface">
      <EditorHeader
        title={sync.title || templateName}
        onTitleChange={signedIn ? sync.setTitle : undefined}
        userPlan={me?.user.plan}
        onSave={handleSave}
        onSell={
          signedIn
            ? () => {
                // Make sure the latest state is in the cloud before we open
                // the listing form — the SellDialog hands the documentId
                // straight to /api/listings.
                store.save();
                if (sync.docId) setSellOpen(true);
                else showToast("Edit anything once so we can save your draft");
              }
            : () => {
                showToast("Sign in to publish on the marketplace");
              }
        }
        canSell={signedIn && !!sync.docId}
        onExport={handleExport}
        syncStatus={signedIn ? sync.status : "anonymous"}
      />

      <div className="flex-1 flex pt-14 min-h-0">
        <ToolbarLeft
          store={store}
          signedIn={signedIn}
          onOpenTemplates={() => setPickerOpen(true)}
        />
        <LayersPanel store={store} />

        <div
          ref={viewportRef}
          className="flex-1 relative bg-surface-dim overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <CanvasStage
            store={store}
            viewportRef={viewportRef}
            stageRef={stageRef}
            filters={pro ? store.filters : undefined}
            onScaleChange={setScale}
          />

          {/* Top-left: undo / redo + templates */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <div className="glass-panel rounded-full flex items-center">
              <button
                type="button"
                aria-label="Undo"
                onClick={() => store.undo()}
                disabled={!store.canUndo}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">undo</span>
              </button>
              <button
                type="button"
                aria-label="Redo"
                onClick={() => store.redo()}
                disabled={!store.canRedo}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">redo</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="glass-panel rounded-full px-3 h-9 flex items-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Templates
            </button>
          </div>

          {/* Bottom-right zoom indicator */}
          <div className="absolute bottom-4 right-4 glass-panel rounded-full px-3 py-1.5 text-label-sm font-label-sm text-on-surface-variant z-10">
            {Math.round(scale * 100)}%
          </div>

          {/* Bottom-center hint */}
          {store.doc.layers.length > 0 && !store.selectedId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel rounded-full px-4 py-1.5 text-label-sm font-label-sm text-on-surface-variant z-10">
              Click any layer on the canvas to edit · ↑↓←→ to nudge · Del to remove
            </div>
          )}

          {toast && (
            <div
              role="status"
              className="absolute top-4 left-1/2 -translate-x-1/2 ai-gradient text-on-primary px-4 py-1.5 rounded-full text-label-sm font-label-sm shadow-lg z-20"
            >
              {toast}
            </div>
          )}

          {templateLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-dim/95 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
                  progress_activity
                </span>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  Loading template…
                </p>
              </div>
            </div>
          )}
        </div>

        <PropertiesPanel
          store={store}
          showFilters={pro}
          canUseAiText={canUseAiText}
        />
      </div>

      <TemplatePicker
        open={pickerOpen}
        closable={store.doc.layers.length > 0}
        canAccessPro={canAccessPro}
        onClose={() => setPickerOpen(false)}
        onPick={pickTemplate}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        doc={store.doc}
        canExportClean={canExportClean}
      />

      {sync.docId && (
        <SellDialog
          open={sellOpen}
          document={{ id: sync.docId, title: sync.title || "Untitled design" }}
          onClose={() => setSellOpen(false)}
          onSuccess={() => showToast("Listed for review")}
        />
      )}
    </div>
  );
}

export function EditorApp(props: EditorAppProps) {
  // useSearchParams must be inside a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <EditorAppInner {...props} />
    </Suspense>
  );
}
