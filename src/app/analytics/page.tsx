import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  name: string;
  views: number;
  clicks: number;
  ctaClicks: number;
  exports: number;
};

async function loadStats(creatorId: string | null, isAdmin: boolean) {
  // Admin sees everything; creators see their own templates only.
  const ownFilter = isAdmin ? sql`TRUE` : sql`t.created_by = ${creatorId}`;
  const rows = await db.execute<Row>(sql`
    SELECT t.id, t.slug, t.name,
      COALESCE(SUM(CASE WHEN e.kind = 'view'  THEN 1 ELSE 0 END), 0)::int AS views,
      COALESCE(SUM(CASE WHEN e.kind = 'click' THEN 1 ELSE 0 END), 0)::int AS clicks,
      COALESCE(SUM(CASE WHEN e.kind = 'cta'   THEN 1 ELSE 0 END), 0)::int AS "ctaClicks",
      COALESCE(SUM(CASE WHEN e.kind = 'export' THEN 1 ELSE 0 END), 0)::int AS exports
    FROM templates t
    LEFT JOIN banner_events e ON e.template_id = t.id
    WHERE ${ownFilter}
    GROUP BY t.id, t.slug, t.name
    HAVING (
      COALESCE(SUM(CASE WHEN e.kind IN ('view','click','cta','export') THEN 1 ELSE 0 END), 0) > 0
      OR ${isAdmin ? sql`FALSE` : sql`TRUE`}
    )
    ORDER BY views DESC NULLS LAST, clicks DESC NULLS LAST
    LIMIT 200
  `);
  return rows.rows;
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/signin?next=/analytics");
  const isAdmin = adminEmails().includes(session.user.email.toLowerCase());
  const stats = await loadStats(session.user.id, isAdmin);

  const totals = stats.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      clicks: acc.clicks + r.clicks,
      cta: acc.cta + r.ctaClicks,
      exports: acc.exports + r.exports,
    }),
    { views: 0, clicks: 0, cta: 0, exports: 0 },
  );
  const ctr = totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0;
  const ctaRate = totals.views > 0 ? (totals.cta / totals.views) * 100 : 0;

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
              Analytics {isAdmin && "· Admin view (all templates)"}
            </p>
            <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
              Banner performance
            </h1>
            <p className="text-on-surface-variant text-body-md font-body-md mt-2">
              Views, clicks and CTA opens across the marketplace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Views", value: totals.views },
            { label: "Detail clicks", value: totals.clicks },
            { label: "CTA opens", value: totals.cta },
            { label: "Exports", value: totals.exports },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-4">
              <p className="text-on-surface text-headline-lg font-headline-lg">
                {s.value.toLocaleString()}
              </p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
                {s.label}
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
              CTR · clicks / views
            </p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-on-surface text-headline-lg font-headline-lg">
              {ctaRate.toFixed(2)}%
            </p>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
              CTA rate · "Use template" / views
            </p>
          </div>
        </div>

        <section>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Per-template breakdown
          </h2>
          {stats.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center text-on-surface-variant">
              No traffic yet. Once visitors browse and click templates, the
              counts will appear here.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-label-sm font-label-sm">
                <thead className="bg-surface-container-high/50 border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 text-on-surface-variant">Template</th>
                    <th className="text-right p-3 text-on-surface-variant">Views</th>
                    <th className="text-right p-3 text-on-surface-variant">Detail clicks</th>
                    <th className="text-right p-3 text-on-surface-variant">CTA opens</th>
                    <th className="text-right p-3 text-on-surface-variant">Exports</th>
                    <th className="text-right p-3 text-on-surface-variant">CTR</th>
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
