"use client";

import Link from "next/link";
import { useState } from "react";

type Kind = "headline" | "subhead" | "cta" | "body" | "variants";

const KINDS: { id: Kind; label: string; tip: string }[] = [
  { id: "headline", label: "Headline", tip: "Short, punchy main message" },
  { id: "subhead", label: "Sub-headline", tip: "Supporting context line" },
  { id: "cta", label: "CTA", tip: "Button label (1-3 words)" },
  { id: "body", label: "Body copy", tip: "Up to 30 words" },
  { id: "variants", label: "Rewrite", tip: "Variations of existing text" },
];

const TONES = ["luxury", "playful", "bold", "minimal", "technical", "friendly"];

export function AITextDialog({
  open,
  onClose,
  initialText,
  defaultKind,
  canUseAi,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  initialText: string;
  defaultKind?: Kind;
  canUseAi: boolean;
  onApply: (text: string) => void;
}) {
  const [kind, setKind] = useState<Kind>(defaultKind ?? "variants");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  if (!open) return null;

  const generate = async () => {
    setError(null);
    setVariants([]);
    setLoading(true);
    try {
      const resp = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          brief: brief.trim() || initialText || "Ad campaign",
          existing: kind === "variants" ? initialText : undefined,
          tone: tone || undefined,
          count: 5,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      setVariants(data.variants ?? []);
      if (typeof data.creditsRemaining === "number") {
        setCredits(data.creditsRemaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-2xl max-h-full flex flex-col glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-tertiary-fixed-dim">
                auto_awesome
              </span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                Generate with AI
              </h2>
            </div>
            <p className="text-on-surface-variant text-label-sm font-label-sm">
              {canUseAi
                ? credits !== null
                  ? `${credits} AI credits remaining this month`
                  : "Powered by Claude — 1 credit per generation"
                : "AI generation is a Pro feature"}
            </p>
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

        {!canUseAi ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-primary text-2xl">
                bolt
              </span>
            </div>
            <p className="text-on-surface font-label-md text-label-md mb-2">
              Pro feature
            </p>
            <p className="text-on-surface-variant text-body-md font-body-md mb-5 max-w-md mx-auto">
              AI text generation creates headlines, sub-heads, CTAs and copy
              variants in seconds. Upgrade to Pro for 100 AI credits / month.
            </p>
            <Link
              href="/pricing"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full inline-flex items-center gap-2 text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={
                    "px-3 py-2 rounded-lg text-label-sm font-label-sm transition-colors " +
                    (kind === k.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface")
                  }
                >
                  {k.label}
                </button>
              ))}
            </div>
            <p className="text-on-surface-variant text-label-sm font-label-sm -mt-2">
              {KINDS.find((k) => k.id === kind)?.tip}
            </p>

            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                {kind === "variants"
                  ? "Current text (to rewrite)"
                  : "Campaign brief"}
              </span>
              <textarea
                value={kind === "variants" ? initialText : brief}
                onChange={(e) =>
                  kind === "variants" ? null : setBrief(e.target.value)
                }
                placeholder={
                  kind === "variants"
                    ? "Select a text layer with content to rewrite."
                    : "Describe the product, audience, and offer — e.g. 'AI banner generator for marketing teams, free trial'"
                }
                readOnly={kind === "variants"}
                rows={3}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary resize-none"
              />
            </label>

            <div>
              <p className="text-label-sm font-label-sm text-on-surface-variant mb-2">
                Tone (optional)
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTone("")}
                  className={
                    "px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-colors " +
                    (tone === ""
                      ? "bg-on-surface text-surface"
                      : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface")
                  }
                >
                  Default
                </button>
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={
                      "px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-colors capitalize " +
                      (tone === t
                        ? "bg-on-surface text-surface"
                        : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="w-full ai-gradient text-on-primary font-label-md text-label-md py-3 rounded-xl hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Generating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate 5 options
                </>
              )}
            </button>

            {error && (
              <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Variants — click to apply
                </p>
                {variants.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onApply(v);
                      onClose();
                    }}
                    className="block w-full text-left glass-panel hover:border-primary/50 border border-white/10 rounded-xl p-3 text-on-surface text-label-md font-label-md transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
