"use client";

import Link from "next/link";

/**
 * Drop-in dialog for features that exist in the UI but aren't wired to a
 * backend yet (AI text, AI image, animation timeline, …). Keeps the visual
 * affordance honest — the button works, the user just learns they're on the
 * roadmap with an ETA instead of seeing a broken loading state.
 */
export function ComingSoonDialog({
  open,
  feature,
  eta,
  description,
  onClose,
}: {
  open: boolean;
  feature: string;
  eta?: string;
  description?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4">
      <div className="relative w-full max-w-md bg-surface-container-high border border-white/15 rounded-3xl shadow-2xl p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-on-primary text-2xl">
            auto_awesome
          </span>
        </div>
        <p className="text-tertiary-fixed-dim text-label-sm font-label-sm uppercase tracking-wider mb-1">
          Coming soon
        </p>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
          {feature}
        </h2>
        <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
          {description ??
            `${feature} isn't live yet — we're wiring it to the production AI engine and rolling it out shortly.`}
        </p>
        {eta && (
          <p className="mt-3 text-on-surface-variant text-label-sm font-label-sm">
            Estimated launch: <span className="text-on-surface">{eta}</span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 glass-panel px-4 py-2.5 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface"
          >
            Got it
          </button>
          <Link
            href="/about#roadmap"
            onClick={onClose}
            className="flex-1 text-center ai-gradient text-on-primary px-4 py-2.5 rounded-full text-label-md font-label-md"
          >
            See roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
