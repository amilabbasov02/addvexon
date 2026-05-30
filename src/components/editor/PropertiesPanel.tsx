"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorStore } from "./useEditorStore";
import type { Filters } from "./types";
import { AITextDialog } from "./AITextDialog";
import { ComingSoonDialog } from "./ComingSoonDialog";

/** Flip on when the backing AI endpoints are wired in production.  Until
 *  then the editor button still opens — it just shows a Coming Soon dialog
 *  so users see the feature exists and learn when it'll land. */
const AI_FEATURES_ENABLED =
  process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === "true";

const FONTS = ["Geist", "Inter", "Arial", "Helvetica", "Georgia", "Courier New", "Times New Roman"];
const WEIGHTS: Array<"400" | "500" | "600" | "700" | "900"> = ["400", "500", "600", "700", "900"];
const ALIGNS: Array<"left" | "center" | "right"> = ["left", "center", "right"];

const SWATCHES = [
  "#0b1326",
  "#171f33",
  "#d0bcff",
  "#a078ff",
  "#6d3bd7",
  "#00dbe7",
  "#adc6ff",
  "#ffb4ab",
  "#ffffff",
  "#000000",
];

function SwatchRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SWATCHES.map((c) => {
        const active = c.toLowerCase() === (value ?? "").toLowerCase();
        return (
          <button
            key={c}
            type="button"
            aria-label={`Pick ${c}`}
            title={c}
            className={
              "w-6 h-6 rounded-full border hover:scale-110 transition-transform " +
              (active
                ? "border-primary ring-2 ring-primary/50"
                : "border-white/15")
            }
            style={{ background: c }}
            onClick={() => onChange(c)}
          />
        );
      })}
    </div>
  );
}

/**
 * Numeric input that behaves correctly while the user is typing:
 * - keeps the raw text locally so transient values like "", "-", "1." work
 * - syncs external changes only when NOT focused (so canvas-driven drags
 *   update the field, but the field doesn't snap back mid-edit)
 * - selects all on focus (Figma-style — replace by overtyping)
 * - commits on blur / Enter, clamps to [min, max]
 */
function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const format = (v: number) => String(Math.round(v * 100) / 100);
  const [text, setText] = useState(() => format(value));
  const focused = useRef(false);

  // External value changed (drag, undo, etc.) — only overwrite when the field
  // isn't being edited.
  useEffect(() => {
    if (!focused.current) setText(format(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) {
      const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n));
      onChange(clamped);
      setText(format(clamped));
    } else {
      setText(format(value));
    }
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        step={step}
        onChange={(e) => {
          // No live commit — let the user clear, type freely, and only
          // push to the store on blur / Enter. Live commits made the field
          // feel sticky (each keystroke would clamp the in-flight value,
          // e.g. "1" → snaps to min=8 → "10" → 10 → "108" → 108 …).
          setText(e.target.value);
        }}
        onFocus={(e) => {
          focused.current = true;
          e.target.select();
        }}
        onBlur={(e) => {
          focused.current = false;
          commit(e.target.value);
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLInputElement;
          if (e.key === "Enter") {
            e.preventDefault();
            commit(target.value);
            target.blur();
          } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const delta = (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : step);
            const current = parseFloat(target.value) || 0;
            const next = current + delta;
            const clamped = Math.max(
              min ?? -Infinity,
              Math.min(max ?? Infinity, next),
            );
            setText(format(clamped));
            onChange(clamped);
          }
        }}
        className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <div className="flex items-center gap-2 bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/10"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-label-sm font-label-sm text-on-surface focus:outline-none"
        />
      </div>
    </label>
  );
}

