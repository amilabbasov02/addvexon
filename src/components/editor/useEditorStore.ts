"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EditorDocument,
  Layer,
  RectLayer,
  CircleLayer,
  TextLayer,
  ImageLayer,
  Filters,
} from "./types";
import { DEFAULT_DOCUMENT, DEFAULT_FILTERS } from "./types";

const STORAGE_KEY = "addvoxen.editor.document";
const HISTORY_LIMIT = 50;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function useEditorStore(
  initial?: Partial<EditorDocument>,
  opts?: { skipHydration?: boolean },
) {
  const [doc, setDoc] = useState<EditorDocument>(() => ({
    ...DEFAULT_DOCUMENT,
    ...(initial ?? {}),
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const undoStack = useRef<EditorDocument[]>([]);
  const redoStack = useRef<EditorDocument[]>([]);
  const skipNextPush = useRef(false);

  // Hydrate from localStorage on mount (browser only). Skipped when caller
  // explicitly wants a clean slate — e.g. arriving via ?template= where the
  // brief flash of last-edited content would be confusing, or ?new=1 from
  // the dashboard's "New design" button.
  useEffect(() => {
    if (opts?.skipHydration) return;
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EditorDocument;
        if (parsed?.layers && parsed?.background && parsed?.canvasSize) {
          skipNextPush.current = true;
          setDoc(parsed);
        }
      }
    } catch {
      /* ignore corrupted state */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push to undo stack on every doc change (except hydration / undo / redo)
  const lastDoc = useRef<EditorDocument>(doc);
  useEffect(() => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      lastDoc.current = doc;
      return;
    }
    if (lastDoc.current === doc) return;
    undoStack.current.push(clone(lastDoc.current));
    if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    redoStack.current = [];
    lastDoc.current = doc;
  }, [doc]);

  const update = useCallback((updater: (d: EditorDocument) => EditorDocument) => {
    setDoc((d) => updater(d));
  }, []);

  /** Add a layer. `behind: true` puts it at the bottom of the z-stack
   *  (useful when a user uploads a photo that should sit UNDER the existing
   *  text & shapes instead of covering them). Default is "on top". */
  const addLayer = useCallback(
    (layer: Layer, opts?: { behind?: boolean }) => {
      update((d) => ({
        ...d,
        layers: opts?.behind ? [layer, ...d.layers] : [...d.layers, layer],
      }));
      setSelectedId(layer.id);
    },
    [update],
  );

  const addRect = useCallback(
    (overrides?: Partial<RectLayer>) => {
      const layer: RectLayer = {
        id: uid("rect"),
        name: "Rectangle",
        type: "rect",
        x: 80,
        y: 80,
        width: 320,
        height: 200,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fill: "#d0bcff",
        cornerRadius: 16,
        ...overrides,
      };
      addLayer(layer);
    },
    [addLayer],
  );

  const addCircle = useCallback(
    (overrides?: Partial<CircleLayer>) => {
      const layer: CircleLayer = {
        id: uid("circle"),
        name: "Circle",
        type: "circle",
        x: 200,
        y: 200,
        radius: 100,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fill: "#00dbe7",
        ...overrides,
      };
      addLayer(layer);
    },
    [addLayer],
  );

  const addText = useCallback(
    (overrides?: Partial<TextLayer>) => {
      const layer: TextLayer = {
        id: uid("text"),
        name: "Text",
        type: "text",
        x: 80,
        y: 80,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        text: "Headline Goes Here",
        fontSize: 64,
        fontFamily: "Geist",
        fontStyle: "normal",
        fontWeight: "700",
        align: "left",
        fill: "#dae2fd",
        ...overrides,
      };
      addLayer(layer);
    },
    [addLayer],
  );

  const addImage = useCallback(
    (
      src: string,
      width: number,
      height: number,
      overrides?: Partial<ImageLayer>,
      opts?: { behind?: boolean },
    ) => {
      const layer: ImageLayer = {
        id: uid("image"),
        name: "Image",
        type: "image",
        x: 80,
        y: 80,
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        src,
        ...overrides,
      };
      // Photos almost always belong under the existing copy/shapes — default to
      // back of the stack. Callers can opt out with `{ behind: false }`.
      addLayer(layer, { behind: opts?.behind ?? true });
    },
    [addLayer],
  );

  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      update((d) => ({
        ...d,
        layers: d.layers.map((l) =>
          l.id === id ? ({ ...l, ...patch } as Layer) : l,
        ),
      }));
    },
    [update],
  );

  const removeLayer = useCallback(
    (id: string) => {
      update((d) => ({ ...d, layers: d.layers.filter((l) => l.id !== id) }));
      setSelectedId((curr) => (curr === id ? null : curr));
    },
    [update],
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      let newId: string | null = null;
      update((d) => {
        const original = d.layers.find((l) => l.id === id);
        if (!original) return d;
        newId = uid(original.type);
        const copy = {
          ...clone(original),
          id: newId,
          x: original.x + 24,
          y: original.y + 24,
          name: `${original.name} copy`,
        } as Layer;
        return { ...d, layers: [...d.layers, copy] };
      });
      if (newId) setSelectedId(newId);
    },
    [update],
  );

  const reorderLayer = useCallback(
    (id: string, direction: "up" | "down" | "top" | "bottom") => {
      update((d) => {
        const i = d.layers.findIndex((l) => l.id === id);
        if (i === -1) return d;
        const next = [...d.layers];
        const [layer] = next.splice(i, 1);
        if (direction === "up") next.splice(Math.min(i + 1, next.length), 0, layer);
        else if (direction === "down") next.splice(Math.max(i - 1, 0), 0, layer);
        else if (direction === "top") next.push(layer);
        else next.unshift(layer);
        return { ...d, layers: next };
      });
    },
    [update],
  );

  const setBackground = useCallback(
    (background: string) => update((d) => ({ ...d, background })),
    [update],
  );

  /** Resize the canvas AND proportionally scale every layer so the design
   *  stays in-frame. This is what real banner editors do — switching from
   *  Story (1080×1920) to Feed (1200×628) without rescaling would chop off
   *  half the content. Width scales by sx, height by sy, fontSize / radius
   *  by min(sx, sy) so type stays uniformly sized rather than stretching. */
  const setCanvasSize = useCallback(
    (canvasSize: { width: number; height: number }) =>
      update((d) => {
        const oldW = d.canvasSize.width;
        const oldH = d.canvasSize.height;
        if (oldW === canvasSize.width && oldH === canvasSize.height) return d;
        const sx = canvasSize.width / oldW;
        const sy = canvasSize.height / oldH;
        const sMin = Math.min(sx, sy);
        const layers = d.layers.map((l) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const next: any = { ...l, x: l.x * sx, y: l.y * sy };
          if (l.type === "rect" || l.type === "image") {
            next.width = l.width * sx;
            next.height = l.height * sy;
          }
          if (l.type === "circle") {
            next.radius = l.radius * sMin;
          }
          if (l.type === "text") {
            next.fontSize = Math.max(8, l.fontSize * sMin);
            if (l.width !== undefined) next.width = l.width * sx;
          }
          return next as Layer;
        });
        return { ...d, canvasSize, layers };
      }),
    [update],
  );

  /** Bare resize without scaling layers — for cases where the caller wants
   *  to swap dimensions without touching content (e.g. loading a template
   *  document that already has its own layer coordinates). */
  const setCanvasSizeRaw = useCallback(
    (canvasSize: { width: number; height: number }) =>
      update((d) => ({ ...d, canvasSize })),
    [update],
  );

  const reset = useCallback(() => {
    setDoc(DEFAULT_DOCUMENT);
    setSelectedId(null);
  }, []);

  /** Load a brand-new document (e.g. when a template is picked). Layer IDs
   *  are re-stamped so they're unique within this session — templates are
   *  shared structures that may be re-loaded multiple times. History is
   *  reset too, since previous undo states wouldn't make sense. */
  const loadDocument = useCallback((next: EditorDocument) => {
    const stamped: EditorDocument = {
      ...next,
      layers: next.layers.map((l) => ({
        ...clone(l),
        id: `${l.type}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`,
      })),
    };
    undoStack.current = [];
    redoStack.current = [];
    skipNextPush.current = true;
    setSelectedId(null);
    setDoc(stamped);
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      return true;
    } catch {
      return false;
    }
  }, [doc]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return false;
    redoStack.current.push(clone(lastDoc.current));
    skipNextPush.current = true;
    setDoc(prev);
    return true;
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return false;
    undoStack.current.push(clone(lastDoc.current));
    skipNextPush.current = true;
    setDoc(next);
    return true;
  }, []);

  const selected = useMemo(
    () => doc.layers.find((l) => l.id === selectedId) ?? null,
    [doc.layers, selectedId],
  );

  return {
    doc,
    setDoc,
    selectedId,
    setSelectedId,
    selected,
    filters,
    setFilters,
    addRect,
    addCircle,
    addText,
    addImage,
    updateLayer,
    removeLayer,
    duplicateLayer,
    reorderLayer,
    setBackground,
    setCanvasSize,
    setCanvasSizeRaw,
    reset,
    loadDocument,
    save,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}

export type EditorStore = ReturnType<typeof useEditorStore>;
