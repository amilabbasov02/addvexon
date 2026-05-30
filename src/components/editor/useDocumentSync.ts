"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EditorStore } from "./useEditorStore";

const SYNC_DEBOUNCE_MS = 1200;

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
  | "error"
  | "loading"
  | "anonymous";

/**
 * Two-way sync between the in-memory editor store and the user's cloud
 * documents.
 *
 *   - If signed in AND ?doc=ID is in the URL → fetch + hydrate
 *   - If signed in AND no ?doc → on first edit, POST to create + update URL
 *   - If signed out → leave the store alone; localStorage save still works
 *   - Every doc mutation triggers a debounced PATCH while signed in
 *
 * Returns a status string and a title setter that the editor header can show.
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

  // --- Debounced save on every store change -------------------------------
  const docSnapshotRef = useRef(JSON.stringify(store.doc));

  useEffect(() => {
    if (!enabled || !signedIn) return;
    if (!initialHydrated.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      docSnapshotRef.current = JSON.stringify(store.doc);
      return;
    }

    const snapshot = JSON.stringify(store.doc);
    if (snapshot === docSnapshotRef.current) return; // no real change
    docSnapshotRef.current = snapshot;

    const timer = window.setTimeout(async () => {
      try {
        setStatus("saving");

        if (!docId) {
          // First save → create document
          const resp = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              canvasSize: store.doc.canvasSize,
              background: store.doc.background,
              layers: store.doc.layers,
            }),
          });
          if (!resp.ok) throw new Error(`Create failed: ${resp.status}`);
          const { id } = (await resp.json()) as { id: string };
          setDocId(id);
          const params = new URLSearchParams(window.location.search);
          params.set("doc", id);
          router.replace(`/editor?${params.toString()}`, { scroll: false });
        } else {
          // Subsequent saves → patch
          const resp = await fetch(`/api/documents/${docId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              canvasSize: store.doc.canvasSize,
              background: store.doc.background,
              layers: store.doc.layers,
            }),
          });
          if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
        }
        lastSavedAt.current = Date.now();
        setStatus("saved");
      } catch (err) {
        console.error("Cloud sync failed:", err);
        setStatus("error");
      }
    }, SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.doc, title, docId, signedIn, enabled]);

  const updateTitle = useCallback((next: string) => {
    setTitle(next || "Untitled design");
  }, []);

  return { status, title, setTitle: updateTitle, docId };
}
