"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/site/LocaleContext";
import { PayPalButton } from "./PayPalButton";

const PAYPAL_ENABLED = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

type Plan = "pro" | "team" | "enterprise";
type Billing = "monthly" | "yearly";

type IntentResponse = {
  id: string;
  reference: string;
  plan: Plan;
  billing: Billing;
  amountCents: number;
  currency: string;
  country: string;
  provider: string;
  providerLabel: string;
  providerDescription: string;
  priceLabel: string;
  checkoutUrl?: string | null;
};

const PLAN_LABEL: Record<Plan, string> = {
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
};

export function CheckoutClient({
  plan,
  billing,
  userEmail,
}: {
  plan: Plan;
  billing: Billing;
  userEmail: string;
}) {
  const { locale } = useLocale();
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create the intent as soon as the page mounts so the user sees their
  // reference + price immediately.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/billing/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            billing,
            country: locale.country,
            currency: locale.currency,
          }),
        });
        const data = await r.json();
        if (!r.ok) {
          if (!cancelled) setError(data?.error ?? "Could not create intent");
        } else if (!cancelled) {
          setIntent(data);
        }
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
      // re-run if the user changes country mid-flight
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, billing, locale.country, locale.currency]);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-3xl mx-auto">
        <Link
          href="/pricing"
          className="text-on-surface-variant hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 mb-6"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to plans
        </Link>

        <header className="mb-8">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
            Checkout
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
            Upgrade to {PLAN_LABEL[plan]}
          </h1>
          <p className="text-on-surface-variant text-body-md font-body-md mt-2">
            Country: <span className="text-on-surface">{locale.flag} {locale.label}</span>
            {" · "}
            Currency: <span className="text-on-surface">{locale.currency}</span>
          </p>
        </header>

        {loading && (
          <div className="glass-panel rounded-3xl p-8 text-center">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <p className="mt-3 text-on-surface-variant">Preparing checkout…</p>
          </div>
        )}

        {error && (
          <div className="glass-panel rounded-3xl p-8 text-center border border-error/30">
            <p className="text-error font-label-md text-label-md">{error}</p>
          </div>
        )}

        {intent && (
          <>
            <section className="glass-panel rounded-2xl p-5 mb-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-surface text-label-md font-label-md">
                    {PLAN_LABEL[intent.plan]} · {intent.billing}
                  </p>
                  <p className="text-on-surface-variant text-label-sm font-label-sm">
                    Billed {intent.billing === "yearly" ? "once per year" : "monthly"}
                  </p>
                </div>
                <p className="text-on-surface font-display-sm text-display-sm">
                  {intent.priceLabel}
                </p>
              </div>
            </section>

            {intent.provider === "lemon" && intent.checkoutUrl ? (
              <LemonUI intent={intent} />
            ) : intent.provider.startsWith("bank_transfer") ? (
              <BankTransferUI intent={intent} userEmail={userEmail} />
            ) : intent.provider === "card" ? (
              <CardUI intent={intent} userEmail={userEmail} />
            ) : (
              <PlaceholderUI intent={intent} />
            )}

            {/* PayPal is offered alongside every other path so a customer
             *  who prefers PayPal isn't forced down the bank-transfer or
             *  card UX. Hidden entirely when the env keys aren't wired. */}
            {PAYPAL_ENABLED && (
              <section className="glass-panel rounded-2xl p-6 border border-white/10 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">
                    payments
                  </span>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                    Or pay with PayPal
                  </h2>
                </div>
                <p className="text-on-surface-variant text-body-md font-body-md mb-4">
                  Pay {intent.priceLabel} from your PayPal balance, linked
                  card or bank — funds settle to the Addvoxen Business
                  account.
                </p>
                <PayPalButton
                  intentId={intent.id}
                  reference={intent.reference}
                  currency={intent.currency}
                />
              </section>
            )}

            <p className="mt-6 text-on-surface-variant text-label-sm font-label-sm text-center">
              Trouble paying? Email{" "}
              <a
                href="mailto:support@addvoxen.com"
                className="text-primary hover:underline"
              >
                support@addvoxen.com
              </a>{" "}
              with your reference{" "}
              <code className="bg-surface-container-high/60 px-1.5 py-0.5 rounded text-on-surface">
                {intent.reference}
              </code>
              .
            </p>
          </>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
//  Provider-specific UIs
// ---------------------------------------------------------------------------

function BankTransferUI({
  intent,
  userEmail,
}: {
  intent: IntentResponse;
  userEmail: string;
}) {
  // Placeholder bank details — swap to real Addvoxen LLC account once the
  // company entity is registered.
  const AZ = intent.country === "AZ";
  const bank = AZ
    ? {
        bank: "Kapital Bank",
        iban: "AZ65 NABZ 0123 4500 0000 1234 5678",
        swift: "AIIBAZ2X",
        beneficiary: "Addvoxen MMC",
        taxId: "1234567891",
      }
    : {
        bank: "Akbank",
        iban: "TR12 0046 0000 1234 5678 9012 34",
        swift: "AKBKTRIS",
        beneficiary: "Addvoxen Yazılım A.Ş.",
        taxId: "—",
      };
  return (
    <section className="glass-panel rounded-2xl p-6 border border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary">account_balance</span>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          {intent.providerLabel}
        </h2>
      </div>
      <p className="text-on-surface-variant text-body-md font-body-md mb-5">
        {intent.providerDescription}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Row label="Beneficiary" value={bank.beneficiary} />
        <Row label="Bank" value={bank.bank} />
        <Row label="IBAN" value={bank.iban} mono />
        <Row label="SWIFT / BIC" value={bank.swift} mono />
        <Row label="Tax ID / VÖEN" value={bank.taxId} />
        <Row label="Amount" value={intent.priceLabel} />
      </div>

      <div className="bg-primary-container/15 border border-primary/40 rounded-xl p-4">
        <p className="text-on-surface text-label-md font-label-md mb-1">
          Use this reference on the transfer description:
        </p>
        <p className="font-mono text-display-sm text-primary tracking-wider">
          {intent.reference}
        </p>
        <p className="text-on-surface-variant text-label-sm font-label-sm mt-2">
          We match payments by reference. Without it the approval will take
          longer.
        </p>
      </div>

      <p className="mt-4 text-on-surface-variant text-label-sm font-label-sm">
        Once received we&apos;ll upgrade <span className="text-on-surface">{userEmail}</span>{" "}
        and email a confirmation. Usually within one business day.
      </p>
    </section>
  );
}

function CardUI({ intent }: { intent: IntentResponse; userEmail: string }) {
  return (
    <section className="glass-panel rounded-2xl p-6 border border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary">credit_card</span>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          {intent.providerLabel}
        </h2>
      </div>
      <p className="text-on-surface-variant text-body-md font-body-md">
        {intent.providerDescription}
      </p>

      <div className="mt-5 bg-surface-container-high/50 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">
            schedule
          </span>
          <p className="text-on-surface font-label-md text-label-md">
            Card processing coming online
          </p>
        </div>
        <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
          The Addvoxen merchant-of-record entity is registering now. Until
          card capture is live (target Q3 2026) you can either{" "}
          <Link href="/checkout?plan=pro&billing=monthly" className="text-primary hover:underline">
            switch to AZN bank transfer
          </Link>{" "}
          (works today) or email{" "}
          <a
            href="mailto:support@addvoxen.com"
            className="text-primary hover:underline"
          >
            support@addvoxen.com
          </a>{" "}
          with reference{" "}
          <code className="bg-surface-container-high/60 px-1.5 py-0.5 rounded text-on-surface">
            {intent.reference}
          </code>{" "}
          and we&apos;ll send you an invoice link manually.
        </p>
      </div>

      <p className="mt-4 text-on-surface-variant text-label-sm font-label-sm">
        We&apos;ll plug Lemon Squeezy / Polar.sh into this surface as soon as
        the company entity is signed — your existing payment intent stays
        valid through the cutover.
      </p>
    </section>
  );
}

function LemonUI({ intent }: { intent: IntentResponse }) {
  return (
    <section className="glass-panel rounded-2xl p-6 border border-primary/40">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary">credit_card</span>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          {intent.providerLabel}
        </h2>
      </div>
      <p className="text-on-surface-variant text-body-md font-body-md mb-5">
        {intent.providerDescription}
      </p>
      <a
        href={intent.checkoutUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="block text-center ai-gradient text-on-primary px-6 py-3.5 rounded-full text-label-md font-label-md hover:shadow-[0_0_24px_rgba(208,188,255,0.4)] active:scale-95 transition-all"
      >
        Continue to secure checkout · {intent.priceLabel}
      </a>
      <p className="mt-4 text-on-surface-variant text-label-sm font-label-sm">
        Powered by Lemon Squeezy — a global merchant of record. You&apos;ll
        return to Addvoxen automatically once the payment clears. Your
        reference{" "}
        <code className="bg-surface-container-high/60 px-1.5 py-0.5 rounded text-on-surface">
          {intent.reference}
        </code>{" "}
        is attached for support follow-up.
      </p>
    </section>
  );
}

function PlaceholderUI({ intent }: { intent: IntentResponse }) {
  return (
    <section className="glass-panel rounded-2xl p-6 border border-white/10">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
        {intent.providerLabel}
      </h2>
      <p className="text-on-surface-variant text-body-md font-body-md">
        {intent.providerDescription}
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-surface-container-high/40 rounded-lg p-3">
      <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={
          "text-on-surface text-label-md font-label-md " +
          (mono ? "font-mono tracking-tight break-all" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
