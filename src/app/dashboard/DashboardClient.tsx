"use client";

import Link from "next/link";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { useLocale } from "@/components/site/LocaleContext";

type TemplateCardDoc = {
  canvasSize: { width: number; height: number };
  background: string;
  layers: unknown[];
};

type DocRow = {
  id: string;
  title: string;
  canvasSize: TemplateCardDoc["canvasSize"];
  thumbnailUrl: string | null;
  background: string;
  layers: unknown[];
  updatedAt: Date;
};

type TemplateRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  tier: string;
  document: TemplateCardDoc;
  thumbnailUrl: string | null;
};

export function DashboardClient({
  user,
  plan,
  docs,
  featured,
}: {
  user: { name?: string | null; email?: string | null };
  plan: string;
  docs: DocRow[];
  featured: TemplateRow[];
}) {
  const { t } = useLocale();

  const displayName =
    user.name ?? user.email?.split("@")[0] ?? t("profile.role.designer");
  const countMsg =
    docs.length === 0
      ? t("dashboard.empty_msg")
      : t("dashboard.count_msg").replace("{n}", String(docs.length));

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
              {t("dashboard.eyebrow")}
            </p>
            <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
              {displayName}
            </h1>
            <p className="text-on-surface-variant text-body-md font-body-md mt-2">
              {countMsg}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/marketplace"
              className="glass-panel px-5 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
              {t("common.browse_templates")}
            </Link>
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t("dashboard.new_design")}
            </Link>
          </div>
        </div>

        {plan === "free" && (
          <Link
            href="/pricing"
            className="block mb-10 glass-panel rounded-2xl p-5 border border-primary/30 hover:border-primary/60 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl ai-gradient flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary">
                  bolt
                </span>
              </div>
              <div className="flex-1">
                <p className="text-on-surface font-label-md text-label-md">
                  {t("dashboard.pro_card.title")}
                </p>
                <p className="text-on-surface-variant text-label-sm font-label-sm">
                  {t("dashboard.pro_card.body")}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        )}

        <section className="mb-12">
          <div className="flex justify-between items-end mb-5">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {t("dashboard.section.my")}
            </h2>
            {docs.length > 0 && (
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                {t("dashboard.shown_of")
                  .replace("{n}", String(docs.length))
                  .replace("{total}", "24")}
              </span>
            )}
          </div>

          {docs.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  draw
                </span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
                {t("dashboard.empty.title")}
              </h3>
              <p className="text-on-surface-variant text-body-md font-body-md mb-6 max-w-md mx-auto">
                {t("dashboard.empty.body")}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/editor?new=1"
                  className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  {t("dashboard.new_design")}
                </Link>
                <Link
                  href="/marketplace"
                  className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-2"
                >
                  {t("common.browse_templates")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {docs.map((d) => (
                <DocumentCard key={d.id} doc={d} />
              ))}
            </div>
          )}
        </section>

        {featured.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-5">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {t("dashboard.section.trending")}
              </h2>
              <Link
                href="/marketplace"
                className="text-primary text-label-md font-label-md hover:gap-3 transition-all flex items-center gap-2"
              >
                {t("dashboard.see_all")}
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={{
                    id: tpl.id,
                    slug: tpl.slug,
                    name: tpl.name,
                    category: tpl.category,
                    tagline: tpl.tagline ?? null,
                    tier: tpl.tier,
                    thumbnailUrl: tpl.thumbnailUrl,
                    document: tpl.document,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
