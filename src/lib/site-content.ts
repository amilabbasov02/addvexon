/**
 * Tenant saytının məzmun modeli (v2).
 *
 * Yeniliklər:
 *  - `design`  : hər saytın TAMAMİLƏ fərqli vizual variantı (care/bistro/corporate)
 *  - `pages[]` : çoxsəhifəlilik — hər səhifənin öz slug-ı və bölmələri var
 *  - yeni bölmə tipləri: `menu` (restoran), `stats` (korporativ)
 *
 * Renderer `design`-a görə uyğun dizayn komponentini seçir; eyni məzmun
 * modeli fərqli dizaynlarda fərqli görünür.
 */

export type DesignKey =
  | "care"
  | "bistro"
  | "corporate"
  | "retail"
  | "bloom"
  | "studio";

export type SectionType =
  | "hero"
  | "features"
  | "about"
  | "gallery"
  | "contact"
  | "cta"
  | "menu"
  | "stats"
  | "products";

export interface HeroSection {
  type: "hero";
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export interface FeatureItem {
  title: string;
  text?: string;
  icon?: string;
}
export interface FeaturesSection {
  type: "features";
  heading?: string;
  subheading?: string;
  items: FeatureItem[];
}

export interface AboutSection {
  type: "about";
  heading?: string;
  body?: string;
  imageUrl?: string;
}

export interface GalleryItem {
  imageUrl: string;
  caption?: string;
}
export interface GallerySection {
  type: "gallery";
  heading?: string;
  items: GalleryItem[];
}

export interface ContactSection {
  type: "contact";
  heading?: string;
  phone?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
}

export interface CtaSection {
  type: "cta";
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
}

/** Restoran menyusu — qruplar üzrə adlar + qiymətlər. */
export interface MenuItem {
  name: string;
  desc?: string;
  price?: string;
}
export interface MenuSection {
  type: "menu";
  heading?: string;
  groups: { name: string; items: MenuItem[] }[];
}

/** Korporativ statistika zolağı. */
export interface StatItem {
  value: string;
  label: string;
}
export interface StatsSection {
  type: "stats";
  items: StatItem[];
}

/** Məhsul kataloqu (mağaza/e-ticarət). */
export interface ProductItem {
  name: string;
  price?: string;
  imageUrl?: string;
  tag?: string;
}
export interface ProductsSection {
  type: "products";
  heading?: string;
  subheading?: string;
  items: ProductItem[];
}

export type Section =
  | HeroSection
  | FeaturesSection
  | AboutSection
  | GallerySection
  | ContactSection
  | CtaSection
  | MenuSection
  | StatsSection
  | ProductsSection;

/** Bir səhifə — multipage saytlarda bir neçə olur. */
export interface Page {
  /** "" = ana səhifə. Digərləri: "menyu", "xidmetler", "elaqe" ... */
  slug: string;
  title: string;
  sections: Section[];
}

export interface SiteContent {
  /** Vizual dizayn variantı. */
  design?: DesignKey;
  siteName?: string;
  /** Naviqasiya — adətən səhifələrə uyğun gəlir. */
  nav?: { label: string; href: string }[];
  pages: Page[];
  footer?: {
    text?: string;
    socials?: { label: string; href: string }[];
  };
}

export interface SiteTheme {
  colors?: {
    primary?: string;
    bg?: string;
    surface?: string;
    text?: string;
    muted?: string;
  };
  fonts?: { heading?: string; body?: string };
  logoUrl?: string;
  faviconUrl?: string;
}

export const DEFAULT_THEME: SiteTheme = {
  colors: {
    primary: "#6366f1",
    bg: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    muted: "#64748b",
  },
  fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
};

/** Slug-a görə səhifəni tapır; tapılmasa ana səhifə (və ya ilk). */
export function getPage(content: SiteContent, slug: string): Page | null {
  const pages = content.pages ?? [];
  if (pages.length === 0) return null;
  const clean = (slug || "").replace(/^\/+|\/+$/g, "");
  return pages.find((p) => p.slug === clean) ?? pages.find((p) => p.slug === "") ?? pages[0];
}

// ============================================================
//  Çoxdillilik (i18n) — AZ / RU / EN
// ============================================================

export type Locale = "az" | "en" | "ru";
export const LOCALES: Locale[] = ["az", "en", "ru"];
export const LOCALE_LABELS: Record<Locale, string> = { az: "AZ", en: "EN", ru: "RU" };

/** Tenant məzmunu dil başına saxlanır. */
export interface LocalizedBundle {
  defaultLocale?: Locale;
  locales: Partial<Record<Locale, SiteContent>>;
}

export function isLocalizedBundle(raw: unknown): raw is LocalizedBundle {
  return (
    !!raw &&
    typeof raw === "object" &&
    "locales" in raw &&
    typeof (raw as LocalizedBundle).locales === "object"
  );
}

/**
 * Verilmiş locale üçün məzmunu seçir. Köhnə (tək dilli) məzmunu da dəstəkləyir.
 * Qayıdır: seçilmiş SiteContent, mövcud dillər və faktiki seçilmiş locale.
 */
export function pickLocaleContent(
  raw: unknown,
  locale: Locale,
): { content: SiteContent | null; available: Locale[]; locale: Locale } {
  if (isLocalizedBundle(raw)) {
    const available = LOCALES.filter((l) => raw.locales[l]) as Locale[];
    const chosen =
      (raw.locales[locale] && locale) ||
      (raw.defaultLocale && raw.locales[raw.defaultLocale] && raw.defaultLocale) ||
      available[0];
    return {
      content: chosen ? raw.locales[chosen] ?? null : null,
      available,
      locale: (chosen as Locale) ?? locale,
    };
  }
  // Köhnə tək dilli məzmun
  const single = raw && typeof raw === "object" && "pages" in raw ? (raw as SiteContent) : null;
  return { content: single, available: [], locale };
}

/** Tema rənglərini CSS dəyişənlərinə çevirir. */
export function themeToCssVars(theme: SiteTheme | null | undefined): Record<string, string> {
  const c = { ...DEFAULT_THEME.colors, ...(theme?.colors ?? {}) };
  return {
    "--site-primary": c.primary!,
    "--site-bg": c.bg!,
    "--site-surface": c.surface!,
    "--site-text": c.text!,
    "--site-muted": c.muted!,
    "--site-font-heading": theme?.fonts?.heading ?? DEFAULT_THEME.fonts!.heading!,
    "--site-font-body": theme?.fonts?.body ?? DEFAULT_THEME.fonts!.body!,
  };
}
