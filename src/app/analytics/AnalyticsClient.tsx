"use client";

import Link from "next/link";
import { useLocale } from "@/components/site/LocaleContext";

type Row = {
  id: string;
  slug: string;
  name: string;
  views: number;
  clicks: number;
  ctaClicks: number;
  exports: number;
};

export function AnalyticsClient({
  stats,
  isAdmin,
  totals,
  ctr,
  ctaRate,
}: {
  stats: Row[];
  isAdmin: boolean;
  totals: { views: number; clicks: number; cta: number; exports: number };
  ctr: number;
  ctaRate: number;
}) {
  const { t } = useLocale();

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
              {isAdmin ? t("analytics.eyebrow.admin") : t("analytics.eyebrow")}
            </p>
            <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
              {t("analytics.title")}
            </h1>
            <p className="text-on-surface-variant text-body-md font-body-md mt-2">
              {t("analytics.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { labelKey: "analytics.tile.views", value: totals.views },
            { labelKey: "analytics.tile.clicks", value: totals.clicks },
            { labelKey: "analytics.tile.cta_opens", value: totals.cta },
            { labelKey: "analytics.tile.exports", value: totals.exports },
          ].map((s) => (
            <div key={s.labelKey} className="glass-panel rounded-xl p-4">
              <p className="text-on-surface text-headline-lg font-headline-lg">
                {s.value.toLocaleString()}
              </p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
                {t(s.labelKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <div className="glass-panel rounded-xl p-4">
            <p className="text-on-surface text-headline-lg font-headline-lg">
              {ctr.toFixed(2)}%
            </p>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
              {t("analytics.metric.ctr")}
            </p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-on-surface text-headline-lg font-headline-lg">
              {ctaRate.toFixed(2)}%
            </p>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
              {t("analytics.metric.cta_rate")}
            </p>
          </div>
        </div>

        <section>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            {t("analytics.section.breakdown")}
          </h2>
          {stats.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center text-on-surface-variant">
              {t("analytics.empty")}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-label-sm font-label-sm">
                <thead className="bg-surface-container-high/50 border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 text-on-surface-variant">
                      {t("analytics.table.template")}
                    </th>
                    <th className="text-right p-3 text-on-surface-variant">
                      {t("analytics.tile.views")}
                    </th>
                    <th className="text-right p-3 text-on-surface-variant">
                      {t("analytics.tile.clicks")}
                    </th>
                    <th className="text-right p-3 text-on-surface-variant">
                      {t("analytics.tile.cta_opens")}
                    </th>
                    <th className="text-right p-3 text-on-surface-variant">
                      {t("analytics.tile.exports")}
                    </th>
                    <th className="text-right p-3 text-on-surface-variant">
                      CTR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((r) => {
                    const c = r.views > 0 ? (r.clicks / r.views) * 100 : 0;
                    return (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">
                          <Link
                            href={`/banner/${r.slug}`}
                            className="text-on-surface hover:text-primary truncate block max-w-[260px]"
                          >
                            {r.name}
                          </Link>
                        </td>
                        <td className="p-3 text-right text-on-surface">{r.views}</td>
                        <td className="p-3 text-right text-on-surface">{r.clicks}</td>
                        <td className="p-3 text-right text-on-surface">{r.ctaClicks}</td>
                        <td className="p-3 text-right text-on-surface">{r.exports}</td>
                        <td className="p-3 text-right text-on-surface-variant">
                          {c.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