function FiltersBlock({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const Slider = ({
    label,
    min,
    max,
    step,
    value,
    onChange,
  }: {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-on-surface-variant">
        <span>{label}</span>
        <span className="text-on-surface">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        Image Filters
      </p>
      <Slider
        label="Brightness"
        min={-1}
        max={1}
        step={0.05}
        value={filters.brightness}
        onChange={(v) => setFilters({ ...filters, brightness: v })}
      />
      <Slider
        label="Contrast"
        min={-100}
        max={100}
        step={1}
        value={filters.contrast}
        onChange={(v) => setFilters({ ...filters, contrast: v })}
      />
      <Slider
        label="Saturation"
        min={-2}
        max={10}
        step={0.1}
        value={filters.saturation}
        onChange={(v) => setFilters({ ...filters, saturation: v })}
      />
      <Slider
        label="Blur"
        min={0}
        max={40}
        step={1}
        value={filters.blur}
        onChange={(v) => setFilters({ ...filters, blur: v })}
      />
      <button
        type="button"
        className="w-full mt-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface py-1.5 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
        onClick={() =>
          setFilters({ brightness: 0, contrast: 0, saturation: 0, blur: 0 })
        }
      >
        Reset filters
      </button>
    </div>
  );
}

export function PropertiesPanel({
  store,
  showFilters,
  canUseAiText = false,
}: {
  store: EditorStore;
  showFilters?: boolean;
  canUseAiText?: boolean;
}) {
  const { selected, updateLayer, filters, setFilters, doc, setBackground } = store;
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <aside className="w-72 flex flex-col bg-surface-container/70 backdrop-blur-xl border-l border-white/10">
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          {selected ? "Properties" : "Canvas"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selected && (
          <>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Select a layer to edit its properties — or paint the canvas below.
            </p>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Canvas background
              </p>
              <ColorInput
                label="Background"
                value={doc.background}
                onChange={(v) => setBackground(v)}
              />
              <SwatchRow
                value={doc.background}
                onChange={(v) => setBackground(v)}
              />
            </div>
          </>
        )}

        {selected && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Name
              </span>
              <input
                type="text"
                value={selected.name}
                onChange={(e) =>
                  updateLayer(selected.id, { name: e.target.value })
                }
                className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="X"
                value={selected.x}
                onChange={(v) => updateLayer(selected.id, { x: v })}
              />
              <NumberInput
                label="Y"
                value={selected.y}
                onChange={(v) => updateLayer(selected.id, { y: v })}
              />
              <NumberInput
                label="Rotation"
                value={selected.rotation}
                onChange={(v) => updateLayer(selected.id, { rotation: v })}
              />
              <NumberInput
                label="Opacity"
                value={selected.opacity}
                step={0.05}
                min={0}
                max={1}
                onChange={(v) =>
                  updateLayer(selected.id, {
                    opacity: Math.max(0, Math.min(1, v)),
                  })
                }
              />
            </div>

            {selected.type === "text" && (
              <>
                <label className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Text
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiOpen(true)}
                      className="text-[10px] uppercase tracking-wider text-tertiary-fixed-dim hover:text-on-surface flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        auto_awesome
                      </span>
                      AI
                    </button>
                  </div>
                  <textarea
                    value={selected.text}
                    onChange={(e) =>
                      updateLayer(selected.id, { text: e.target.value })
                    }
                    rows={3}
                    className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Font size"
                    value={selected.fontSize}
                    min={8}
                    max={400}
                    onChange={(v) =>
                      updateLayer(selected.id, {
                        fontSize: Math.max(8, Math.min(400, v)),
                      })
                    }
                  />
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Weight
                    </span>
                    <select
                      value={selected.fontWeight}
                      onChange={(e) =>
                        updateLayer(selected.id, {
                          fontWeight: e.target.value as typeof WEIGHTS[number],
                        })
                      }
                      className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary"
                    >
                      {WEIGHTS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Font family
                  </span>
                  <select
                    value={selected.fontFamily}
                    onChange={(e) =>
                      updateLayer(selected.id, { fontFamily: e.target.value })
                    }
                    className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-1">
                  {ALIGNS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-label={`Align ${a}`}
                      className={
                        "flex-1 h-9 rounded-md border border-white/10 flex items-center justify-center transition-colors " +
                        (selected.align === a
                          ? "bg-primary-container/30 text-primary-fixed-dim border-primary/40"
                          : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface")
                      }
                      onClick={() => updateLayer(selected.id, { align: a })}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {a === "left"
                          ? "format_align_left"
                          : a === "center"
                            ? "format_align_center"
                            : "format_align_right"}
                      </span>
                    </button>
                  ))}
                </div>
                <ColorInput
                  label="Fill"
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
                <SwatchRow
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
              </>
            )}

            {selected.type === "rect" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Width"
                    value={selected.width}
                    min={8}
                    onChange={(v) =>
                      updateLayer(selected.id, { width: Math.max(8, v) })
                    }
                  />
                  <NumberInput
                    label="Height"
                    value={selected.height}
                    min={8}
                    onChange={(v) =>
                      updateLayer(selected.id, { height: Math.max(8, v) })
                    }
                  />
                </div>
                <NumberInput
                  label="Corner radius"
                  value={selected.cornerRadius}
                  min={0}
                  max={400}
                  onChange={(v) =>
                    updateLayer(selected.id, {
                      cornerRadius: Math.max(0, v),
                    })
                  }
                />
                <ColorInput
                  label="Fill"
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
                <SwatchRow
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
              </>
            )}

            {selected.type === "circle" && (
              <>
                <NumberInput
                  label="Radius"
                  value={selected.radius}
                  min={4}
                  onChange={(v) =>
                    updateLayer(selected.id, { radius: Math.max(4, v) })
                  }
                />
                <ColorInput
                  label="Fill"
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
                <SwatchRow
                  value={selected.fill}
                  onChange={(v) => updateLayer(selected.id, { fill: v })}
                />
              </>
            )}

            {selected.type === "image" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Width"
                    value={selected.width}
                    min={8}
                    onChange={(v) =>
                      updateLayer(selected.id, { width: Math.max(8, v) })
                    }
                  />
                  <NumberInput
                    label="Height"
                    value={selected.height}
                    min={8}
                    onChange={(v) =>
                      updateLayer(selected.id, { height: Math.max(8, v) })
                    }
                  />
                </div>
                <p className="text-xs text-on-surface-variant break-all">
                  Source: {selected.src.startsWith("data:") ? "uploaded" : selected.src}
                </p>
              </>
            )}
          </>
        )}

        {showFilters && (
          <div className="pt-4 border-t border-white/10">
            <FiltersBlock filters={filters} setFilters={setFilters} />
          </div>
        )}
      </div>

      {AI_FEATURES_ENABLED ? (
        <AITextDialog
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          canUseAi={canUseAiText}
          initialText={selected?.type === "text" ? selected.text : ""}
          defaultKind="variants"
          onApply={(text) => {
            if (selected?.type === "text") updateLayer(selected.id, { text });
          }}
        />
      ) : (
        <ComingSoonDialog
          open={aiOpen}
          feature="AI text generation"
          eta="June 2026"
          description="One-click headlines, sub-copy and CTAs generated in 4 brand-aware variants. The model is integrated — we're finishing the prod queue + safety filter."
          onClose={() => setAiOpen(false)}
        />
      )}
    </aside>
  );
}
