"use client";

import Link from "next/link";
import { useState } from "react";

type Campaign = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  dailyBudgetCents: number;
  totalBudgetCents: number | null;
  landingUrl: string;
  startsAt: Date;
  endsAt: Date | null;
  createdAt: Date;
  stats: {
    impressions: number;
    clicks: number;
    conversions: number;
    spendCents: number;
  };
};

const PLATFORM_META: Record<string, { label: string; icon: string; gradient: string }> = {
  meta: { label: "Meta", icon: "share", gradient: "from-blue-500 to-purple-500" },
  google: { label: "Google Ads", icon: "ads_click", gradient: "from-yellow-400 to-rose-500" },
  tiktok: { label: "TikTok", icon: "movie", gradient: "from-fuchsia-500 to-cyan-400" },
  linkedin: { label: "LinkedIn", icon: "work", gradient: "from-sky-500 to-blue-700" },
  twitter: { label: "X", icon: "tag", gradient: "from-slate-400 to-slate-700" },
  pinterest: { label: "Pinterest", icon: "push_pin", gradient: "from-rose-600 to-red-500" },
  snapchat: { label: "Snapchat", icon: "photo_camera", gradient: "from-yellow-300 to-yellow-500" },
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-warn/20 text-warn",
  live: "bg-tertiary/20 text-tertiary",
  paused: "bg-on-surface-variant/20 text-on-surface-variant",
  completed: "bg-primary-container/20 text-primary-fixed-dim",
  rejected: "bg-error-container/20 text-error",
  draft: "bg-surface-container-high/60 text-on-surface-variant",
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

export function CampaignsClient({ campaigns }: { campaigns: Campaign[] }) {
  const [filter, setFilter] = useState<string>("all");

  if (campaigns.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            rocket_launch
          </span>
        </div>
        <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          No campaigns yet
        </h3>
        <p className="text-on-surface-variant text-body-md font-body-md mb-6 max-w-md mx-auto">
          Pick a design from your dashboard, hit{" "}
          <strong className="text-on-surface">Launch as Ad</strong>, and
          Addvoxen will publish it across Meta, Google, TikTok and more on
          your behalf.
        </p>
        <Link
          href="/dashboard"
          className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md inline-flex items-center gap-2"
        >
          Go to my designs
        </Link>
      </div>
    );
  }

  const filtered =
    filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  const summary = campaigns.reduce(
    (acc, c) => ({
      live: acc.live + (c.status === "live" ? 1 : 0),
      impressions: acc.impressions + c.stats.impressions,
      clicks: acc.clicks + c.stats.clicks,
      conversions: acc.conversions + c.stats.conversions,
      spendCents: acc.spendCents + c.stats.spendCents,
    }),
    { live: 0, impressions: 0, clicks: 0, conversions: 0, spendCents: 0 },
  );
  const overallCtr =
    summary.impressions > 0
      ? ((summary.clicks / summary.impressions) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryTile label="Live campaigns" value={summary.live.toString()} icon="campaign" />
        <SummaryTile
          label="Impressions"
          value={fmtCompact(summary.impressions)}
          icon="visibility"
        />
        <SummaryTile label="Clicks" value={fmtCompact(summary.clicks)} icon="ads_click" />
        <SummaryTile
          label="Conversions"
          value={fmtCompact(summary.conversions)}
          icon="check_circle"
        />
        <SummaryTile
          label="Spend"
          value={fmtMoney(summary.spendCents)}
          icon="payments"
          sub={`CTR ${overallCtr}%`}
        />
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "live", "paused", "completed"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              "px-4 py-1.5 rounded-full text-label-sm font-label-sm capitalize transition-colors " +
              (filter === s
                ? "bg-primary text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface")
            }
          >
            {s}
            <span className="ml-1.5 text-[10px] font-bold opacity-70">
              {s === "all"
                ? campaigns.length
                : campaigns.filter((c) => c.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-label-sm font-label-sm">
            <thead className="bg-surface-container-high/40 text-on-surface-variant text-[10px] uppercase tracking-wider">
              <tr>
                <th className="text-left py-3 px-4">Campaign</th>
                <th className="text-left py-3 px-4">Platform</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Impressions</th>
                <th className="text-right py-3 px-4">Clicks</th>
                <th className="text-right py-3 px-4">CTR</th>
                <th className="text-right py-3 px-4">Spend</th>
                <th className="text-right py-3 px-4">Budget / day</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const meta = PLATFORM_META[c.platform];
                const ctr =
                  c.stats.impressions > 0
                    ? ((c.stats.clicks / c.stats.impressions) * 100).toFixed(2)
                    : "—";
                return (
                  <tr
                    key={c.id}
                    className="border-t border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-on-surface font-label-md">{c.name}</p>
                      <p className="text-on-surface-variant text-xs capitalize">
                        {c.objective} ·{" "}
                        {new Date(c.startsAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta?.gradient ?? "from-primary to-tertiary"} flex items-center justify-center shrink-0`}
                        >
                          <span className="material-symbols-outlined text-white text-[16px]">
                            {meta?.icon ?? "campaign"}
                          </span>
                        </div>
                        <span className="text-on-surface">
                          {meta?.label ?? c.platform}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider " +
                          (STATUS_STYLE[c.status] ?? "bg-white/10 text-on-surface")
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      {fmtCompact(c.stats.impressions)}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      {fmtCompact(c.stats.clicks)}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface-variant">
                      {ctr === "—" ? ctr : `${ctr}%`}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      {fmtMoney(c.stats.spendCents)}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface-variant">
                      {fmtMoney(c.dailyBudgetCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-on-surface-variant text-body-md py-12">
            No campaigns match this filter.
          </p>
        )}
      </div>

      <p className="text-on-surface-variant text-xs text-center">
        Stats update every few hours via our managed Meta / Google / TikTok
        Business Manager. New campaigns enter "Pending" until the Addvoxen
        team approves and publishes them.
      </p>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-2 text-on-surface-variant text-label-sm font-label-sm">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        {label}
      </div>
      <p className="text-on-surface font-display-sm text-display-sm font-bold mt-1">
        {value}
      </p>
      {sub && (
        <p className="text-on-surface-variant text-xs mt-0.5">{sub}</p>
      )}
    </div>
  );
}
