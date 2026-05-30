"use client";

import { useLocale } from "@/components/site/LocaleContext";

export function SupportHeader() {
  const { t } = useLocale();

  const tpl = t("support.email_prompt");
  const idx = tpl.indexOf("{email}");
  const beforeEmail = idx === -1 ? tpl : tpl.slice(0, idx);
  const afterEmail = idx === -1 ? "" : tpl.slice(idx + "{email}".length);

  return (
    <header className="mb-8">
      <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
        {t("support.eyebrow")}
      </p>
      <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
        {t("support.title")}
      </h1>
      <p className="text-on-surface-variant text-body-md font-body-md mt-3">
        {t("support.body")}
      </p>
      <p className="text-on-surface-variant text-label-sm font-label-sm mt-3">
        {beforeEmail}
        <a
          href="mailto:support@addvoxen.com"
          className="text-primary hover:underline"
        >
          support@addvoxen.com
        </a>
        {afterEmail}
      </p>
    </header>
  );
}
