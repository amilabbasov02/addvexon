import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import {
  getPrice,
  makeReference,
  paymentProviderFor,
  type Billing,
  type Plan,
} from "@/lib/billing-pricing";
import { sendEmail } from "@/lib/email";
import {
  createCheckout as createLemonCheckout,
  isLemonConfigured,
} from "@/lib/lemon-squeezy";

function uid() {
  return `pi_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const PLANS: Plan[] = ["pro", "team", "enterprise"];
const BILLINGS: Billing[] = ["monthly", "yearly"];

/**
 * POST /api/billing/intent  → creates a pending payment_intent and returns
 * the reference + gateway info so /checkout can render the right UI.
 *
 * Country-aware: AZ users get bank-transfer instructions; international
 * users get a card-payment placeholder (Lemon Squeezy / Polar will plug in
 * here when the company entity is registered).
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as {
      plan?: string;
      billing?: string;
      country?: string;
      currency?: string;
    };
    const plan = body.plan as Plan;
    const billing = (body.billing as Billing) ?? "monthly";
    const country = (body.country ?? "US").toUpperCase().slice(0, 4);
    const currency = (body.currency ?? "USD").toUpperCase().slice(0, 4);

    if (!PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!BILLINGS.includes(billing)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const price = getPrice(plan, billing, currency);
    const gateway = paymentProviderFor(country);
    const reference = makeReference();
    const id = uid();

    await db.insert(paymentIntents).values({
      id,
      userId: user.id,
      plan,
      billing,
      amountCents: price.amountCents,
      currency,
      country,
      provider: gateway.provider,
      reference,
    });

    // International card flow → ask Lemon Squeezy to mint a hosted checkout
    // URL. We still keep the intent row above so admin sees the lifecycle;
    // the LS webhook reconciles by reference when payment clears.
    let lemonUrl: string | null = null;
    if (gateway.provider === "card" && isLemonConfigured()) {
      const baseUrl =
        process.env.BETTER_AUTH_URL ?? "http://localhost:3210";
      const checkout = await createLemonCheckout({
        plan,
        billing,
        reference,
        userId: user.id,
        userEmail: user.email,
        userName: user.name ?? null,
        returnUrl: `${baseUrl}/dashboard?upgrade=success&ref=${reference}`,
      });
      if (checkout) {
        lemonUrl = checkout.url;
        await db
          .update(paymentIntents)
          .set({ externalId: checkout.id, provider: "lemon" })
          .where(eq(paymentIntents.id, id));
      }
    }

    // Notify the support inbox so the admin knows a transfer is incoming.
    // Falls through to console.log when Resend isn't configured.
    try {
      await sendEmail({
        to: process.env.SUPPORT_EMAIL ?? "support@addvoxen.com",
        subject: `[Addvoxen billing] New ${plan} ${billing} intent · ${reference}`,
        text: [
          `New payment intent`,
          ``,
          `Reference:  ${reference}`,
          `User:       ${user.email} (${user.id})`,
          `Plan:       ${plan} ${billing}`,
          `Amount:     ${price.label} (${price.amountCents} ${currency})`,
          `Country:    ${country}`,
          `Provider:   ${gateway.provider}`,
          ``,
          `Confirm at /admin/payments once you've received the transfer.`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("billing notify failed", err);
    }

    return NextResponse.json({
      id,
      reference,
      plan,
      billing,
      amountCents: price.amountCents,
      currency,
      country,
      provider: lemonUrl ? "lemon" : gateway.provider,
      providerLabel: lemonUrl ? "Card · Apple Pay · Google Pay" : gateway.label,
      providerDescription: lemonUrl
        ? "Hosted secure checkout — Visa, Mastercard, Amex, Apple Pay, Google Pay and PayPal accepted."
        : gateway.description,
      priceLabel: price.label,
      checkoutUrl: lemonUrl,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("intent error", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
