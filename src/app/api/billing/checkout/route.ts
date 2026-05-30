/**
 * Create a Stripe Checkout session for the current user.
 *
 *   POST /api/billing/checkout
 *   { plan: "pro_monthly" | "pro_yearly" | "team_monthly" }
 *
 * Returns: { url } — caller redirects the browser to this URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";

const BodySchema = z.object({
  plan: z.enum(["pro_monthly", "pro_yearly", "team_monthly"]),
  returnPath: z.string().optional(),
});

const PRICE_MAP = {
  pro_monthly: () => process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: () => process.env.STRIPE_PRICE_PRO_YEARLY,
  team_monthly: () => process.env.STRIPE_PRICE_TEAM_MONTHLY,
} as const;

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. The site admin needs to add STRIPE_SECRET_KEY and price IDs to .env.local — see scripts/stripe-setup.md.",
        },
        { status: 503 },
      );
    }

    const user = await requireUser();
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const priceId = PRICE_MAP[parsed.data.plan]();
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Price ID for "${parsed.data.plan}" is missing in environment.`,
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();

    // Ensure the user has a Stripe customer ID, reuse if we already issued one.
    let customerId = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
      .then((r) => r[0]?.stripeCustomerId ?? null);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    const baseUrl =
      process.env.BETTER_AUTH_URL ?? "http://localhost:3210";
    const returnPath = parsed.data.returnPath ?? "/dashboard";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false }, // turn on once Stripe Tax is set up
      success_url: `${baseUrl}${returnPath}?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${returnPath}?upgrade=cancelled`,
      subscription_data: {
        metadata: { userId: user.id },
      },
      metadata: { userId: user.id, plan: parsed.data.plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
