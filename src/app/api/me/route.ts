/**
 * Returns the current user's plan + computed feature flags. Editor and
 * dashboard use this to decide what to show / lock.
 */
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, usageMetrics, userProfiles } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getLimits } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const u = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        plan: users.plan,
        image: users.image,
        handle: userProfiles.handle,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, user.id))
      .limit(1);
    const me = u[0];
    if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const limits = getLimits(me.plan);
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await db
      .select({
        ai: usageMetrics.aiCreditsUsed,
        exports: usageMetrics.exportsCount,
        storage: usageMetrics.storageBytes,
      })
      .from(usageMetrics)
      .where(and(eq(usageMetrics.userId, me.id), eq(usageMetrics.period, period)))
      .limit(1);
    const u0 = usage[0] ?? { ai: 0, exports: 0, storage: 0 };

    return NextResponse.json({
      user: me,
      limits,
      usage: {
        aiCreditsUsed: u0.ai,
        aiCreditsRemaining: Math.max(0, limits.aiCreditsPerMonth - u0.ai),
        exportsCount: u0.exports,
        storageBytes: u0.storage,
      },
      period,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
