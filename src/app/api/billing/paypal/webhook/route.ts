import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents, users } from "@/db/schema";
import { verifyWebhook } from "@/lib/paypal";

/**
 * PayPal webhook fallback for events that didn't ride the in-browser
 * capture call — e.g. delayed funding instruments, disputes, refunds.
 *
 * Always-verify with PayPal's signature endpoint before mutating state.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const headers: Record<string, string | null> = {
    "paypal-transmission-id": req.headers.get("paypal-transmission-id"),
    "paypal-transmission-time": req.headers.get("paypal-transmission-time"),
    "paypal-cert-url": req.headers.get("paypal-cert-url"),
    "paypal-auth-algo": req.headers.get("paypal-auth-algo"),
    "paypal-transmission-sig": req.headers.get("paypal-transmission-sig"),
  };
  const ok = await verifyWebhook(headers, rawBody);
  if (!ok) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  type Event = {
    event_type?: string;
    resource?: {
      // capture / refund / dispute payloads carry slightly different keys
      custom_id?: string;
      invoice_id?: string;
      supplementary_data?: {
        related_ids?: { order_id?: string };
      };
    };
  };
  const event = JSON.parse(rawBody) as Event;
  const ref =
    event.resource?.custom_id ??
    event.resource?.invoice_id ??
    null;
  if (!ref) {
    return NextResponse.json({ ignored: true });
  }
  const rows = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.reference, ref))
    .limit(1);
  const intent = rows[0];
  if (!intent) {
    return NextResponse.json({ ignored: true });
  }

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      if (intent.status !== "paid") {
        await db
          .update(paymentIntents)
          .set({ status: "paid", paidAt: new Date() })
          .where(eq(paymentIntents.id, intent.id));
        await db
          .update(users)
          .set({ plan: intent.plan, updatedAt: new Date() })
          .where(eq(users.id, intent.userId));
      }
      break;
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED":
      await db
        .update(paymentIntents)
        .set({ status: "failed" })
        .where(eq(paymentIntents.id, intent.id));
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
    case "PAYMENT.CAPTURE.REVERSED":
      await db
        .update(paymentIntents)
        .set({ status: "cancelled" })
        .where(eq(paymentIntents.id, intent.id));
      // Refunds also flip the user back to free — they no longer paid.
      await db
        .update(users)
        .set({ plan: "free", updatedAt: new Date() })
        .where(eq(users.id, intent.userId));
      break;
    default:
      console.log(`PayPal unhandled event: ${event.event_type}`);
  }

  return NextResponse.json({ ok: true });
}
