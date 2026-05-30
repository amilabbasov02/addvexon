/**
 * Manage user-submitted ad campaigns. Until Meta / Google / TikTok
 * Marketing API integrations are live, Addvoxen team approves each
 * campaign manually under our Business Manager hosts.
 *
 *   npx tsx scripts/admin-campaigns.ts                    → all pending
 *   npx tsx scripts/admin-campaigns.ts launch <id> [ext]  → set "live"
 *   npx tsx scripts/admin-campaigns.ts pause  <id>        → set "paused"
 *   npx tsx scripts/admin-campaigns.ts done   <id>        → set "completed"
 *   npx tsx scripts/admin-campaigns.ts reject <id>        → set "rejected"
 *   npx tsx scripts/admin-campaigns.ts seed   <id> [days] → inject N days of mock stats
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc } from "drizzle-orm";
import { adCampaigns, adAnalytics } from "../src/db/schema";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function fmtMoney(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

async function main() {
  const [, , cmd, id, extra] = process.argv;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { adCampaigns, adAnalytics } });

  try {
    if (!cmd || cmd === "list") {
      const filter = id; // optional status filter
      const rows = await db
        .select()
        .from(adCampaigns)
        .where(filter ? eq(adCampaigns.status, filter) : undefined)
        .orderBy(desc(adCampaigns.createdAt))
        .limit(50);
      if (rows.length === 0) {
        console.log("No campaigns.");
        return;
      }
      console.log(`\n${rows.length} campaign(s):\n`);
      for (const c of rows) {
        console.log(
          `  ${c.id}  [${c.status}]  ${c.platform.padEnd(10)}  ${fmtMoney(c.dailyBudgetCents)}/day  →  ${c.name}`,
        );
        console.log(`        landing: ${c.landingUrl}`);
        console.log(`        user:    ${c.userId}    ${c.createdAt.toISOString().slice(0, 10)}`);
      }
      console.log("\nLaunch:  npx tsx scripts/admin-campaigns.ts launch <id>");
      return;
    }

    if (["launch", "pause", "done", "reject"].includes(cmd)) {
      const statusMap: Record<string, string> = {
        launch: "live",
        pause: "paused",
        done: "completed",
        reject: "rejected",
      };
      const status = statusMap[cmd];
      const updates: Partial<typeof adCampaigns.$inferInsert> = {
        status,
        updatedAt: new Date(),
      };
      if (cmd === "launch" && extra) {
        (updates as { externalCampaignId?: string }).externalCampaignId = extra;
      }
      const r = await db
        .update(adCampaigns)
        .set(updates)
        .where(eq(adCampaigns.id, id))
        .returning({ id: adCampaigns.id, status: adCampaigns.status });
      if (r.length === 0) {
        console.error(`✗ no campaign with id "${id}"`);
        process.exit(1);
      }
      console.log(`✓ ${id}: ${status}`);
      return;
    }

    if (cmd === "seed") {
      const days = extra ? parseInt(extra) : 7;
      const camp = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, id))
        .limit(1);
      if (camp.length === 0) {
        console.error(`✗ no campaign with id "${id}"`);
        process.exit(1);
      }
      const c = camp[0];
      console.log(`Seeding ${days} days of mock analytics for "${c.name}"…`);

      let totalImpr = 0;
      let totalClicks = 0;
      let totalSpend = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - i - 1) * 86_400_000)
          .toISOString()
          .slice(0, 10);

        // Realistic numbers based on daily budget. Spend stays within budget.
        const dailyBudget = c.dailyBudgetCents;
        const spend = Math.round(dailyBudget * (0.7 + Math.random() * 0.3));
        // Roughly $5 CPM on average across platforms
        const impressions = Math.round((spend / 500) * 1000 * (0.8 + Math.random() * 0.4));
        const ctr = 0.008 + Math.random() * 0.025; // 0.8% - 3.3% CTR
        const clicks = Math.round(impressions * ctr);
        // 1-4% conversion of clicks
        const conversions = Math.round(clicks * (0.01 + Math.random() * 0.03));

        const cpc = clicks > 0 ? Math.round(spend / clicks) : 0;
        const ctrPpm = impressions > 0 ? Math.round((clicks / impressions) * 1_000_000) : 0;

        totalImpr += impressions;
        totalClicks += clicks;
        totalSpend += spend;

        await db
          .insert(adAnalytics)
          .values({
            id: uid("stat"),
            campaignId: id,
            date,
            impressions,
            clicks,
            conversions,
            spendCents: spend,
            ctrPpm,
            cpcCents: cpc,
          })
          .onConflictDoUpdate({
            target: [adAnalytics.campaignId, adAnalytics.date],
            set: { impressions, clicks, conversions, spendCents: spend, ctrPpm, cpcCents: cpc },
          });

        console.log(
          `  ${date}: ${impressions.toLocaleString()} impr · ${clicks} clicks · ${fmtMoney(spend)}`,
        );
      }

      // Auto-mark live if still pending
      if (c.status === "pending") {
        await db
          .update(adCampaigns)
          .set({ status: "live", updatedAt: new Date() })
          .where(eq(adCampaigns.id, id));
        console.log("  → status: pending → live");
      }

      const overallCtr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(2) : "0";
      console.log(
        `\n✓ Done. ${totalImpr.toLocaleString()} impressions · ${totalClicks} clicks · CTR ${overallCtr}% · spend ${fmtMoney(totalSpend)}.`,
      );
      return;
    }

    console.error(
      "Unknown command. Try: list [status] | launch <id> [ext_id] | pause <id> | done <id> | reject <id> | seed <id> [days]",
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
