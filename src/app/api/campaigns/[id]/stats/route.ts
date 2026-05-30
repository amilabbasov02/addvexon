/**
 * Per-campaign analytics. Returns daily series + totals.
 *   GET /api/campaigns/:id/stats
 */
import { NextRequest, NextResponse } from "next/server";
import { eq, sql, asc } from "drizzle-orm";
import { db } from "@/db";
import { adCampaigns, adAnalytics } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const camp = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.id, id))
      .limit(1);
    if (camp.length === 0 || camp[0].userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const daily = await db
      .select()
      .from(adAnalytics)
      .where(eq(adAnalytics.campaignId, id))
      .orderBy(asc(adAnalytics.date));

    const totals = await db
      .select({
        impressions: sql<number>`coalesce(sum(impressions)::int, 0)`,
        clicks: sql<number>`coalesce(sum(clicks)::int, 0)`,
        conversions: sql<number>`coalesce(sum(conversions)::int, 0)`,
        spendCents: sql<number>`coalesce(sum(spend_cents)::int, 0)`,
      })
      .from(adAnalytics)
      .where(eq(adAnalytics.campaignId, id));

    const t = totals[0] ?? { impressions: 0, clicks: 0, conversions: 0, spendCents: 0 };
    const ctr = t.impressions > 0 ? t.clicks / t.impressions : 0;
    const cpc = t.clicks > 0 ? t.spendCents / t.clicks : 0;
    const cpa = t.conversions > 0 ? t.spendCents / t.conversions : 0;

    return NextResponse.json({
      campaign: camp[0],
      daily,
      totals: { ...t, ctr, cpcCents: Math.round(cpc), cpaCents: Math.round(cpa) },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
