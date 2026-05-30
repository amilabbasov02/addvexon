"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentThumbnail } from "./DocumentThumbnail";
import {
  trackBannerEvent,
  useBannerView,
} from "@/components/analytics/useBannerEvent";

type Tmpl = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  tier: string;
  priceCents?: number;
  currency?: string;
  salesCount?: number;
  /** "official" = curated by Addvoxen, "community" = creator-uploaded.
   *  Undefined falls back to "official" so this stays compatible with
   *  callers that don't pass it (e.g. dashboard featured templates). */
  source?: "official" | "community";
  creatorName?: string | null;
  creatorImage?: string | null;
  /** Optional thumbnail URL. If it ends in `.html` the card iframes the
   *  original design through DocumentThumbnail; image URLs render as <img>. */
  thumbnailUrl?: string | null;
  document: {
    canvasSize: { width: number; height: number };
    background: string;
    layers: unknown[];
  };
};

function formatPrice(cents: number, currency = "USD") {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function TemplateCard({
  template,
  signedIn = false,
}: {
  template: Tmpl;
  signedIn?: boolean;
}) {
  const router = useRouter();
  const isPro = template.tier === "pro";
  const paid = (template.priceCents ?? 0) > 0;
  const priceLabel = paid
    ? formatPrice(template.priceCents ?? 0, template.currency ?? "USD")
    : "Free";
  const isCommunity = template.source === "community";
  const sourceLabel = isCommunity ? "Community" : "Official";
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);

  const buy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      router.push("/signup");
      return;
    }
    setBuying(true);
    try {
      const r = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (r.ok) {
        setBought(true);
        // Drop them straight into the editor with the template loaded.
        router.push(`/editor?template=${template.slug}`);
      } else {
        const data = await r.json().catch(() => ({}));
        alert(data.error ?? "Could not complete purchase");
      }
    } finally {
      setBuying(false);
    }
  };

  // Visual differentiation between Addvoxen-curated ("official") and
  // creator-uploaded ("community") templates. Different border tint, badge
  // colour, and an attribution line for community pieces.
  const cardBorderClass = isCommunity
    ? "border-tertiary/20 hover:border-tertiary/60"
    : "border-white/10 hover:border-primary/50";
  const cardShadowClass = isCommunity
    ? "hover:shadow-[0_0_30px_rgba(0,219,231,0.15)]"
    : "hover:shadow-[0_0_30px_rgba(208,188,255,0.15)]";

  // Fire a single "view" event when the card scrolls into the viewport.
  const viewRef = useBannerView<HTMLDivElement>(template.slug);

  return (
    <div
      ref={viewRef}
      className={
        "group relative flex flex-col glass-panel rounded-2xl overflow-hidden border transition-all " +
        cardBorderClass +
        " " +
        cardShadowClass
      }
    >
      {/* Click the preview → banner detail page (likes / comments / creator).
       *  The "Use template" button below remains the direct editor entry. */}
      <Link
        href={`/banner/${template.slug}`}
        onClick={() => trackBannerEvent(template.slug, "click")}
        className="relative aspect-4/3 bg-surface-container-lowest overflow-hidden block"
      >
        <DocumentThumbnail
          background={template.document.background}
          canvasSize={template.document.canvasSize}
          layers={template.document.layers}
          thumbnailUrl={template.thumbnailUrl}
        />
        {/* Top-left: source badge (always present so users immediately know
            who made it) */}
        <span
          className={
            "absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
            (isCommunity
              ? "bg-tertiary text-on-tertiary"
              : "bg-primary text-on-primary")
          }
          title={isCommunity ? "Uploaded by a community creator" : "Curated by the Addvoxen team"}
        >
          <span className="material-symbols-outlined text-[12px]">
            {isCommunity ? "groups" : "verified"}
          </span>
          {sourceLabel}
        </span>
        {/* Top-right: price for paid items, or Pro badge */}
        {paid ? (
          <span className="absolute top-2 right-2 ai-gradient text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {priceLabel}
          </span>
        ) : isPro ? (
          <span className="absolute top-2 right-2 ai-gradient text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Pro
          </span>
        ) : null}
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-on-surface font-label-md text-label-md truncate">
              {template.name}
            </p>
            <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
              {template.category} ·{" "}
              {template.document.canvasSize.width}×
              {template.document.canvasSize.height}
            </p>
            {isCommunity && template.creatorName && (
              <p className="mt-1 text-on-surface-variant text-xs flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[12px] text-tertiary">
                  person
                </span>
                by {template.creatorName}
              </p>
            )}
          </div>
        </div>
        {paid ? (
          <button
            type="button"
            onClick={buy}
            disabled={buying || bought}
            className="w-full ai-gradient text-on-primary px-4 py-2 rounded-full text-label-sm font-label-sm disabled:opacity-60 transition-all"
          >
            {bought
              ? "Owned ✓"
              : buying
                ? "Processing…"
                : `Buy for ${priceLabel}`}
          </button>
        ) : (
          <Link
            href={`/editor?template=${template.slug}`}
            onClick={() => trackBannerEvent(template.slug, "cta")}
            className="w-full text-center bg-surface-container-high/60 hover:bg-primary hover:text-on-primary text-on-surface px-4 py-2 rounded-full text-label-sm font-label-sm transition-all"
          >
            Use template
          </Link>
        )}
      </div>
    </div>
  );
}
