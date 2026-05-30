/**
 * Pricing matrix per (plan, billing cycle, currency). The amount is the
 * actual price in that currency, NOT a converted USD figure — so AZN users
 * see the locally fair price, not a noisy FX result.
 *
 * If a currency isn't in PRICE_TABLE, we fall back to the USD price and
 * the user pays in USD. Card processors will then do FX conversion.
 */
export type Plan = "pro" | "team" | "enterprise";
export type Billing = "monthly" | "yearly";

type PriceCell = { amountCents: number; label: string };

const USD: Record<Plan, Record<Billing, PriceCell>> = {
  pro: {
    // TEST MODE — $1.00 because PayPal rejects amounts under ~$0.99 with
    // the generic "Something went wrong" error. Bump to 1200 / 11500 before
    // going live.
    monthly: { amountCents: 100, label: "$1.00" },
    yearly: { amountCents: 100, label: "$1.00" },
  },
  team: {
    monthly: { amountCents: 2500, label: "$25" },
    yearly: { amountCents: 24000, label: "$240" },
  },
  enterprise: {
    monthly: { amountCents: 9900, label: "$99" },
    yearly: { amountCents: 99900, label: "$999" },
  },
};

// Local pricing — picked to land near the global price after market-rate
// FX, so paying via a local gateway feels fair.
const AZN: Record<Plan, Record<Billing, PriceCell>> = {
  pro: {
    monthly: { amountCents: 2000_00, label: "20 ₼" },
    yearly: { amountCents: 195_00_00, label: "195 ₼" },
  },
  team: {
    monthly: { amountCents: 4200_00, label: "42 ₼" },
    yearly: { amountCents: 408_00_00, label: "408 ₼" },
  },
  enterprise: {
    monthly: { amountCents: 168_00_00, label: "168 ₼" },
    yearly: { amountCents: 1700_00_00, label: "1700 ₼" },
  },
};

const TRY: Record<Plan, Record<Billing, PriceCell>> = {
  pro: { monthly: { amountCents: 39900, label: "₺399" }, yearly: { amountCents: 383900, label: "₺3,839" } },
  team: { monthly: { amountCents: 83100, label: "₺831" }, yearly: { amountCents: 797600, label: "₺7,976" } },
  enterprise: { monthly: { amountCents: 329000, label: "₺3,290" }, yearly: { amountCents: 3318900, label: "₺33,189" } },
};

const RUB: Record<Plan, Record<Billing, PriceCell>> = {
  pro: { monthly: { amountCents: 110000, label: "₽1,100" }, yearly: { amountCents: 1058000, label: "₽10,580" } },
  team: { monthly: { amountCents: 230000, label: "₽2,300" }, yearly: { amountCents: 2208000, label: "₽22,080" } },
  enterprise: { monthly: { amountCents: 910000, label: "₽9,100" }, yearly: { amountCents: 9190000, label: "₽91,900" } },
};

const EUR: Record<Plan, Record<Billing, PriceCell>> = {
  pro: { monthly: { amountCents: 1100, label: "€11" }, yearly: { amountCents: 10500, label: "€105" } },
  team: { monthly: { amountCents: 2300, label: "€23" }, yearly: { amountCents: 22000, label: "€220" } },
  enterprise: { monthly: { amountCents: 9000, label: "€90" }, yearly: { amountCents: 91000, label: "€910" } },
};

const PRICE_TABLE: Record<string, Record<Plan, Record<Billing, PriceCell>>> = {
  USD,
  AZN,
  TRY,
  RUB,
  EUR,
};

export function getPrice(plan: Plan, billing: Billing, currency: string): PriceCell {
  const cur = currency.toUpperCase();
  return PRICE_TABLE[cur]?.[plan]?.[billing] ?? USD[plan][billing];
}

/** Short human-readable reference like ADV-A4F2-9KMP. Used as the bank
 *  transfer reference so admins can match payments to intents quickly. */
export function makeReference(): string {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ADV-${a}-${b}`;
}

/** Local gateway routing — what does the user actually see on /checkout? */
export function paymentProviderFor(country: string): {
  provider: string;
  label: string;
  description: string;
} {
  const c = country.toUpperCase();
  if (c === "AZ") {
    return {
      provider: "bank_transfer_az",
      label: "Bank transfer (AZN)",
      description:
        "Pay via local bank transfer. You'll get account details + a reference code; admin confirms within 1 business day.",
    };
  }
  if (c === "TR") {
    return {
      provider: "bank_transfer_tr",
      label: "Banka havalesi (TRY)",
      description: "Türk lirası ile banka havalesi. Onay 1 iş günü içinde.",
    };
  }
  return {
    provider: "card",
    label: "Card payment",
    description:
      "Visa, Mastercard or AmEx accepted globally. Charged in your local currency.",
  };
}
