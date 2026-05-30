"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorStore } from "./useEditorStore";
import { TEMPLATE_PRESETS } from "./types";

const ICON: Record<string, string> = {
  text: "title",
  rect: "rectangle",
  circle: "circle",
  image: "image",
};

/** Canvas-size input that lets the user clear the field and retype freely;
 *  commits only on blur / Enter (clamped 50…4000). Native `<input type=number>`
 *  was rejecting empty strings, snapping back to 50 on every backspace. */
function SizeInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);
  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) {
      const c = Math.max(50, Math.min(4000, n));
      onCommit(c);
      setText(String(c));
    } else {
      setText(String(value));
    }
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => {
        focused.current = true;
        e.target.select();
      }}
      onBlur={(e) => {
        focused.current = false;
        commit(e.target.value);
      }}
      onKeyDown={(e) => {
        const t = e.target as HTMLInputElement;
        if (e.key === "Enter") {
          e.preventDefault();
          commit(t.value);
          t.blur();
        }
      }}
      className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary"
    />
  );
}

export function LayersPanel({ store }: { store: EditorStore }) {
  const {
    doc,
    selectedId,
    setSelectedId,
    removeLayer,
    duplicateLayer,
    reorderLayer,
    updateLayer,
    setCanvasSize,
    reset,
  } = store;

  // Render layers in visual top-to-bottom order (last in array = top of canvas)
  const ordered = [...doc.layers].reverse();

  return (
    <aside className="w-64 flex flex-col bg-surface-container/70 backdrop-blur-xl border-r border-white/10">
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          Canvas Size
        </p>
        <select
          className="mt-2 w-full bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
          value={
            TEMPLATE_PRESETS.find(
              (p) =>
                p.size.width === doc.canvasSize.width &&
                p.size.height === doc.canvasSize.height,
            )?.id ?? "custom"
          }
          onChange={(e) => {
            const preset = TEMPLATE_PRESETS.find((p) => p.id === e.target.value);
            if (preset) setCanvasSize(preset.size);
          }}
        >
          {TEMPLATE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <div className="flex items-center gap-2 mt-2">
          <SizeInput
            value={doc.canvasSize.width}
            onCommit={(v) =>
              setCanvasSize({ ...doc.canvasSize, width: v })
            }
          />
          <span className="text-on-surface-variant">×</span>
          <SizeInput
            value={doc.canvasSize.height}
            onCommit={(v) =>
              setCanvasSize({ ...doc.canvasSize, height: v })
            }
          />
        </div>
        <p className="text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
          Resizing scales every layer proportionally so the design stays in-frame.
        </p>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          Layers ({doc.layers.length})
        </p>
        <button
          type="button"
          className="text-xs text-on-surface-variant hover:text-error transition-colors"
          onClick={() => {
            if (confirm("Clear all layers and reset canvas?")) reset();
          }}
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {ordered.length === 0 ? (
          <p className="text-center text-xs text-on-surface-variant px-4 py-8 leading-relaxed">
            No layers yet. Use the toolbar to add text, shapes or images.
          </p>
        ) : (
          ordered.map((layer) => {
            const active = layer.id === selectedId;
            return (
              <div
                key={layer.id}
                className={
                  "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors " +
                  (active
                    ? "bg-primary-container/30 border border-primary/40"
                    : "hover:bg-white/5 border border-transparent")
                }
                onClick={() => setSelectedId(layer.id)}
              >
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant"
                  aria-hidden
                >
                  {ICON[layer.type]}
                </span>
                <span className="flex-1 truncate text-label-sm font-label-sm text-on-surface">
                  {layer.name}
                </span>
                <button
                  type="button"
                  aria-label={layer.visible ? "Hide" : "Show"}
                  className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-on-surface"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { visible: !layer.visible });
                  }}
                >
                  {layer.visible ? "visibility" : "visibility_off"}
                </button>
                <button
                  type="button"
                  aria-label={layer.locked ? "Unlock" : "Lock"}
                  className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-on-surface"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { locked: !layer.locked });
                  }}
                >
                  {layer.locked ? "lock" : "lock_open"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedId && (
        <div className="border-t border-white/10 p-2 space-y-1">
          <p className="px-1 text-[10px] uppercase tracking-wider text-on-surface-variant">
            Layer order
          </p>
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              title="Bring to front (Ctrl+Shift+])"
              aria-label="Bring to front"
              className="h-9 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={() => reorderLayer(selectedId, "top")}
            >
              <span className="material-symbols-outlined text-[18px]">vertical_align_top</span>
            </button>
            <button
              type="button"
              title="Bring forward (Ctrl+])"
              aria-label="Bring forward"
              className="h-9 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={() => reorderLayer(selectedId, "up")}
            >
              <span className="material-symbols-outlined text-[18px]">expand_less</span>
            </button>
            <button
              type="button"
              title="Send backward (Ctrl+[)"
              aria-label="Send backward"
              className="h-9 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={() => reorderLayer(selectedId, "down")}
            >
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <button
              type="button"
              title="Send to back (Ctrl+Shift+[)"
              aria-label="Send to back"
              className="h-9 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={() => reorderLayer(selectedId, "bottom")}
            >
              <span className="material-symbols-outlined text-[18px]">vertical_align_bottom</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              title="Duplicate (Ctrl+D)"
              aria-label="Duplicate"
              className="h-9 rounded-md flex items-center justify-center gap-1 text-label-sm font-label-sm text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              onClick={() => duplicateLayer(selectedId)}
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Duplicate
            </button>
            <button
              type="button"
              title="Delete (Del)"
              aria-label="Delete"
              className="h-9 rounded-md flex items-center justify-center gap-1 text-label-sm font-label-sm text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors"
              onClick={() => removeLayer(selectedId)}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
