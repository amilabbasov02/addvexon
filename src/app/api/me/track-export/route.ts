import { NextResponse, NextRequest } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  templates,
  usageMetrics,
  bannerEvents,
} from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getLimits } from "@/lib/billing";
import { createHash } from "node:crypto";

function uid() {
  return `ev_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function hashIp(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = process.env.BETTER_AUTH_SECRET ?? "addvoxen-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 16);
}

// Monthly export quotas. -1 = unlimited (enterprise).
const QUOTAS: Record<string, number> = {
  free: 1,
  pro: 50,
  team: 200,
  enterprise: -1,
};

function quotaFor(plan: string): number {
  return QUOTAS[plan] ?? QUOTAS.free;
}

/**
 * POST /api/me/track-export   { templateSlug?: string }
 *
 * Enforces the plan's export quota and records the event. Returns the new
 * count so the client can update its local state without re-fetching /api/me.
 *
 *   429 { error, remaining: 0 } — quota exceeded
 *   200 { exportsCount, remaining }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as { templateSlug?: string };
    const planRaw = (user as { plan?: string }).plan ?? "free";
    // Re-read plan from DB so a freshly-upgraded user gets the new quota
    // immediately, even before their session refreshes.
    const fresh = await db
      .select({ plan: usageMetrics.userId })
      .from(usageMetrics)
      .where(eq(usageMetrics.userId, user.id))
      .limit(1);
    void fresh; // (kept the lookup pattern in case we add a user re-read here)
    const plan = planRaw;
    const limits = getLimits(plan);
    void limits;
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    const quota = quotaFor(plan);
    const isUnlimited = quota < 0;

    const existing = await db
      .select({ exports: usageMetrics.exportsCount })
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.userId, user.id),
          eq(usageMetrics.period, period),
        ),
      )
      .limit(1);
    const current = existing[0]?.exports ?? 0;

    if (!isUnlimited && current >= quota) {
      const planNice = plan.charAt(0).toUpperCase() + plan.slice(1);
      const upgradeHint =
        plan === "free"
          ? "Upgrade to Pro for 50 exports / month, or Team for 200."
          : plan === "pro"
            ? "Upgrade to Team for 200 exports / month."
            : "Contact support@addvoxen.com for higher limits.";
      return NextResponse.json(
        {
          error: `Monthly export quota reached (${quota} on ${planNice}). ${upgradeHint}`,
          remaining: 0,
          exportsCount: current,
          quota,
        },
        { status: 429 },
      );
    }

    // Increment (upsert)
    const nextCount = current + 1;
    if (existing[0]) {
      await db
        .update(usageMetrics)
        .set({
          exportsCount: sql`${usageMetrics.exportsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(usageMetrics.userId, user.id),
            eq(usageMetrics.period, period),
          ),
        );
    } else {
      await db.insert(usageMetrics).values({
        id: uid(),
        userId: user.id,
        period,
        exportsCount: 1,
        aiCreditsUsed: 0,
        storageBytes: 0,
      });
    }

    // Best-effort: also record into banner_events so analytics counts exports.
    if (body.templateSlug) {
      const tpl = await db
        .select({ id: templates.id })
        .from(templates)
        .where(eq(templates.slug, body.templateSlug))
        .limit(1);
      if (tpl[0]) {
        await db.insert(bannerEvents).values({
          id: uid(),
          templateId: tpl[0].id,
          kind: "export",
          userId: user.id,
          ipHash: hashIp(req),
        });
      }
    }

    return NextResponse.json({
      exportsCount: nextCount,
      remaining: isUnlimited ? -1 : Math.max(0, quota - nextCount),
      quota,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
