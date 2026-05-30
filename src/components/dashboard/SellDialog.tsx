"use client";

import { useState } from "react";

const CATEGORIES = [
  "Editorial",
  "Tech",
  "Promo",
  "Social",
  "Web Banner",
  "Business",
  "Video",
  "Print",
];

const SUGGESTED_PRICES = [0, 500, 900, 1500, 2900, 4900];

export function SellDialog({
  open,
  document,
  onClose,
  onSuccess,
}: {
  open: boolean;
  document: { id: string; title: string };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(document.title);
  const [category, setCategory] = useState("Editorial");
  const [tagline, setTagline] = useState("");
  const [priceDollars, setPriceDollars] = useState(9);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const resp = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          name,
          category,
          tagline,
          priceCents: Math.round(priceDollars * 100),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? "Could not submit listing");
        return;
      }
      setDone(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const platformCut = Math.round(priceDollars * 0.3 * 100) / 100;
  const creatorCut = Math.round(priceDollars * 0.7 * 100) / 100;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
              Marketplace listing
            </p>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              Sell this design
            </h2>
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

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-tertiary text-2xl">
                check_circle
              </span>
            </div>
            <p className="text-on-surface font-label-md text-label-md mb-2">
              Submitted for review
            </p>
            <p className="text-on-surface-variant text-body-md font-body-md mb-5 max-w-md mx-auto">
              We'll quickly review your listing and publish it on the
              marketplace once approved. You'll be notified by email.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md"
            >
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-5">
            <p className="text-on-surface-variant text-body-md font-body-md">
              List your design on the Addvoxen marketplace. Set a price — you
              keep <strong className="text-on-surface">70%</strong>, we
              handle the storefront, hosting and (when paid plans go live)
              the payouts.
            </p>

            <label className="block">
              <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                Listing name
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                placeholder="e.g. Neon SaaS Launch Banner"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                  Price (USD)
                </span>
                <div className="flex items-center gap-1 bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5">
                  <span className="text-on-surface-variant">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={priceDollars}
                    onChange={(e) => setPriceDollars(parseFloat(e.target.value) || 0)}
                    className="bg-transparent text-on-surface focus:outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PRICES.map((cents) => {
                const v = cents / 100;
                return (
                  <button
                    key={cents}
                    type="button"
                    onClick={() => setPriceDollars(v)}
                    className={
                      "px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-colors " +
                      (priceDollars === v
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface")
                    }
                  >
                    {v === 0 ? "Free" : `$${v}`}
                  </button>
                );
              })}
            </div>

            <label className="block">
              <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                Short description (optional)
              </span>
              <textarea
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                rows={2}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary resize-none"
                placeholder="Editorial headline + CTA pill — for SaaS launches"
              />
            </label>

            <div className="glass-panel rounded-xl p-4 grid grid-cols-2 gap-2 text-label-sm font-label-sm">
              <div>
                <p className="text-on-surface-variant">Buyer pays</p>
                <p className="text-on-surface font-bold text-label-md">
                  ${priceDollars.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">You earn / sale</p>
                <p className="text-tertiary-fixed-dim font-bold text-label-md">
                  ${creatorCut.toFixed(2)}{" "}
                  <span className="text-xs text-on-surface-variant">
                    (platform ${platformCut.toFixed(2)})
                  </span>
                </p>
              </div>
            </div>

            {error && (
              <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface px-5 py-2.5 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
