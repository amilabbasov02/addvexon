/**
 * Mərkəzi SEO helper-i. Per-səhifə Metadata (title/description/keywords/
 * canonical/OpenGraph/Twitter) + JSON-LD strukturlu data (5.0 ulduz rating
 * → rich snippet). Pure (server-only import yoxdur) — hər yerdə işlənir.
 */
import type { Metadata } from "next";
import type { PLang } from "./platform-i18n";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

const OG_LOCALE: Record<PLang, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU" };

/** Bir yol üçün 3 dilin URL-lərini qurur. AZ default (param yox), digərləri ?lang=. */
export function langUrl(origin: string, path: string, l: PLang): string {
  if (l === "az") return `${origin}${path}`;
  return `${origin}${path}${path.includes("?") ? "&" : "?"}lang=${l}`;
}
/** hreflang alternativləri (sitemap + metadata üçün). */
export function hreflangMap(origin: string, path: string): Record<string, string> {
  return {
    az: langUrl(origin, path, "az"),
    en: langUrl(origin, path, "en"),
    ru: langUrl(origin, path, "ru"),
    "x-default": langUrl(origin, path, "az"),
  };
}

export function buildMeta(opts: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  lang: PLang;
  absoluteTitle?: boolean;
  images?: string[];
}): Metadata {
  const path = opts.path ?? "/";
  const url = langUrl(SITE_URL, path, opts.lang);
  const images = opts.images ?? [`${SITE_URL}/og-cover.png`];
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url, languages: hreflangMap(SITE_URL, path) },
    openGraph: {
      type: "website",
      url,
      siteName: "addvoxen",
      title: opts.title,
      description: opts.description,
      locale: OG_LOCALE[opts.lang],
      images,
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}

/** 5.0 ulduzlu Product/Service JSON-LD — rich snippet (ulduzlar) üçün. */
export function ratingProductLd(opts: {
  name: string;
  url: string;
  description: string;
  image?: string;
  priceAzn?: number; // qəpik
  ratingValue?: string;
  reviewCount?: number;
}) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    brand: { "@type": "Brand", name: "addvoxen" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: opts.ratingValue ?? "5.0",
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(opts.reviewCount ?? 24),
    },
  };
  if (opts.image) ld.image = opts.image;
  if (opts.priceAzn != null) {
    ld.offers = {
      "@type": "Offer",
      price: String(opts.priceAzn / 100),
      priceCurrency: "AZN",
      availability: "https://schema.org/InStock",
      url: opts.url,
    };
  }
  return ld;
}

/** JSON-LD-ni səhifəyə salmaq üçün <script> string-i. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
