"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/site/LocaleContext";

export function MarketplaceFilters({
  categories,
  sourceCounts,
  activeCategory,
  activeTier,
  activeQuery,
  activeSource,
}: {
  categories: { category: string; n: number }[];
  sourceCounts: { official: number; community: number };
  activeCategory?: string;
  activeTier?: string;
  activeQuery?: string;
  activeSource?: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { t } = useLocale();
  const [q, setQ] = useState(activeQuery ?? "");

  // Debounce search → URL
  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(search.toString());
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
      router.replace(`/marketplace?${params.toString()}`, { scroll: false });
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    return `/marketplace${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("filters.search")}
          className="w-full glass-panel rounded-full pl-12 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary border border-white/10"
        />
      </div>

      {/* Source split — official vs community */}
      <div className="flex flex-wrap items-center gap-2 -mb-1">
        <Link
          href={buildHref({ source: undefined })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors flex items-center gap-1.5 " +
            (!activeSource
              ? "bg-on-surface text-surface"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          {t("filters.all")}
          <span className="text-[10px] font-bold opacity-70">
            {sourceCounts.official + sourceCounts.community}
          </span>
        </Link>
        <Link
          href={buildHref({ source: "official" })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors flex items-center gap-1.5 " +
            (activeSource === "official"
              ? "bg-primary text-on-primary"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          {t("filters.official")}
          <span className="text-[10px] font-bold opacity-70">
            {sourceCounts.official}
          </span>
        </Link>
        <Link
          href={buildHref({ source: "community" })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors flex items-center gap-1.5 " +
            (activeSource === "community"
              ? "bg-tertiary text-on-tertiary"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          {t("filters.community")}
          <span className="text-[10px] font-bold opacity-70">
            {sourceCounts.community}
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ category: undefined })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors " +
            (!activeCategory
              ? "bg-primary text-on-primary"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          {t("filters.all_categories")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={buildHref({ category: c.category })}
            className={
              "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors flex items-center gap-1.5 " +
              (activeCategory === c.category
                ? "bg-primary text-on-primary"
                : "glass-panel text-on-surface-variant hover:text-on-surface")
            }
          >
            {c.category}
            <span
              className={
                "text-[10px] font-bold " +
                (activeCategory === c.category
                  ? "text-on-primary/80"
                  : "text-on-surface-variant/60")
              }
            >
              {c.n}
            </span>
          </Link>
        ))}

        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

        <Link
          href={buildHref({ tier: undefined })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors " +
            (!activeTier
              ? "bg-surface-container-high/60 text-on-surface"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          {t("filters.any_plan")}
        </Link>
        <Link
          href={buildHref({ tier: "free" })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors " +
            (activeTier === "free"
              ? "bg-tertiary text-on-tertiary"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          {t("filters.free")}
        </Link>
        <Link
          href={buildHref({ tier: "pro" })}
          className={
            "px-4 py-2 rounded-full text-label-sm font-label-sm transition-colors flex items-center gap-1 " +
            (activeTier === "pro"
              ? "ai-gradient text-on-primary"
              : "glass-panel text-on-surface-variant hover:text-on-surface")
          }
        >
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          {t("filters.pro")}
        </Link>
      </div>
    </div>
  );
}
