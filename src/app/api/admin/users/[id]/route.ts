/** Upgrade / downgrade a user (admin-only). */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, waitlist } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  action: z.literal("setPlan"),
  plan: z.enum(["free", "pro", "team", "enterprise"]),
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
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const found = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (found.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
      .update(users)
      .set({ plan: parsed.data.plan, updatedAt: new Date() })
      .where(eq(users.id, id));

    // Mark matching waitlist entries converted
    if (parsed.data.plan !== "free") {
      await db
        .update(waitlist)
        .set({ convertedAt: new Date(), contactedAt: new Date() })
        .where(eq(waitlist.email, found[0].email));
    }

    return NextResponse.json({ ok: true, plan: parsed.data.plan });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
