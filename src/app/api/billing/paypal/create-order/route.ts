import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { createOrder, isPaypalConfigured } from "@/lib/paypal";

/**
 * Browser → POST { intentId }  → returns { orderId }
 *
 * The PayPal Smart Buttons SDK calls this from `createOrder(data, actions)`.
 * We look up our existing payment_intent (so we can't be tricked into
 * charging a different amount) and ask PayPal to mint an order for that
 * exact value + currency.
 */
export async function POST(req: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal not configured yet" },
      { status: 503 },
    );
  }
  const user = await requireUser();
  const { intentId } = (await req.json().catch(() => ({}))) as {
    intentId?: string;
  };
  if (!intentId) {
    return NextResponse.json({ error: "intentId required" }, { status: 400 });
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
  if (intent.status !== "pending") {
    return NextResponse.json(
      { error: `Intent is ${intent.status}` },
      { status: 409 },
    );
  }

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3210";
  const order = await createOrder({
    amountCents: intent.amountCents,
    currency: intent.currency,
    reference: intent.reference,
    description: `Addvoxen ${intent.plan} · ${intent.billing}`,
    returnUrl: `${baseUrl}/dashboard?upgrade=success&ref=${intent.reference}`,
    cancelUrl: `${baseUrl}/checkout?plan=${intent.plan}&billing=${intent.billing}&cancelled=1`,
  });

  // Remember the PayPal order id on the intent so capture + webhook can match.
  await db
    .update(paymentIntents)
    .set({ externalId: order.id, provider: "paypal" })
    .where(eq(paymentIntents.id, intent.id));

  return NextResponse.json({ orderId: order.id });
}
