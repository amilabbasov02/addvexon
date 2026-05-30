import { sql } from "drizzle-orm";
import { db } from "@/db";
import { CampaignsAdminClient } from "./CampaignsAdminClient";

export const dynamic = "force-dynamic";

async function loadCampaigns() {
  return db
    .execute(sql`
      SELECT
        c.id, c.name, c.platform, c.objective, c.status,
        c.daily_budget_cents AS "dailyBudgetCents",
        c.total_budget_cents AS "totalBudgetCents",
        c.landing_url AS "landingUrl",
        c.external_campaign_id AS "externalCampaignId",
        c.starts_at AS "startsAt",
        c.ends_at AS "endsAt",
        c.created_at AS "createdAt",
        u.email AS "userEmail",
        u.name AS "userName",
        COALESCE((SELECT SUM(impressions)::int FROM ad_analytics a WHERE a.campaign_id = c.id), 0) AS "impressions",
        COALESCE((SELECT SUM(clicks)::int FROM ad_analytics a WHERE a.campaign_id = c.id), 0) AS "clicks",
        COALESCE((SELECT SUM(spend_cents)::int FROM ad_analytics a WHERE a.campaign_id = c.id), 0) AS "spendCents"
      FROM ad_campaigns c
      LEFT JOIN users u ON u.id = c.user_id
      ORDER BY
        CASE c.status
          WHEN 'pending' THEN 0
          WHEN 'live' THEN 1
          WHEN 'paused' THEN 2
          WHEN 'completed' THEN 3
          ELSE 4
        END,
        c.created_at DESC
      LIMIT 200
    `)
    .then((r) => r.rows as Campaign[]);
}

export type Campaign = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  dailyBudgetCents: number;
  totalBudgetCents: number | null;
  landingUrl: string;
  externalCampaignId: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  impressions: number;
  clicks: number;
  spendCents: number;
};

export default async function AdminCampaignsPage() {
  const campaigns = await loadCampaigns();
  return <CampaignsAdminClient campaigns={campaigns} />;
}
