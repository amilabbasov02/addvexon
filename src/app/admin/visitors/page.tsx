import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Totals = {
  views: number;
  visitors: number;
  signedInVisitors: number;
};

type DailyRow = { day: string; views: number; visitors: number };
type PathRow = { path: string; views: number; visitors: number };
type CountryRow = { country: string | null; visitors: number };
type ReferrerRow = { referrer: string | null; views: number };

async function loadData() {
  const [totals] = (
    await db.execute<Totals>(sql`
      SELECT
        COUNT(*)::int AS views,
        COUNT(DISTINCT visitor_id)::int AS visitors,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::int AS "signedInVisitors"
      FROM page_views
    `)
  ).rows as Totals[];

  const last30 = (
    await db.execute<DailyRow>(sql`
      SELECT
        TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS views,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 30
    `)
  ).rows as DailyRow[];

  const topPaths = (
    await db.execute<PathRow>(sql`
      SELECT
        path,
        COUNT(*)::int AS views,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 12
    `)
  ).rows as PathRow[];

  const countries = (
    await db.execute<CountryRow>(sql`
      SELECT
        COALESCE(country, '—') AS country,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 10
    `)
  ).rows as CountryRow[];

  const referrers = (
    await db.execute<ReferrerRow>(sql`
      SELECT
        COALESCE(referrer, '(direct)') AS referrer,
        COUNT(*)::int AS views
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT 10
    `)
  ).rows as ReferrerRow[];

  return { totals, last30, topPaths, countries, referrers };
}

export default async function AdminVisitorsPage() {
  await requireAdmin();
  const { totals, last30, topPaths, countries, referrers } = await loadData();

  return (
    <>
      <header className="mb-8">
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
          Site analytics
        </p>
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
          Visitor counts
        </h1>
        <p className="text-on-surface-variant text-body-md font-body-md mt-2">
          Anonymous page views collected via a localStorage UUID — no IP or
          fingerprint tracking. Editor / admin / dashboard surfaces are
          excluded.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        <Tile label="All-time views" value={totals?.views ?? 0} icon="visibility" />
        <Tile label="Unique visitors" value={totals?.visitors ?? 0} icon="groups" />
        <Tile
          label="Signed-in visitors"
          value={totals?.signedInVisitors ?? 0}
          icon="person"
        />
      </section>

      <section className="mb-10">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
          Last 30 days
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-label-sm font-label-sm">
            <thead className="bg-surface-container-high/50 border-b border-white/10">
              <tr>
                <th className="text-left p-3 text-on-surface-variant">Day</th>
                <th className="text-right p-3 text-on-surface-variant">Views</th>
                <th className="text-right p-3 text-on-surface-variant">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {last30.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-on-surface-variant">
                    No traffic yet — once visitors land, their pageviews will appear here.
                  </td>
                </tr>
              ) : (
                last30.map((r) => (
                  <tr key={r.day} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-on-surface">{r.day}</td>
                    <td className="p-3 text-right text-on-surface">{r.views}</td>
                    <td className="p-3 text-right text-on-surface">{r.visitors}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <ListPanel
          title="Top pages (30d)"
          icon="trending_up"
          rows={topPaths.map((p) => ({
            label: p.path,
            primary: p.views,
            secondary: `${p.visitors} unique`,
          }))}
        />
        <ListPanel
          title="Top countries (30d)"
          icon="public"
          rows={countries.map((c) => ({
            label: c.country ?? "—",
            primary: c.visitors,
            secondary: "visitors",
          }))}
        />
      </section>

      <section className="mb-10">
        <ListPanel
          title="Where they came from (30d)"
          icon="north_east"
          rows={referrers.map((r) => ({
            label: r.referrer ?? "(direct)",
            primary: r.views,
            secondary: "views",
          }))}
        />
      </section>
    </>
  );
}

function Tile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl ai-gradient flex items-center justify-center">
        <span className="material-symbols-outlined text-on-primary text-[22px]">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-on-surface font-display-sm text-display-sm leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-on-surface-variant text-label-sm font-label-sm mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function ListPanel({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: string;
  rows: { label: string; primary: number; secondary: string }[];
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[18px] text-primary">
          {icon}
        </span>
        {title}
      </h3>
      <ul className="divide-y divide-white/5">
        {rows.length === 0 ? (
          <li className="py-3 text-center text-on-surface-variant text-label-sm font-label-sm">
            No data yet.
          </li>
        ) : (
          rows.map((r) => (
            <li
              key={r.label}
              className="py-2.5 flex items-center justify-between gap-3"
            >
              <span className="text-on-surface text-label-sm font-label-sm truncate max-w-[60%]">
                {r.label}
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                <strong className="text-on-surface">
                  {r.primary.toLocaleString()}
                </strong>{" "}
                {r.secondary}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
