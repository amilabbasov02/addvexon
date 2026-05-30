"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TEMPLATES } from "./templates";
import type { Template } from "./templates";

type RemoteTemplate = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  tier: "free" | "pro";
  document: {
    canvasSize: { width: number; height: number };
    background: string;
    layers: unknown[];
  };
};

const CATEGORIES: Template["category"][] = [
  "Editorial",
  "Tech",
  "Promo",
  "Social",
  "Web Banner",
  "Blank",
];

function TemplateThumbnail({ template }: { template: Template }) {
  const { canvasSize, background, layers } = template.document;
  const VBW = canvasSize.width;
  const VBH = canvasSize.height;
  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block"
      style={{ background }}
      aria-hidden
    >
      {layers.map((layer) => {
        if (!layer.visible) return null;
        const op = layer.opacity ?? 1;
        const rot = layer.rotation ?? 0;
        const transform = `rotate(${rot} ${layer.x} ${layer.y})`;
        if (layer.type === "rect") {
          return (
            <rect
              key={layer.id}
              x={layer.x}
              y={layer.y}
              width={layer.width}
              height={layer.height}
              rx={layer.cornerRadius}
              ry={layer.cornerRadius}
              fill={layer.fill}
              opacity={op}
              transform={transform}
              stroke={layer.stroke}
              strokeWidth={layer.strokeWidth ?? 0}
            />
          );
        }
        if (layer.type === "circle") {
          return (
            <circle
              key={layer.id}
              cx={layer.x}
              cy={layer.y}
              r={layer.radius}
              fill={layer.fill}
              opacity={op}
            />
          );
        }
        if (layer.type === "text") {
          // Multi-line text — render one <text> with <tspan> per line
          const lines = layer.text.split("\n");
          const lh = layer.fontSize * 1.05;
          return (
            <text
              key={layer.id}
              x={layer.x}
              y={layer.y + layer.fontSize * 0.85}
              fill={layer.fill}
              fontFamily={layer.fontFamily}
              fontSize={layer.fontSize}
              fontWeight={layer.fontWeight}
              fontStyle={layer.fontStyle}
              opacity={op}
              transform={transform}
              textAnchor={
                layer.align === "center"
                  ? "middle"
                  : layer.align === "right"
                    ? "end"
                    : "start"
              }
            >
              {lines.map((line, i) => (
                <tspan
                  key={i}
                  x={
                    layer.align === "center"
                      ? layer.x + (layer.width ?? 0) / 2
                      : layer.align === "right"
                        ? layer.x + (layer.width ?? 0)
                        : layer.x
                  }
                  dy={i === 0 ? 0 : lh}
                >
                  {line || " "}
                </tspan>
              ))}
            </text>
          );
        }
        if (layer.type === "image") {
          return (
            <image
              key={layer.id}
              href={layer.src}
              x={layer.x}
              y={layer.y}
              width={layer.width}
              height={layer.height}
              opacity={op}
              transform={transform}
              preserveAspectRatio="xMidYMid slice"
            />
          );
        }
        return null;
      })}
    </svg>
  );
}

export function TemplatePicker({
  open,
  onPick,
  onClose,
  closable = false,
  canAccessPro = true,
}: {
  open: boolean;
  onPick: (template: Template) => void;
  onClose?: () => void;
  closable?: boolean;
  /** When false, Pro templates appear locked with an upgrade CTA. */
  canAccessPro?: boolean;
}) {
  const [remote, setRemote] = useState<RemoteTemplate[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/templates?limit=60")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { templates?: RemoteTemplate[] } | null) => {
        if (!cancelled && data?.templates) setRemote(data.templates);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  // Merge remote (DB) + local catalog as a fallback. Remote wins on slug
  // collisions so DB always reflects the latest.
  const localAsTemplate = TEMPLATES.map((t) => ({
    slug: t.id,
    name: t.name,
    category: t.category,
    tagline: t.tagline,
    tier: "free" as const,
    document: t.document,
  }));
  const remoteSlugs = new Set((remote ?? []).map((r) => r.slug));
  const merged: Array<{
    slug: string;
    name: string;
    category: string;
    tagline: string | null;
    tier: string;
    document: Template["document"];
  }> = [
    ...(remote ?? []).map((r) => ({
      slug: r.slug,
      name: r.name,
      category: r.category,
      tagline: r.tagline,
      tier: r.tier,
      document: r.document as Template["document"],
    })),
    ...localAsTemplate.filter((t) => !remoteSlugs.has(t.slug)),
  ];

  const categories = Array.from(new Set(merged.map((t) => t.category)));
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-6xl max-h-full flex flex-col glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between px-8 py-6 border-b border-white/10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
              Choose a starting point
            </p>
            <h2 className="font-display-sm text-display-sm font-bold text-on-surface">
              Pick a template
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Edit any layer — text, shapes, colors, and images are all
              draggable on the canvas.
            </p>
          </div>
          {closable && onClose && (
            <button
              type="button"
              aria-label="Close template picker"
              onClick={onClose}
              className="material-symbols-outlined w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              close
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {categories.map((cat) => {
            const items = merged.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="mb-10 last:mb-0">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mb-4">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {items.map((t) => {
                    const aspect =
                      t.document.canvasSize.width /
                      t.document.canvasSize.height;
                    const locked = t.tier === "pro" && !canAccessPro;
                    return (
                      <div
                        key={t.slug}
                        className={
                          "relative group flex flex-col bg-surface-container-low/70 border border-white/10 rounded-2xl overflow-hidden transition-all " +
                          (locked
                            ? "opacity-90"
                            : "hover:bg-surface-container hover:border-primary/40 hover:shadow-[0_0_30px_rgba(208,188,255,0.15)]")
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (locked) return;
                            onPick({
                              id: t.slug,
                              name: t.name,
                              category: t.category as Template["category"],
                              tagline: t.tagline ?? "",
                              document: t.document,
                            });
                          }}
                          className={
                            "block w-full text-left " +
                            (locked
                              ? "cursor-default"
                              : "active:scale-[0.99] transition-transform")
                          }
                        >
                          <div
                            className="relative w-full overflow-hidden bg-surface-container-lowest"
                            style={{
                              aspectRatio: String(aspect.toFixed(3)),
                              maxHeight: 280,
                            }}
                          >
                            <TemplateThumbnail
                              template={{
                                id: t.slug,
                                name: t.name,
                                category: t.category as Template["category"],
                                tagline: t.tagline ?? "",
                                document: t.document,
                              }}
                            />
                            {t.tier === "pro" && (
                              <span className="absolute top-2 right-2 ai-gradient text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                Pro
                              </span>
                            )}
                            {locked && (
                              <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl">
                                  lock
                                </span>
                                <span className="text-on-surface text-label-sm font-label-sm">
                                  Pro template
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-label-md text-label-md text-on-surface truncate">
                                {t.name}
                              </p>
                              <span className="shrink-0 text-[10px] uppercase tracking-wider text-on-surface-variant">
                                {t.document.canvasSize.width}×
                                {t.document.canvasSize.height}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant truncate">
                              {t.tagline}
                            </p>
                          </div>
                        </button>
                        {locked && (
                          <Link
                            href="/pricing"
                            className="absolute inset-x-4 bottom-4 ai-gradient text-on-primary text-center py-2 rounded-full text-label-sm font-label-sm hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Unlock with Pro
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
