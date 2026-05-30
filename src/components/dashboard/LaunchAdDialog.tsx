"use client";

import { useState } from "react";

const PLATFORMS: { id: string; label: string; icon: string; gradient: string }[] = [
  { id: "meta", label: "Meta (FB + IG)", icon: "share", gradient: "from-blue-500 to-purple-500" },
  { id: "google", label: "Google Ads", icon: "ads_click", gradient: "from-yellow-400 to-rose-500" },
  { id: "tiktok", label: "TikTok", icon: "movie", gradient: "from-fuchsia-500 to-cyan-400" },
  { id: "linkedin", label: "LinkedIn", icon: "work", gradient: "from-sky-500 to-blue-700" },
  { id: "twitter", label: "X / Twitter", icon: "tag", gradient: "from-slate-400 to-slate-700" },
  { id: "pinterest", label: "Pinterest", icon: "push_pin", gradient: "from-rose-600 to-red-500" },
  { id: "snapchat", label: "Snapchat", icon: "photo_camera", gradient: "from-yellow-300 to-yellow-500" },
];

const OBJECTIVES = [
  { id: "traffic", label: "Traffic", tip: "Drive clicks to your site" },
  { id: "conversions", label: "Conversions", tip: "Optimise for sign-ups / sales" },
  { id: "awareness", label: "Awareness", tip: "Maximise reach + impressions" },
  { id: "engagement", label: "Engagement", tip: "Boost interactions / video views" },
];

export function LaunchAdDialog({
  open,
  document,
  onClose,
  onSuccess,
}: {
  open: boolean;
  document: { id: string; title: string };
  onClose: () => void;
  onSuccess: (campaignId: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [platform, setPlatform] = useState("meta");
  const [name, setName] = useState(`${document.title} — campaign`);
  const [objective, setObjective] = useState("traffic");
  const [dailyBudget, setDailyBudget] = useState(20);
  const [totalBudget, setTotalBudget] = useState<number | "">(200);
  const [landingUrl, setLandingUrl] = useState("");
  const [countries, setCountries] = useState("US, GB, DE, TR, AZ");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(54);
  const [startsAt, setStartsAt] = useState(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  );
  const [endsAt, setEndsAt] = useState(() =>
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const resp = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          name,
          platform,
          objective,
          dailyBudgetCents: Math.round(dailyBudget * 100),
          totalBudgetCents:
            typeof totalBudget === "number"
              ? Math.round(totalBudget * 100)
              : undefined,
          landingUrl,
          audience: {
            countries: countries.split(",").map((s) => s.trim()).filter(Boolean),
            ages: { min: ageMin, max: ageMax },
          },
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? "Could not launch campaign");
        return;
      }
      setDone(true);
      onSuccess(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setSubmitting(false);
    }
  };

  const platformObj = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-surface/85 backdrop-blur-xl px-4 py-8">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
              Launch managed campaign
            </p>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              {done ? "Campaign queued" : "Brief Addvoxen"}
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
                rocket_launch
              </span>
            </div>
            <p className="text-on-surface font-label-md text-label-md mb-2">
              Brief received — Addvoxen team will launch it
            </p>
            <p className="text-on-surface-variant text-body-md font-body-md mb-5 max-w-md mx-auto">
              We'll publish your creative under our managed{" "}
              {platformObj.label} Business Manager. You'll see live
              statistics in <strong className="text-on-surface">/campaigns</strong>{" "}
              within a few hours.
            </p>
            <a
              href="/campaigns"
              className="inline-flex items-center gap-2 ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md"
            >
              View my campaigns
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </a>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-label-sm font-label-sm">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <div
                    className={
                      "w-7 h-7 rounded-full flex items-center justify-center font-bold transition-colors " +
                      (n === step
                        ? "bg-primary text-on-primary"
                        : n < step
                          ? "bg-tertiary text-on-tertiary"
                          : "bg-surface-container-high/60 text-on-surface-variant")
                    }
                  >
                    {n < step ? "✓" : n}
                  </div>
                  {n < 3 && <div className="w-12 h-px bg-white/10" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-on-surface font-headline-lg-mobile text-headline-lg-mobile font-bold">
                  Pick a platform
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={
                        "flex items-center gap-3 rounded-xl p-3 border transition-colors text-left " +
                        (platform === p.id
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:bg-white/5")
                      }
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-white">
                          {p.icon}
                        </span>
                      </div>
                      <span className="text-on-surface font-label-md text-label-md">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-on-surface-variant text-label-sm font-label-sm">
                  No platform login needed — Addvoxen runs the creative under
                  our managed Business Manager.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-on-surface font-headline-lg-mobile text-headline-lg-mobile font-bold">
                  Goal + budget
                </h3>
                <label className="block">
                  <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                    Campaign name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>

                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                    Objective
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {OBJECTIVES.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setObjective(o.id)}
                        title={o.tip}
                        className={
                          "px-3 py-2 rounded-lg text-label-sm font-label-sm transition-colors " +
                          (objective === o.id
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface")
                        }
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      Daily budget (USD)
                    </span>
                    <div className="flex items-center gap-1 bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5">
                      <span className="text-on-surface-variant">$</span>
                      <input
                        type="number"
                        min={1}
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-on-surface focus:outline-none"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      Total cap (USD, optional)
                    </span>
                    <div className="flex items-center gap-1 bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5">
                      <span className="text-on-surface-variant">$</span>
                      <input
                        type="number"
                        min={0}
                        value={totalBudget}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTotalBudget(v === "" ? "" : parseFloat(v) || 0);
                        }}
                        className="bg-transparent text-on-surface focus:outline-none"
                      />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                    Landing page URL
                  </span>
                  <input
                    type="url"
                    required
                    value={landingUrl}
                    onChange={(e) => setLandingUrl(e.target.value)}
                    placeholder="https://yoursite.com/landing"
                    className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!landingUrl || dailyBudget < 1}
                    className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-on-surface font-headline-lg-mobile text-headline-lg-mobile font-bold">
                  Audience + schedule
                </h3>

                <label className="block">
                  <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                    Target countries (comma-separated ISO codes)
                  </span>
                  <input
                    type="text"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="US, GB, DE, TR, AZ"
                    className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      Age min
                    </span>
                    <input
                      type="number"
                      min={13}
                      max={65}
                      value={ageMin}
                      onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                      className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      Age max
                    </span>
                    <input
                      type="number"
                      min={13}
                      max={65}
                      value={ageMax}
                      onChange={(e) => setAgeMax(parseInt(e.target.value) || 54)}
                      className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      Start date
                    </span>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">
                      End date (optional)
                    </span>
                    <input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="bg-surface-container-high/60 border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </label>
                </div>

                {error && (
                  <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="ai-gradient text-on-primary px-6 py-2.5 rounded-full text-label-md font-label-md disabled:opacity-60"
                  >
                    {submitting ? "Submitting…" : "Launch campaign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
