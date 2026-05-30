"use client";

import Link from "next/link";
import { useLocale } from "@/components/site/LocaleContext";

export function BannerBreadcrumb() {
  const { t } = useLocale();
  return (
    <Link href="/marketplace" className="hover:text-on-surface">
      {t("banner.breadcrumb.marketplace")}
    </Link>
  );
}

export function BannerCreatorLabel({
  isOfficial,
  creatorName,
}: {
  isOfficial: boolean;
  creatorName: string | null;
}) {
  const { t } = useLocale();
  if (isOfficial) return <>{t("banner.creator.official")}</>;
  return <>{creatorName ?? t("banner.creator.community")}</>;
}

export function BannerCreatorRoleLabel({ isOfficial }: { isOfficial: boolean }) {
  const { t } = useLocale();
  return (
    <>
      {isOfficial
        ? t("banner.creator.curated")
        : t("banner.creator.view_profile")}
    </>
  );
}

export function BannerStatLabel({
  kind,
}: {
  kind: "likes" | "comments" | "uses";
}) {
  const { t } = useLocale();
  return <>{t(`banner.stat.${kind}`)}</>;
}

export function BannerUseCta({
  slug,
  price,
}: {
  slug: string;
  price: string;
}) {
  const { t } = useLocale();
  return (
    <Link
      href={`/editor?template=${slug}`}
      className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md text-center hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined text-[18px]">edit</span>
      {t("banner.cta.use").replace("{price}", price)}
    </Link>
  );
}
