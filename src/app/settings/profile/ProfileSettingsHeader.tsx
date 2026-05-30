"use client";

import { useLocale } from "@/components/site/LocaleContext";

export function ProfileSettingsHeader({ handle }: { handle: string }) {
  const { t } = useLocale();
  const tpl = t("settings.profile.handle_help");
  const idx = tpl.indexOf("{url}");
  const before = idx === -1 ? tpl : tpl.slice(0, idx);
  const after = idx === -1 ? "" : tpl.slice(idx + "{url}".length);

  return (
    <>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
        {t("settings.profile.title")}
      </h1>
      <p className="text-on-surface-variant text-body-md font-body-md mb-8">
        {before}
        <code className="bg-surface-container-high/50 px-1.5 py-0.5 rounded text-on-surface">
          /u/{handle}
        </code>
        {after}
      </p>
    </>
  );
}
