/**
 * Thin Lemon Squeezy wrapper.
 *
 * Why Lemon Squeezy: AZ-friendly seller onboarding (passport ID, Wise payout
 * in AZN), MoR so tax/VAT compliance globally is handled by LS, hosted
 * checkout with Apple Pay / Google Pay / cards / PayPal. No Stripe account
 * required on our end — LS sits in front.
 *
 * Two functions:
 *   - createCheckout: builds a hosted-checkout URL for a given plan +
 *     reference. The reference round-trips back to us in the webhook so we
 *     can mark the matching payment_intent paid.
 *   - verifyWebhook: validates the HMAC signature LS sends with every event.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export function isLemonConfigured(): boolean {
  return !!(
    process.env.LEMON_API_KEY &&
    process.env.LEMON_STORE_ID
  );
}

type Billing = "monthly" | "yearly";
type Plan = "pro" | "team" | "enterprise";

export function variantIdFor(plan: Plan, billing: Billing): string | null {
  const map: Record<Plan, Record<Billing, string | undefined>> = {
    pro: {
      monthly: process.env.LEMON_VARIANT_PRO_MONTHLY,
      yearly: process.env.LEMON_VARIANT_PRO_YEARLY,
    },
    team: {
      monthly: process.env.LEMON_VARIANT_TEAM_MONTHLY,
      yearly: process.env.LEMON_VARIANT_TEAM_YEARLY,
    },
    enterprise: {
      monthly: undefined,
      yearly: undefined,
    },
  };
  return map[plan]?.[billing] ?? null;
}

type CreateCheckoutInput = {
  plan: Plan;
  billing: Billing;
  reference: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
  returnUrl: string;
};

/**
 * Create a Lemon Squeezy hosted-checkout session and return its URL.
 * Returns null when LS isn't configured (env keys missing) — the caller
 * should fall back to the bank-transfer UI in that case.
 */
export async function createCheckout(
  input: CreateCheckoutInput,
): Promise<{ url: string; id: string } | null> {
  if (!isLemonConfigured()) return null;
  const variantId = variantIdFor(input.plan, input.billing);
  if (!variantId) return null;

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: input.userEmail,
          name: input.userName ?? undefined,
          custom: {
            user_id: input.userId,
            reference: input.reference,
            plan: input.plan,
            billing: input.billing,
          },
        },
        product_options: {
          redirect_url: input.returnUrl,
          receipt_button_text: "Back to Addvoxen",
          receipt_link_url: input.returnUrl,
        },
        checkout_options: {
          embed: false,
          dark: true,
          logo: true,
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: String(process.env.LEMON_STORE_ID) },
        },
        variant: {
          data: { type: "variants", id: String(variantId) },
        },
      },
    },
  };

  const resp = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("LS createCheckout failed", resp.status, text);
    return null;
  }
  const json = (await resp.json()) as {
    data?: { id?: string; attributes?: { url?: string } };
  };
  const url = json.data?.attributes?.url;
  const id = json.data?.id;
  if (!url || !id) return null;
  return { url, id };
}

/** Validate the X-Signature header sent on every LS webhook. */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;
  const hmac = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
