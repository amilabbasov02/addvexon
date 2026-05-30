import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents, users } from "@/db/schema";
import { verifyWebhook } from "@/lib/lemon-squeezy";
import { sendEmail } from "@/lib/email";

/**
 * Lemon Squeezy webhook receiver.
 *
 * Events we care about:
 *   - order_created            → mark intent paid, upgrade user
 *   - subscription_created     → same, for recurring plans
 *   - subscription_payment_success → ongoing renewals (no-op for now; the
 *                                     user is already on the right plan)
 *   - subscription_cancelled   → flag as cancelled
 *   - subscription_payment_failed → flag failed so admin can follow up
 *
 * We match LS events to our payment_intents rows by the `reference` field
 * we round-tripped through `meta.custom_data.reference`.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");
  if (!verifyWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  type WebhookPayload = {
    meta?: {
      event_name?: string;
      custom_data?: { reference?: string; user_id?: string };
    };
    data?: {
      attributes?: {
        status?: string;
        user_email?: string;
        user_name?: string;
        total?: number;
        currency?: string;
      };
    };
  };
  const event = JSON.parse(rawBody) as WebhookPayload;
  const eventName = event.meta?.event_name;
  const reference = event.meta?.custom_data?.reference;
  if (!reference) {
    // LS pings unrelated to a checkout we created (e.g. test events).
    return NextResponse.json({ ignored: true });
  }

  const rows = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.reference, reference))
    .limit(1);
  const intent = rows[0];
  if (!intent) {
    console.warn(`LS webhook for unknown reference ${reference}`);
    return NextResponse.json({ ignored: true });
  }

  const markPaid = async () => {
    if (intent.status === "paid") return;
    await db
      .update(paymentIntents)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(paymentIntents.id, intent.id));
    await db
      .update(users)
      .set({ plan: intent.plan, updatedAt: new Date() })
      .where(eq(users.id, intent.userId));
    const target = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, intent.userId))
      .limit(1);
    if (target[0]?.email) {
      try {
        await sendEmail({
          to: target[0].email,
          subject: `Welcome to Addvoxen ${intent.plan} 🎉`,
          text: [
            `Hi ${target[0].name ?? "there"},`,
            ``,
            `Your card payment cleared and your account is now on the ${intent.plan} plan (${intent.billing}).`,
            ``,
            `Reference: ${intent.reference}`,
            ``,
            `Open the app: https://addvoxen.com/dashboard`,
            ``,
            `— Addvoxen team`,
          ].join("\n"),
        });
      } catch (err) {
        console.error("LS upgrade email failed", err);
      }
    }
  };

  switch (eventName) {
    case "order_created":
    case "subscription_created":
    case "subscription_payment_success":
      await markPaid();
      break;
    case "subscription_cancelled":
      await db
        .update(paymentIntents)
        .set({ status: "cancelled" })
        .where(eq(paymentIntents.id, intent.id));
      break;
    case "subscription_payment_failed":
      await db
        .update(paymentIntents)
        .set({ status: "failed" })
        .where(eq(paymentIntents.id, intent.id));
      break;
    default:
      // Unknown event — swallow without erroring so LS doesn't retry forever.
      console.log(`LS unhandled event: ${eventName}`);
  }

  return NextResponse.json({ ok: true });
}
