"use client";

import Link from "next/link";
import { useLocale } from "@/components/site/LocaleContext";

const FEATURES = [
  { icon: "rocket_launch", titleKey: "campaigns.f1.title", bodyKey: "campaigns.f1.body" },
  { icon: "monitoring", titleKey: "campaigns.f2.title", bodyKey: "campaigns.f2.body" },
  { icon: "auto_awesome", titleKey: "campaigns.f3.title", bodyKey: "campaigns.f3.body" },
];

export function CampaignsLanding() {
  const { t } = useLocale();

  const ctaTpl = t("campaigns.empty.cta");
  const emailIdx = ctaTpl.indexOf("{email}");
  const beforeEmail = emailIdx === -1 ? ctaTpl : ctaTpl.slice(0, emailIdx);
  const afterEmail = emailIdx === -1 ? "" : ctaTpl.slice(emailIdx + "{email}".length);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-3">
            {t("campaigns.eyebrow")}
          </p>
          <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-4">
            {t("campaigns.title")}
          </h1>
          <p className="text-on-surface-variant text-body-lg font-body-lg max-w-2xl mx-auto">
            {t("campaigns.body")}
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/about#roadmap"
              className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t("campaigns.cta.roadmap")}
            </Link>
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all"
            >
              {t("campaigns.cta.design")}
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className="glass-panel rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl ai-gradient flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-primary text-[22px]">
                  {f.icon}
                </span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
                {t(f.titleKey)}
              </h3>
              <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                {t(f.bodyKey)}
              </p>
            </div>
          ))}
        </section>

        <section className="glass-panel rounded-3xl p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary text-2xl">
              schedule
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
            {t("campaigns.empty.title")}
          </h2>
          <p className="text-on-surface-variant text-body-md font-body-md max-w-xl mx-auto mb-6">
            {t("campaigns.empty.body")}
          </p>
          <p className="text-on-surface-variant text-label-sm font-label-sm">
            {beforeEmail}
            <a
              href="mailto:support@addvoxen.com?subject=Campaigns%20early%20access"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>
            {afterEmail}
          </p>
        </section>
      </div>
    </main>
  );
}
