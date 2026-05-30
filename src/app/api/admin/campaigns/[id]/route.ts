/**
 * Admin actions on an ad campaign.
 *
 *   POST /api/admin/campaigns/:id
 *     { action: "launch" | "pause" | "done" | "reject" | "seed",
 *       externalId?, reason?, days? }
 *
 *   - launch : pending → live (record externalCampaignId from Meta/Google/TikTok)
 *   - pause  : live → paused
 *   - done   : * → completed
 *   - reject : * → rejected, notify user with reason
 *   - seed   : insert N days of realistic mock analytics (dev/demo only)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adCampaigns, adAnalytics, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { uid } from "@/lib/ids";

const BodySchema = z.object({
  action: z.enum(["launch", "pause", "done", "reject", "seed"]),
  externalId: z.string().max(200).optional(),
  reason: z.string().max(2000).optional(),
  days: z.number().int().min(1).max(90).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rows = await db.select().from(adCampaigns).where(eq(adCampaigns.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const c = rows[0];

    if (parsed.data.action === "seed") {
      const days = parsed.data.days ?? 7;
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - i - 1) * 86_400_000)
          .toISOString()
          .slice(0, 10);
        const dailyBudget = c.dailyBudgetCents;
        const spend = Math.round(dailyBudget * (0.7 + Math.random() * 0.3));
        const impressions = Math.round((spend / 500) * 1000 * (0.8 + Math.random() * 0.4));
        const ctr = 0.008 + Math.random() * 0.025;
        const clicks = Math.round(impressions * ctr);
        const conversions = Math.round(clicks * (0.01 + Math.random() * 0.03));
        const cpc = clicks > 0 ? Math.round(spend / clicks) : 0;
        const ctrPpm = impressions > 0 ? Math.round((clicks / impressions) * 1_000_000) : 0;
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
      }
      if (c.status === "pending") {
        await db
          .update(adCampaigns)
          .set({ status: "live", updatedAt: new Date() })
          .where(eq(adCampaigns.id, id));
      }
      return NextResponse.json({ ok: true, days, status: c.status === "pending" ? "live" : c.status });
    }

    const statusMap = {
      launch: "live",
      pause: "paused",
      done: "completed",
      reject: "rejected",
    } as const;
    const newStatus = statusMap[parsed.data.action];

    const updates: Record<string, unknown> = { status: newStatus, updatedAt: new Date() };
    if (parsed.data.action === "launch" && parsed.data.externalId) {
      updates.externalCampaignId = parsed.data.externalId;
    }
    if (parsed.data.reason) updates.notes = parsed.data.reason;

    await db.update(adCampaigns).set(updates).where(eq(adCampaigns.id, id));

    // Notify user
    const owner = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, c.userId))
      .limit(1);
    if (owner[0]?.email) {
      const subjects: Record<string, string> = {
        launch: `Your campaign "${c.name}" is live`,
        pause: `Your campaign "${c.name}" has been paused`,
        done: `Your campaign "${c.name}" finished`,
        reject: `Your campaign "${c.name}" was rejected`,
      };
      const bodies: Record<string, string> = {
        launch: `Great news — "${c.name}" is now running on ${c.platform.toUpperCase()} under our managed Business Manager.\nStats will appear in your /campaigns dashboard within a few hours.`,
        pause: `We've paused "${c.name}" temporarily.${
          parsed.data.reason ? `\n\nReason:\n${parsed.data.reason}` : ""
        }\nIt won't accrue spend until resumed.`,
        done: `"${c.name}" has completed its run.\nFinal performance numbers are in your /campaigns dashboard.`,
        reject: `We weren't able to launch "${c.name}".${
          parsed.data.reason ? `\n\nReason:\n${parsed.data.reason}` : ""
        }\nFeel free to adjust and submit again.`,
      };
      try {
        await sendEmail({
          to: owner[0].email,
          subject: subjects[parsed.data.action],
          text: `Hi ${owner[0].name ?? "there"},\n\n${bodies[parsed.data.action]}\n\n— Addvoxen team`,
        });
      } catch (err) {
        console.error("campaign notification failed:", err);
      }
    }

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("admin campaign action:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
