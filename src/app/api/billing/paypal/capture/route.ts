import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents, users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { captureOrder, isPaypalConfigured } from "@/lib/paypal";
import { sendEmail } from "@/lib/email";

/**
 * Browser → POST { intentId, orderId } → captures funds and upgrades plan.
 *
 * Called from the Smart Buttons `onApprove` hook. We re-verify ownership
 * (intent.userId === current user) and confirm the order's reference_id
 * matches our intent before flipping status — defence in depth.
 */
export async function POST(req: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal not configured" },
      { status: 503 },
    );
  }
  const user = await requireUser();
  const { intentId, orderId } = (await req.json().catch(() => ({}))) as {
    intentId?: string;
    orderId?: string;
  };
  if (!intentId || !orderId) {
    return NextResponse.json(
      { error: "intentId and orderId required" },
      { status: 400 },
    );
  }
  const rows = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.id, intentId))
    .limit(1);
  const intent = rows[0];
  if (!intent || intent.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (intent.externalId !== orderId) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 409 });
  }
  if (intent.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const result = await captureOrder(orderId);
  if (result.status !== "COMPLETED") {
    await db
      .update(paymentIntents)
      .set({ status: "failed" })
      .where(eq(paymentIntents.id, intent.id));
    return NextResponse.json(
      { error: `Capture status ${result.status}` },
      { status: 402 },
    );
  }

  await db
    .update(paymentIntents)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(paymentIntents.id, intent.id));
  await db
    .update(users)
    .set({ plan: intent.plan, updatedAt: new Date() })
    .where(eq(users.id, intent.userId));

  // Welcome email — best-effort, ignore failures
  try {
    const target = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, intent.userId))
      .limit(1);
    if (target[0]?.email) {
      await sendEmail({
        to: target[0].email,
        subject: `Welcome to Addvoxen ${intent.plan} 🎉`,
        text: [
          `Hi ${target[0].name ?? "there"},`,
          ``,
          `Your PayPal payment (reference ${intent.reference}) was captured successfully and your account is now on the ${intent.plan} plan (${intent.billing}).`,
          ``,
          `Open the app: ${process.env.BETTER_AUTH_URL ?? "https://addvoxen.com"}/dashboard`,
          ``,
          `— Addvoxen team`,
        ].join("\n"),
      });
    }
  } catch (err) {
    console.error("PayPal upgrade email failed", err);
  }

  return NextResponse.json({ ok: true });
}
