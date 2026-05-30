"use client";

import { useState } from "react";
import Link from "next/link";
import type { EditorDocument } from "./types";
import { EXPORT_PACKS, findFormatBySize, type Pack } from "@/lib/ad-formats";
import {
  exportPNG,
  exportJPG,
  exportPDF,
  exportHTML5,
  exportPack,
  triggerDownload,
} from "@/lib/export-engine";

type Tab = "this" | "packs";

const PLATFORM_COLOR: Record<string, string> = {
  meta: "from-blue-500 to-purple-500",
  google: "from-yellow-400 to-rose-500",
  tiktok: "from-fuchsia-500 to-cyan-400",
  youtube: "from-rose-500 to-red-600",
  linkedin: "from-sky-500 to-blue-700",
  twitter: "from-slate-400 to-slate-700",
  pinterest: "from-rose-600 to-red-500",
  snapchat: "from-yellow-300 to-yellow-500",
  print: "from-emerald-500 to-teal-600",
  universal: "from-primary to-tertiary",
};

export function ExportDialog({
  open,
  onClose,
  doc,
  canExportClean,
}: {
  open: boolean;
  onClose: () => void;
  doc: EditorDocument;
  canExportClean: boolean;
}) {
  const [tab, setTab] = useState<Tab>("this");
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // HTML5 click destination — gets baked into the clickTag JS variable.
  const [clickUrl, setClickUrl] = useState<string>("");

  if (!open) return null;

  const currentFormat = findFormatBySize(doc.canvasSize.width, doc.canvasSize.height);

  /** Ask the server to gate + record this export. If it returns 429 we surface
   *  the upgrade error and don't run the render at all. */
  const trackExport = async (): Promise<boolean> => {
    try {
      const r = await fetch("/api/me/track-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (r.status === 429) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        setError(
          data.error ??
            "You've used your free export. Upgrade to Pro for unlimited exports.",
        );
        return false;
      }
      return true;
    } catch {
      // If telemetry fails, don't block the user — fall through.
      return true;
    }
  };

  const handleSingle = async (kind: "png" | "jpg" | "pdf" | "html5") => {
    setError(null);
    setBusy(kind);
    try {
      // Gate first — if the user has burned their free export, abort cleanly.
      const allowed = await trackExport();
      if (!allowed) {
        setBusy(null);
        return;
      }
      const opts = { watermark: !canExportClean, pixelRatio: 2 };
      let result;
      if (kind === "png") result = await exportPNG(doc, opts);
      else if (kind === "jpg") result = await exportJPG(doc, opts);
      else if (kind === "pdf") result = await exportPDF(doc, opts);
      else result = await exportHTML5(doc, { ...opts, clickUrl });
      triggerDownload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const handlePack = async (pack: Pack) => {
    setError(null);
    setBusy(pack.id);
    setProgress({ done: 0, total: pack.formats.length, label: pack.formats[0]?.name ?? "" });
    try {
      const allowed = await trackExport();
      if (!allowed) {
        setBusy(null);
        setProgress(null);
        return;
      }
      const result = await exportPack(doc, pack.formats, {
        watermark: !canExportClean,
        pixelRatio: 2,
        packLabel: pack.label,
        progress: (done, total, label) => setProgress({ done, total, label }),
      });
      triggerDownload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pack export failed");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-3xl max-h-full flex flex-col glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
              Export your design
            </p>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              {tab === "this" ? "This canvas" : "Platform packs"}
            </h2>
            {!canExportClean && (
              <p className="text-on-surface-variant text-label-sm font-label-sm mt-1">
                Free plan: a small "Made with Addvoxen" badge will be added.{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  Remove with Pro
                </Link>
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="material-symbols-outlined w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white/5"
          >
            close
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          <button
            type="button"
            onClick={() => setTab("this")}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors " +
              (tab === "this"
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface")
            }
          >
            This size
          </button>
          <button
            type="button"
            onClick={() => setTab("packs")}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors " +
              (tab === "packs"
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface")
            }
          >
            Platform packs
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "this" ? (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high/60 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    aspect_ratio
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-on-surface font-label-md text-label-md">
                    {doc.canvasSize.width} × {doc.canvasSize.height} px
                  </p>
                  <p className="text-on-surface-variant text-label-sm font-label-sm">
                    {currentFormat
                      ? `${currentFormat.name} · ${currentFormat.placement}`
                      : "Custom canvas"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ExportCard
                  icon="image"
                  title="PNG"
                  description="Lossless. Best for most static ads."
                  onClick={() => handleSingle("png")}
                  loading={busy === "png"}
                />
                <ExportCard
                  icon="photo_library"
                  title="JPG"
                  description="Smaller file. Best for photo-heavy."
                  onClick={() => handleSingle("jpg")}
                  loading={busy === "jpg"}
                />
                <ExportCard
                  icon="picture_as_pdf"
                  title="PDF"
                  description="Print-ready. Single page."
                  onClick={() => handleSingle("pdf")}
                  loading={busy === "pdf"}
                />
                <ExportCard
                  icon="code"
                  title="HTML5"
                  description="Click-tag banner zip for Google Ads / DV360."
                  onClick={() => handleSingle("html5")}
                  loading={busy === "html5"}
                  highlight
                />
              </div>

              {/* HTML5 click-through destination — gets injected into the
               *  banner's clickTag variable. Ad servers can override at
               *  serve-time, but a sensible default makes the standalone
               *  preview clickable straight away. */}
              <div className="glass-panel rounded-xl p-4 flex flex-col gap-2 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">
                    link
                  </span>
                  <p className="text-on-surface text-label-md font-label-md">
                    HTML5 click destination
                  </p>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider ml-auto">
                    Optional
                  </span>
                </div>
                <input
                  type="url"
                  value={clickUrl}
                  onChange={(e) => setClickUrl(e.target.value)}
                  placeholder="https://your-landing-page.com"
                  className="w-full bg-surface-container-high/60 border border-white/10 rounded-md px-3 py-2 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
                />
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Baked into the banner as the <code>clickTag</code> JS variable
                  so clicks land on your landing page when the ad isn&apos;t
                  served through a network. Ad servers (Google Ads, DV360,
                  etc.) override this at serve time.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-on-surface-variant text-body-md font-body-md">
                Magic Resize will adapt your design to every size in the pack
                and bundle them in a ZIP — ready to upload to your ad
                manager.
              </p>
              {EXPORT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => handlePack(pack)}
                  disabled={busy !== null}
                  className="w-full text-left flex items-center gap-4 glass-panel rounded-2xl p-4 hover:border-primary/50 border border-white/10 transition-all disabled:opacity-60"
                >
                  <div
                    className={
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 " +
                      (PLATFORM_COLOR[pack.platforms[0]] ?? PLATFORM_COLOR.universal)
                    }
                  >
                    <span className="material-symbols-outlined text-white">
                      {pack.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-label-md text-label-md">
                      {pack.label}
                    </p>
                    <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
                      {pack.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-on-surface-variant text-label-sm font-label-sm">
                      {pack.formats.length} sizes
                    </span>
                    {busy === pack.id ? (
                      <span className="material-symbols-outlined animate-spin text-primary text-[20px]">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        download
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {progress && (
            <div className="mt-4 glass-panel rounded-xl p-4">
              <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-2">
                <span>Generating: {progress.label}</span>
                <span>
                  {progress.done} / {progress.total}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full ai-gradient transition-all"
                  style={{
                    width: `${(progress.done / Math.max(1, progress.total)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-on-surface-variant text-xs">
            Coming soon: 1-click campaign launch to Meta, Google Ads, TikTok
            with built-in performance analytics.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-full transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  description,
  onClick,
  loading,
  highlight,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        "text-left flex flex-col gap-2 glass-panel rounded-2xl p-4 border transition-all disabled:opacity-60 " +
        (highlight
          ? "border-primary/40 hover:border-primary hover:shadow-[0_0_24px_rgba(208,188,255,0.25)]"
          : "border-white/10 hover:border-primary/50")
      }
    >
      <div
        className={
          "w-10 h-10 rounded-xl flex items-center justify-center " +
          (highlight ? "ai-gradient" : "bg-primary-container/20")
        }
      >
        {loading ? (
          <span
            className={
              "material-symbols-outlined animate-spin " +
              (highlight ? "text-on-primary" : "text-primary")
            }
          >
            progress_activity
          </span>
        ) : (
          <span
            className={
              "material-symbols-outlined " +
              (highlight ? "text-on-primary" : "text-primary")
            }
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <p className="text-on-surface font-label-md text-label-md">{title}</p>
        {highlight && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded">
            New
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-label-sm font-label-sm leading-relaxed">
        {description}
      </p>
    </button>
  );
}
