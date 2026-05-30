"use client";

import { useLocale } from "@/components/site/LocaleContext";

export function ProfileRoleBadge({ plan }: { plan: string | null }) {
  const { t } = useLocale();
  if (plan === "pro" || plan === "team") {
    return (
      <>{t("profile.role.member").replace("{plan}", plan.toUpperCase())}</>
    );
  }
  return <>{t("profile.role.designer")}</>;
}

export function ProfileJoined({ date }: { date: string }) {
  const { t } = useLocale();
  return <>{t("profile.joined").replace("{date}", date)}</>;
}

export function ProfileStatLabel({
  kind,
}: {
  kind: "templates" | "likes" | "comments" | "sales";
}) {
  const { t } = useLocale();
  return <>{t(`profile.stat.${kind}`)}</>;
}

export function ProfileSectionHeading({ name }: { name: string }) {
  const { t } = useLocale();
  return <>{t("profile.section.templates").replace("{name}", name)}</>;
}

export function ProfileEmpty({ isMe }: { isMe: boolean }) {
  const { t } = useLocale();
  return <>{isMe ? t("profile.empty.self") : t("profile.empty.other")}</>;
}

export function ProfileEditCta() {
  const { t } = useLocale();
  return <>{t("profile.edit")}</>;
}

export function ProfileEditOverlay() {
  const { t } = useLocale();
  return <>{t("common.edit")}</>;
}
