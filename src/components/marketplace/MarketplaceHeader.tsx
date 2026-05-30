"use client";

import Link from "next/link";
import { useLocale } from "@/components/site/LocaleContext";

export function MarketplaceHeader({
  totalCount,
  signedIn,
}: {
  totalCount: number;
  signedIn: boolean;
}) {
  const { t } = useLocale();
  const title = t("marketplace.title_template").replace(
    "{count}",
    String(totalCount),
  );

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
      <div>
        <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
          {t("marketplace.eyebrow")}
        </p>
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
          {title}
        </h1>
        <p className="text-on-surface-variant text-body-md font-body-md mt-2">
          {t("marketplace.subtitle")}
        </p>
      </div>
      {signedIn && (
        <Link
          href="/editor?new=1"
          className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t("marketplace.blank_canvas")}
        </Link>
      )}
    </div>
  );
}

export function MarketplaceEmpty() {
  const { t } = useLocale();
  return (
    <div className="glass-panel rounded-3xl p-12 text-center">
      <p className="text-on-surface-variant text-body-md font-body-md">
        {t("marketplace.empty")}
      </p>
      <Link
        href="/marketplace"
        className="text-primary text-label-md font-label-md hover:underline mt-3 inline-block"
      >
        {t("marketplace.reset")}
      </Link>
    </div>
  );
}
