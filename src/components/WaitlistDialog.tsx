"use client";

import { useState } from "react";

export function WaitlistDialog({
  open,
  defaultPlan,
  defaultEmail,
  onClose,
}: {
  open: boolean;
  defaultPlan: "pro" | "team" | "enterprise";
  defaultEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const plan = defaultPlan;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const resp = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          plan,
          company: company.trim() || undefined,
          teamSize: teamSize.trim() || undefined,
          notes: notes.trim() || undefined,
          referrer:
            typeof window !== "undefined" ? window.location.href : undefined,
          locale:
            typeof navigator !== "undefined" ? navigator.language : undefined,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${resp.status})`);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const planLabel =
    plan === "pro" ? "Pro" : plan === "team" ? "Team" : "Enterprise";

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
              {planLabel} early access
            </p>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              Get notified at launch
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
              You're on the list.
            </p>
            <p className="text-on-surface-variant text-body-md font-body-md mb-5 max-w-md mx-auto">
              We'll reach out the moment {planLabel} access opens. Until then,
              keep designing — your work is saved automatically.
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
          <form onSubmit={submit} className="p-6 space-y-4">
            <p className="text-on-surface-variant text-body-md font-body-md">
              We're rolling out paid plans gradually. Drop your details and
              we'll reach out personally — usually within 48 hours.
            </p>

            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Email *
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                placeholder="you@company.com"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                placeholder="Your name"
              />
            </label>

            {plan !== "pro" && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    Company
                  </span>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="Acme Inc"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    Team size
                  </span>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Pick one…</option>
                    <option value="1-3">1–3</option>
                    <option value="4-10">4–10</option>
                    <option value="11-50">11–50</option>
                    <option value="50+">50+</option>
                  </select>
                </label>
              </>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                What do you want to design? (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary resize-none"
                placeholder="Social ads, Google display banners, in-app promos…"
              />
            </label>

            {error && (
              <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full ai-gradient text-on-primary font-label-md text-label-md py-3 rounded-full hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {submitting ? "Joining…" : `Join ${planLabel} waitlist`}
            </button>

            <p className="text-center text-on-surface-variant text-xs">
              No payment now. We'll email you when access opens.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
