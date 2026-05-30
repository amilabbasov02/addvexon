/**
 * Open the Stripe Customer Portal so the user can manage their subscription,
 * update payment method, view invoices, cancel, etc.
 *
 *   POST /api/billing/portal
 *   Returns: { url } — redirect there.
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(_req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 },
      );
    }
    const user = await requireUser();
    const customerId = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
      .then((r) => r[0]?.stripeCustomerId);

    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Subscribe first." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const baseUrl =
      process.env.BETTER_AUTH_URL ?? "http://localhost:3210";
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("portal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
