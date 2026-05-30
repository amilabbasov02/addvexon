import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { AnalyticsClient } from "./AnalyticsClient";

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
    <AnalyticsClient
      stats={stats}
      isAdmin={isAdmin}
      totals={totals}
      ctr={ctr}
      ctaRate={ctaRate}
    />
  );
}
