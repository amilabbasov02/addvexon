import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/billing/confirm  { id, action: "paid" | "cancelled" | "failed" }
 *
 * Admin-only. When marked "paid" the user's plan is bumped and a
 * confirmation email goes out. The legacy /api/billing/checkout
 * (Stripe-based) route still exists but is unused — once we plug in a real
 * gateway, its webhook will call this same endpoint.
 */
export async function POST(req: Request) {
  await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
  };
  const id = body.id ?? "";
  const action = body.action ?? "";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (!["paid", "failed", "cancelled"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.id, id))
    .limit(1);
  const intent = rows[0];
  if (!intent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (intent.status !== "pending") {
    return NextResponse.json(
      { error: `Already ${intent.status}` },
      { status: 409 },
    );
  }

  await db
    .update(paymentIntents)
    .set({
      status: action,
      paidAt: action === "paid" ? new Date() : null,
    })
    .where(eq(paymentIntents.id, id));

  // On paid: upgrade the user's plan immediately and email them.
  if (action === "paid") {
    await db
      .update(users)
      .set({ plan: intent.plan, updatedAt: new Date() })
      .where(eq(users.id, intent.userId));

    const targetUser = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, intent.userId))
      .limit(1);
    if (targetUser[0]?.email) {
      try {
        await sendEmail({
          to: targetUser[0].email,
          subject: `Welcome to Addvoxen ${intent.plan} 🎉`,
          text: [
            `Hi ${targetUser[0].name ?? "there"},`,
            ``,
            `Your payment (reference ${intent.reference}) cleared and your account is now on the ${intent.plan} plan, billed ${intent.billing}.`,
            ``,
            `Open the app: https://addvoxen.com/dashboard`,
            ``,
            `Need anything? Reply to this email or write to support@addvoxen.com.`,
            ``,
            `— Addvoxen team`,
          ].join("\n"),
        });
      } catch (err) {
        console.error("upgrade email failed", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
