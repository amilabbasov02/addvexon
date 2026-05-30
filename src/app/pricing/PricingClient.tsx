"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { PaymentNotice } from "@/components/site/PaymentNotice";
import { useLocale } from "@/components/site/LocaleContext";

type Cycle = "monthly" | "yearly";

/** Tier metadata as translation-key references, not English strings.
 *  The component resolves them via t() so the table reflects the user's
 *  selected language. */
const TIERS = [
  {
    id: "free" as const,
    nameKey: "tier.free.name",
    taglineKey: "tier.free.tagline",
    priceMonthly: 0,
    priceYearly: 0,
    featureKeys: [
      "tier.free.f1",
      "tier.free.f2",
      "tier.free.f3",
      "tier.free.f4",
      "tier.free.f5",
    ],
    notIncludedKeys: ["tier.free.n1", "tier.free.n2", "tier.free.n3"],
    ctaKey: "tier.free.cta",
    waitlistPlan: null,
    accent: false,
  },
  {
    id: "pro" as const,
    nameKey: "tier.pro.name",
    taglineKey: "tier.pro.tagline",
    priceMonthly: 12,
    priceYearly: 115,
    featureKeys: [
      "tier.pro.f1",
      "tier.pro.f2",
      "tier.pro.f3",
      "tier.pro.f4",
      "tier.pro.f5",
      "tier.pro.f6",
      "tier.pro.f7",
      "tier.pro.f8",
    ],
    notIncludedKeys: [],
    ctaKey: "tier.pro.cta",
    waitlistPlan: "pro" as const,
    accent: true,
  },
  {
    id: "team" as const,
    nameKey: "tier.team.name",
    taglineKey: "tier.team.tagline",
    priceMonthly: 25,
    priceYearly: 240,
    featureKeys: [
      "tier.team.f1",
      "tier.team.f2",
      "tier.team.f3",
      "tier.team.f4",
      "tier.team.f5",
      "tier.team.f6",
      "tier.team.f7",
      "tier.team.f8",
    ],
    notIncludedKeys: [],
    ctaKey: "tier.team.cta",
    waitlistPlan: "team" as const,
    accent: false,
  },
];

