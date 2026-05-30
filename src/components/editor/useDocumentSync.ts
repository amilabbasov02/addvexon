"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EditorStore } from "./useEditorStore";

type CloudDoc = {
  id: string;
  title: string;
  canvasSize: { width: number; height: number };
  background: string;
  layers: unknown[];
  thumbnailUrl?: string | null;
  templateId?: string | null;
};

export type SyncStatus =
  | "idle"
  | "saving"
  | "saved"
  | "unsaved"
  | "error"
  | "loading"
  | "anonymous";

/**
 * Two-way sync between the in-memory editor store and the user's cloud
 * documents.
 *
 *   - If signed in AND ?doc=ID is in the URL → fetch + hydrate
 *   - Cloud writes are MANUAL: the editor's Save button invokes
 *     `saveToCloud()`. No autosave — user edits never reach the API
 *     without an explicit action. `dirty` exposes whether the in-memory
 *     state has diverged from the last cloud snapshot.
 *   - If signed out → leave the store alone; localStorage save still works
 */
export function useDocumentSync(
  store: EditorStore,
  options: { signedIn: boolean; enabled?: boolean },
) {
  const { signedIn } = options;
  const enabled = options.enabled ?? true;
  const router = useRouter();
  const search = useSearchParams();
  const docIdFromUrl = search.get("doc");

  const [docId, setDocId] = useState<string | null>(docIdFromUrl);
  const [title, setTitle] = useState<string>("Untitled design");
  const [status, setStatus] = useState<SyncStatus>(
    signedIn ? "idle" : "anonymous",
  );

  const initialHydrated = useRef(false);
  const skipNextSave = useRef(false);
  const lastSavedAt = useRef(0);

  // useEditorStore returns a brand-new object every render, so any closure
  // that captures `store` directly will read whatever `doc` was current at
  // the moment the closure was memoized — almost always stale. We mirror
  // the store through a ref that's updated on each render so saveToCloud /
  // the dirty-detection effect always read the CURRENT document.
  const storeRef = useRef(store);
  storeRef.current = store;

  // --- Initial hydration: load existing document by ID, if any. -----------
  useEffect(() => {
    if (!enabled || !signedIn || !docIdFromUrl) {
      initialHydrated.current = true;
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/documents/${docIdFromUrl}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { document: CloudDoc }) => {
        if (cancelled || !data.document) return;
        const doc = data.document;
        // Avoid pushing this server-loaded state into the undo stack.
        skipNextSave.current = true;
        store.loadDocument({
          canvasSize: doc.canvasSize,
          background: doc.background,
          layers: doc.layers as unknown as never[],
        });
        setDocId(doc.id);
        setTitle(doc.title);
        setStatus("saved");
        initialHydrated.current = true;
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          initialHydrated.current = true;
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, docIdFromUrl, enabled]);

  // Track whether the local state has diverged from the last cloud snapshot.
  // Drives the "unsaved changes" UI affordance + the beforeunload warning.
  const cloudSnapshotRef = useRef(JSON.stringify(store.doc));
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      cloudSnapshotRef.current = JSON.stringify(store.doc);
      setDirty(false);
      return;
    }
    const isDirty = JSON.stringify(store.doc) !== cloudSnapshotRef.current;
    setDirty(isDirty);
    // Surface dirty state via the sync badge so the user never thinks
    // their edits are safely stored when they aren't. Don't override
    // in-flight "saving" or terminal "error" — those carry their own
    // meaning the user must see.
    setStatus((s) => {
      if (s === "saving" || s === "error" || s === "loading") return s;
      if (s === "anonymous") return s;
      return isDirty ? "unsaved" : s === "unsaved" ? "saved" : s;
    });
  }, [store.doc]);

  // --- Manual cloud save (autosave disabled). The editor's Save button is
  //     now the single trigger so user edits never hit the wire without an
  //     explicit action.
  const saveToCloud = useCallback(async (): Promise<string | null> => {
    if (!enabled || !signedIn) return null;
    const liveDoc = storeRef.current.doc;
    try {
      setStatus("saving");
      let resultId = docId;
      if (!docId) {
        const resp = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            canvasSize: liveDoc.canvasSize,
            background: liveDoc.background,
            layers: liveDoc.layers,
          }),
        });
        if (!resp.ok) throw new Error(`Create failed: ${resp.status}`);
        const { id } = (await resp.json()) as { id: string };
        resultId = id;
        setDocId(id);
        const params = new URLSearchParams(window.location.search);
        params.set("doc", id);
        router.replace(`/editor?${params.toString()}`, { scroll: false });
      } else {
        const resp = await fetch(`/api/documents/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            canvasSize: liveDoc.canvasSize,
            background: liveDoc.background,
            layers: liveDoc.layers,
          }),
        });
        if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
      }
      cloudSnapshotRef.current = JSON.stringify(liveDoc);
      setDirty(false);
      lastSavedAt.current = Date.now();
      setStatus("saved");
      return resultId;
    } catch (err) {
      console.error("Cloud save failed:", err);
      setStatus("error");
      return null;
    }
  }, [enabled, signedIn, docId, title, router]);

  // Warn before tab close / navigation when there are unsaved changes — only
  // when signed in (anonymous users can't cloud-save anyway).
  useEffect(() => {
    if (!enabled || !signedIn || !dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome ignores the returnValue string but requires it set.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled, signedIn, dirty]);

  const updateTitle = useCallback((next: string) => {
    setTitle(next || "Untitled design");
  }, []);

  return {
    status,
    title,
    setTitle: updateTitle,
    docId,
    dirty,
    saveToCloud,
  };
}
