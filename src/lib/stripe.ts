/**
 * Stripe SDK instance. Lazy — only constructed when a request actually needs
 * Stripe, so the app still boots without STRIPE_SECRET_KEY set (e.g. before
 * the user has run the Stripe walkthrough).
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see scripts/stripe-setup.md",
    );
  }
  _stripe = new Stripe(key, {
    // Pin API version so behaviour is reproducible.
    apiVersion: "2025-08-27.basil",
    typescript: true,
    appInfo: { name: "Addvoxen", version: "0.1.0" },
  });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Map a Stripe price ID → our internal plan name. */
export function planForPriceId(priceId: string): "pro" | "team" | null {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY) return "team";
  return null;
}