export function PricingClient({
  signedIn,
  currentPlan,
  userEmail,
}: {
  signedIn: boolean;
  currentPlan: string;
  userEmail?: string;
}) {
  const { t } = useLocale();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [waitlistFor, setWaitlistFor] = useState<
    "pro" | "team" | "enterprise" | null
  >(null);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-7xl mx-auto">
        <PaymentNotice />
        <div className="text-center mb-12">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-3">
            {t("pricing.eyebrow")}
          </p>
          <h1 className="font-display-lg text-display-lg font-bold text-on-surface mb-4 bg-linear-to-b from-on-surface to-on-surface/60 bg-clip-text">
            {t("pricing.title")}
          </h1>
          <p className="text-on-surface-variant text-body-lg font-body-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>

          <div className="inline-flex items-center gap-1 mt-8 p-1 glass-panel rounded-full">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={
                "px-5 py-2 rounded-full text-label-md font-label-md transition-colors " +
                (cycle === "monthly"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface")
              }
            >
              {t("pricing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={
                "px-5 py-2 rounded-full text-label-md font-label-md transition-colors " +
                (cycle === "yearly"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface")
              }
            >
              {t("pricing.yearly")}
              <span className="ml-2 text-[10px] text-tertiary-fixed-dim font-bold">
                {t("pricing.save_2_months")}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const price =
              cycle === "monthly" ? tier.priceMonthly : tier.priceYearly;
            const monthlyEquiv =
              cycle === "yearly" && tier.priceYearly > 0
                ? `$${(tier.priceYearly / 12).toFixed(2)}/mo`
                : null;
            const isCurrent = currentPlan === tier.id;

            return (
              <div
                key={tier.id}
                className={
                  "relative flex flex-col rounded-3xl p-7 transition-all " +
                  (tier.accent
                    ? "ai-gradient text-on-primary shadow-2xl scale-[1.02]"
                    : "glass-panel text-on-surface border border-white/10")
                }
              >
                {tier.accent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-on-primary text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3
                  className={
                    "font-headline-lg-mobile text-headline-lg-mobile font-bold mb-1 " +
                    (tier.accent ? "text-on-primary" : "text-on-surface")
                  }
                >
                  {t(tier.nameKey)}
                </h3>
                <p
                  className={
                    "text-label-md font-label-md mb-6 " +
                    (tier.accent
                      ? "text-on-primary/80"
                      : "text-on-surface-variant")
                  }
                >
                  {t(tier.taglineKey)}
                </p>
                <div className="flex items-end gap-2 mb-1">
                  <span
                    className={
                      "font-display-sm text-display-sm font-bold " +
                      (tier.accent ? "text-on-primary" : "text-on-surface")
                    }
                  >
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span
                      className={
                        "text-label-md font-label-md mb-2 " +
                        (tier.accent
                          ? "text-on-primary/80"
                          : "text-on-surface-variant")
                      }
                    >
                      /{cycle === "monthly" ? "mo" : "yr"}
                      {tier.id === "team" && " /seat"}
                    </span>
                  )}
                </div>
                {monthlyEquiv ? (
                  <p
                    className={
                      "text-label-sm font-label-sm mb-6 " +
                      (tier.accent
                        ? "text-on-primary/70"
                        : "text-on-surface-variant")
                    }
                  >
                    Billed yearly · {monthlyEquiv}
                  </p>
                ) : (
                  <div className="mb-6" />
                )}

                <ul className="flex flex-col gap-2 mb-8">
                  {tier.featureKeys.map((f) => (
                    <li
                      key={f}
                      className={
                        "flex gap-2 items-start text-label-md font-label-md " +
                        (tier.accent ? "text-on-primary" : "text-on-surface")
                      }
                    >
                      <span
                        className={
                          "material-symbols-outlined text-[18px] mt-0.5 shrink-0 " +
                          (tier.accent
                            ? "text-on-primary"
                            : "text-tertiary-fixed-dim")
                        }
                      >
                        check_circle
                      </span>
                      {t(f)}
                    </li>
                  ))}
                  {tier.notIncludedKeys.map((f) => (
                    <li
                      key={f}
                      className={
                        "flex gap-2 items-start text-label-md font-label-md opacity-50 line-through " +
                        (tier.accent
                          ? "text-on-primary"
                          : "text-on-surface-variant")
                      }
                    >
                      <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">
                        block
                      </span>
                      {t(f)}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className={
                      "w-full py-3 rounded-full text-center text-label-md font-label-md " +
                      (tier.accent
                        ? "bg-on-primary/20 text-on-primary"
                        : "border border-white/15 text-on-surface-variant")
                    }
                  >
                    {t("pricing.current_plan")}
                  </div>
                ) : tier.waitlistPlan ? (
                  <Link
                    href={`/checkout?plan=${tier.waitlistPlan}&billing=${cycle}`}
                    className={
                      "block text-center w-full py-3 rounded-full text-label-md font-label-md transition-all " +
                      (tier.accent
                        ? "bg-on-primary text-primary hover:opacity-90"
                        : "bg-primary text-on-primary hover:opacity-90")
                    }
                  >
                    {t(tier.ctaKey)}
                  </Link>
                ) : (
                  <Link
                    href={signedIn ? "/dashboard" : "/signup"}
                    className="block text-center w-full py-3 rounded-full text-label-md font-label-md border border-white/15 text-on-surface hover:bg-white/5 transition-all"
                  >
                    {t(tier.ctaKey)}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 glass-panel rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-tertiary">
              business_center
            </span>
          </div>
          <div className="flex-1">
            <p className="text-on-surface font-label-md text-label-md">
              Enterprise — for agencies & 50+ teams
            </p>
            <p className="text-on-surface-variant text-label-sm font-label-sm">
              SSO, audit log, dedicated support, custom integrations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWaitlistFor("enterprise")}
            className="glass-panel px-5 py-2.5 rounded-full text-label-md font-label-md text-on-surface hover:bg-white/5 transition-colors"
          >
            Contact sales
          </button>
        </div>

        <p className="text-center mt-10 text-on-surface-variant text-label-sm font-label-sm">
          All prices in USD · No payment now — we reach out when paid plans open.
        </p>

        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-8">
            Frequently asked
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "When do paid plans launch?",
                a: "We're onboarding waitlist users in waves — first cohort within 4-6 weeks. You'll get an email with personal access details when it's your turn.",
              },
              {
                q: "What does the Free plan get me right now?",
                a: "Full editor, free templates, image upload (50 MB), cloud autosave, watermarked export. Enough to ship real campaigns; the watermark is the only reminder.",
              },
              {
                q: "Will I keep my designs forever?",
                a: "Yes — your designs stay in your account regardless of plan. Downgrading just removes access to Pro-only features, not your work.",
              },
              {
                q: "Do you offer custom enterprise pricing?",
                a: "Yes — Enterprise covers SSO, audit log, dedicated support and bespoke integrations. Hit 'Contact sales' above.",
              },
              {
                q: "How will I pay when access opens?",
                a: "We'll send invoice + bank transfer details directly. Card payment opens later, once our billing integration is complete.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="glass-panel rounded-xl p-5 group"
              >
                <summary className="flex justify-between items-center cursor-pointer text-on-surface font-label-md text-label-md">
                  {item.q}
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="text-on-surface-variant text-body-md font-body-md mt-3 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <WaitlistDialog
        open={waitlistFor !== null}
        defaultPlan={waitlistFor ?? "pro"}
        defaultEmail={userEmail}
        onClose={() => setWaitlistFor(null)}
      />
    </main>
  );
}
