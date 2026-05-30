"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Campaign } from "./page";

const STATUS_PILLS = [
  { id: "pending", label: "Pending", icon: "schedule" },
  { id: "live", label: "Live", icon: "podcasts" },
  { id: "paused", label: "Paused", icon: "pause_circle" },
  { id: "completed", label: "Done", icon: "task_alt" },
  { id: "rejected", label: "Rejected", icon: "block" },
];

const PLATFORM_GRADIENT: Record<string, string> = {
  meta: "from-blue-500 to-purple-500",
  google: "from-yellow-400 to-rose-500",
  tiktok: "from-fuchsia-500 to-cyan-400",
  linkedin: "from-sky-500 to-blue-700",
  twitter: "from-slate-400 to-slate-700",
  pinterest: "from-rose-600 to-red-500",
  snapchat: "from-yellow-300 to-yellow-500",
};

function fmtMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function CampaignsAdminClient({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const status = search.get("status") ?? "pending";
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of campaigns) c[x.status] = (c[x.status] ?? 0) + 1;
    return c;
  }, [campaigns]);

  const filtered = campaigns.filter((c) => c.status === status);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_PILLS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => router.replace(`/admin/campaigns?status=${p.id}`)}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm flex items-center gap-2 transition-colors " +
              (status === p.id
                ? "bg-primary text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface")
            }
          >
            <span className="material-symbols-outlined text-[16px]">
              {p.icon}
            </span>
            {p.label}
            <span className="text-[10px] font-bold opacity-70">
              {counts[p.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
          No {status} campaigns.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CampaignRow key={c.id} c={c} />
          ))}
        </div>
      )}
    </>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [extId, setExtId] = useState(c.externalCampaignId ?? "");
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [seedDays, setSeedDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const act = async (
    action: "launch" | "pause" | "done" | "reject" | "seed",
    payload?: Record<string, unknown>,
  ) => {
    setBusy(action);
    setError(null);
    try {
      const r = await fetch(`/api/admin/campaigns/${c.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error ?? "Failed");
        return;
      }
      setReasonOpen(false);
      setReason("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-3 lg:w-72 shrink-0">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PLATFORM_GRADIENT[c.platform] ?? "from-primary to-tertiary"} flex items-center justify-center shrink-0`}
          >
            <span className="material-symbols-outlined text-white">campaign</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-on-surface font-label-md text-label-md truncate">
              {c.name}
            </p>
            <p className="text-on-surface-variant text-label-sm capitalize truncate">
              {c.platform} · {c.objective}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-label-sm">
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
              Daily budget
            </p>
            <p className="text-on-surface font-bold">
              {fmtMoney(c.dailyBudgetCents)}
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
              Impressions
            </p>
            <p className="text-on-surface font-bold">
              {fmtCompact(c.impressions)}
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
              Clicks
            </p>
            <p className="text-on-surface font-bold">
              {fmtCompact(c.clicks)}
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
              Spend
            </p>
            <p className="text-on-surface font-bold">
              {fmtMoney(c.spendCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 text-on-surface-variant text-xs flex flex-wrap items-center gap-3">
        <span>
          <span className="material-symbols-outlined text-[14px] align-middle">
            person
          </span>{" "}
          {c.userName ?? "—"}
          {c.userEmail && <span className="opacity-60"> · {c.userEmail}</span>}
        </span>
        <span>
          <span className="material-symbols-outlined text-[14px] align-middle">
            link
          </span>{" "}
          <a
            href={c.landingUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-tertiary-fixed-dim"
          >
            {c.landingUrl}
          </a>
        </span>
        {c.externalCampaignId && (
          <span>
            <span className="material-symbols-outlined text-[14px] align-middle">
              fingerprint
            </span>{" "}
            {c.externalCampaignId}
          </span>
        )}
      </div>

      {error && (
        <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-2 py-1 mt-2">
          {error}
        </p>
      )}

      {reasonOpen ? (
        <div className="mt-3 space-y-2 max-w-2xl">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason — sent to user via email"
            className="bg-surface-container-high/60 border border-white/10 rounded-md px-2 py-1.5 text-on-surface text-label-sm focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => act("reject", { reason })}
              disabled={busy !== null}
              className="bg-warn text-surface px-3 py-1.5 rounded-full text-label-sm font-label-sm"
            >
              {busy === "reject" ? "Sending…" : "Reject + email user"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReasonOpen(false);
                setReason("");
              }}
              className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {c.status === "pending" && (
            <>
              <div className="flex items-center gap-2 bg-surface-container-high/40 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={extId}
                  onChange={(e) => setExtId(e.target.value)}
                  placeholder="Meta/Google/TikTok ID (optional)"
                  className="bg-transparent text-on-surface text-label-sm focus:outline-none w-56"
                />
                <button
                  type="button"
                  onClick={() => act("launch", { externalId: extId || undefined })}
                  disabled={busy !== null}
                  className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    rocket_launch
                  </span>
                  Launch
                </button>
              </div>
              <button
                type="button"
                onClick={() => setReasonOpen(true)}
                disabled={busy !== null}
                className="bg-warn/20 text-warn border border-warn/30 px-3 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  block
                </span>
                Reject
              </button>
            </>
          )}

          {c.status === "live" && (
            <>
              <button
                type="button"
                onClick={() => act("pause")}
                disabled={busy !== null}
                className="bg-on-surface-variant/20 text-on-surface px-3 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  pause
                </span>
                Pause
              </button>
              <button
                type="button"
                onClick={() => act("done")}
                disabled={busy !== null}
                className="bg-primary-container/30 text-primary-fixed-dim px-3 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  task_alt
                </span>
                Mark done
              </button>
            </>
          )}

          {c.status === "paused" && (
            <button
              type="button"
              onClick={() => act("launch", { externalId: c.externalCampaignId ?? undefined })}
              disabled={busy !== null}
              className="bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full text-label-sm font-label-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                play_arrow
              </span>
              Resume
            </button>
          )}

          {/* Seed mock stats (for any non-rejected campaign) */}
          {c.status !== "rejected" && (
            <div className="flex items-center gap-1 bg-surface-container-high/40 rounded-full pl-3 pr-1 py-1">
              <span className="text-on-surface-variant text-label-sm">
                Inject stats
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={seedDays}
                onChange={(e) => setSeedDays(parseInt(e.target.value) || 7)}
                className="bg-transparent text-on-surface text-label-sm focus:outline-none w-12 text-center"
              />
              <span className="text-on-surface-variant text-label-sm">
                days
              </span>
              <button
                type="button"
                onClick={() => act("seed", { days: seedDays })}
                disabled={busy !== null}
                className="bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1"
              >
                {busy === "seed" ? "Adding…" : "Add"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
