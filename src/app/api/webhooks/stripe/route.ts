/**
 * Stripe webhook handler.
 *
 * Stripe sends events here whenever a subscription is created / updated /
 * cancelled / invoice paid / etc. We use them to keep our `subscriptions`
 * table and `users.plan` in sync.
 *
 * Setup:
 *   1. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *        URL:   https://YOUR_DOMAIN/api/webhooks/stripe
 *               (for local dev, use `stripe listen --forward-to localhost:3210/api/webhooks/stripe`)
 *        Events: customer.subscription.created
 *                customer.subscription.updated
 *                customer.subscription.deleted
 *                invoice.payment_succeeded
 *                invoice.payment_failed
 *   2. Copy the signing secret → .env.local STRIPE_WEBHOOK_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe, planForPriceId } from "@/lib/stripe";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { uid } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function applySubscription(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.userId as string) || null;
  // Use the customer ID to look up our user if metadata is missing.
  let userIdResolved = userId;
  if (!userIdResolved) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);
    userIdResolved = found[0]?.id ?? null;
  }
  if (!userIdResolved) {
    console.error(
      `webhook: could not resolve user for subscription ${sub.id}`,
    );
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  const plan = priceId ? planForPriceId(priceId) ?? "pro" : "pro";
  const status = sub.status;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subAny = sub as any;
  const currentPeriodEnd = new Date(
    (subAny.current_period_end ?? subAny.currentPeriodEnd ?? 0) * 1000,
  );

  // Upsert subscriptions row
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(subscriptions).values({
      id: uid("sub"),
      userId: userIdResolved,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    });
  } else {
    await db
      .update(subscriptions)
      .set({
        plan,
        status,
        stripePriceId: priceId,
        currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));
  }

  // Determine user-facing plan
  let effectivePlan: string = "free";
  if (status === "active" || status === "trialing") effectivePlan = plan;
  else if (status === "past_due" || status === "unpaid") effectivePlan = plan; // grace
  else effectivePlan = "free";

  await db
    .update(users)
    .set({ plan: effectivePlan, updatedAt: new Date() })
    .where(eq(users.id, userIdResolved));
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded": {
        // Re-sync from the related subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subId: string | undefined =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          await applySubscription(sub);
        }
        break;
      }

      case "invoice.payment_failed": {
        // Optional: send the user a heads-up email. For MVP we let Stripe
        // handle the dunning emails itself.
        console.warn("payment_failed:", event.id);
        break;
      }

      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
