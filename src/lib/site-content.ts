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
  // İlk nəsil dizaynlar
  | "care"
  | "bistro"
  | "corporate"
  | "retail"
  | "bloom"
  | "studio"
  // İkinci nəsil — premium, sahə üzrə ixtisaslaşmış
  | "lumen" // gözəllik salonu / spa / bərbər — editorial
  | "ember" // restoran / kafe / bar — tünd, isti
  | "meridian" // klinika / diş / səhiyyə — sakit, dəqiq
  | "forge" // fitnes / idman klubu — yüksək kontrast
  | "atlas"; // korporativ / xidmət / B2B — struktur

export type SectionType =
  | "hero"
  | "features"
  | "about"
  | "gallery"
  | "contact"
  | "cta"
  | "menu"
  | "stats"
  | "products"
  // İkinci nəsil bölmələr — landing-i doldurmaq və etibar qurmaq üçün
  | "testimonials"
  | "faq"
  | "team"
  | "pricing"
  | "process"
  | "hours"
  | "logos";

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
  /**
   * Xidmətin fotosu. Gözəllik/yemək kimi vizual sahələrdə xidmət siyahısı
   * yalnız mətn olanda satmır — foto varsa dizayn kart şəbəkəsinə keçir,
   * yoxdursa nömrələnmiş siyahıya qayıdır.
   */
  imageUrl?: string;
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
  /**
   * Opsionaldır: məzmun yazılanda şəkillər hələ olmaya bilər (onlar ayrıca
   * addımda doldurulur). Məcburi olanda müəlliflər `""` yazmağa məcbur qalırdı
   * və nəticədə səhifə `<img src="">` render edirdi — dizaynların "şəkilsiz də
   * düzgün görünsün" qaydasının pozulduğu yeganə yer. Render edən komponentlər
   * şəkli olmayan elementləri süzməlidir.
   */
  imageUrl?: string;
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
  /** Arxa fon fotosu. Yoxdursa dizayn tünd lövhəyə qayıdır. */
  imageUrl?: string;
}

/** Restoran menyusu — qruplar üzrə adlar + qiymətlər. */
export interface MenuItem {
  name: string;
  desc?: string;
  price?: string;
  /**
   * İmza yeməyin fotosu. Bütün sətirlərə lazım deyil — məqsəd menyunu foto
   * şəbəkəsinə çevirmək yox, bir neçə yeməyi göstərməkdir. Şəkli olan sətir
   * daha iri render olunur, olmayan sətir əvvəlki kimi çap sətri qalır.
   */
  imageUrl?: string;
}
export interface MenuSection {
  type: "menu";
  heading?: string;
  /**
   * Bölmənin atmosfer fotosu (zal, mətbəx, masa). Menyu kartı bu fotonun
   * üstünə oturur. Yoxdursa kart əvvəlki kimi tünd fonda dayanır.
   */
  imageUrl?: string;
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
  /**
   * Zolağın arxa fon fotosu (obyekt, sex, komanda). Yoxdursa dizayn tünd
   * lövhəyə qayıdır — `CtaSection.imageUrl` ilə eyni məntiq.
   */
  imageUrl?: string;
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

// ============================================================
//  İkinci nəsil bölmələr
//
//  Səbəb: bir landing yalnız hero + xidmətlər + əlaqədən ibarət olanda qısa və
//  yarımçıq görünür. Aşağıdakı bölmələr həm səhifəni doldurur, həm də satışa
//  birbaşa işləyir — rəy etibar qurur, FAQ etiraza cavab verir, qiymət cədvəli
//  sualı qabaqlayır, iş saatları lokal biznes üçün ən çox axtarılan məlumatdır.
// ============================================================

export interface TestimonialItem {
  quote: string;
  author: string;
  /** "Müştəri", "Nəsimi filialı" — kim olduğu barədə qısa qeyd. */
  role?: string;
  /** 1–5. Yoxdursa ulduz göstərilmir. */
  rating?: number;
  avatarUrl?: string;
}
export interface TestimonialsSection {
  type: "testimonials";
  heading?: string;
  subheading?: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqSection {
  type: "faq";
  heading?: string;
  subheading?: string;
  items: FaqItem[];
}

export interface TeamMember {
  name: string;
  /** "Həkim-stomatoloq", "Baş bərbər" */
  role?: string;
  bio?: string;
  imageUrl?: string;
}
export interface TeamSection {
  type: "team";
  heading?: string;
  subheading?: string;
  items: TeamMember[];
}

export interface PricingItem {
  name: string;
  price: string;
  /** "seansdan", "aylıq" kimi qiymət vahidi. */
  unit?: string;
  desc?: string;
  /** Sadalanan üstünlüklər. */
  features?: string[];
  /** Bir paket vurğulana bilər — dizayn onu fərqli göstərir. */
  featured?: boolean;
}
export interface PricingSection {
  type: "pricing";
  heading?: string;
  subheading?: string;
  items: PricingItem[];
  /** "Qiymətlər ilkin məlumat üçündür" kimi qeyd. */
  note?: string;
}

export interface ProcessStep {
  title: string;
  text?: string;
  /** Nömrələnmə dizayn tərəfindən avtomatik verilir; bu sahə lazım deyil. */
  icon?: string;
}
export interface ProcessSection {
  type: "process";
  heading?: string;
  subheading?: string;
  items: ProcessStep[];
}

export interface HoursRow {
  /** "Bazar ertəsi – Cümə" və ya tək gün. */
  days: string;
  /** "09:00 – 19:00" və ya "Bağlıdır". */
  hours: string;
}
export interface HoursSection {
  type: "hours";
  heading?: string;
  items: HoursRow[];
  note?: string;
}

export interface LogoItem {
  /** Partnyor/brend adı — şəkil yüklənməsə mətn kimi göstərilir. */
  name: string;
  imageUrl?: string;
}
export interface LogosSection {
  type: "logos";
  heading?: string;
  items: LogoItem[];
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
  | ProductsSection
  | TestimonialsSection
  | FaqSection
  | TeamSection
  | PricingSection
  | ProcessSection
  | HoursSection
  | LogosSection;

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
  const primary = c.primary!;
  return {
    "--site-primary": primary,
    /**
     * Brend rəngi üzərində oxunan mətn rəngi.
     *
     * Dizaynların hamısı `--site-primary` fonunda ağ mətn işlədirdi. Tenant
     * açıq rəng (sarı, açıq yaşıl, çəhrayı) seçəndə bu, WCAG AA-dan aşağı
     * düşürdü — hər dizaynda ayrı-ayrı düzəltmək əvəzinə burada bir dəfə
     * hesablanır və bütün dizaynlar `var(--site-on-primary)` işlədir.
     */
    "--site-on-primary": readableTextOn(primary),
    "--site-bg": c.bg!,
    "--site-surface": c.surface!,
    "--site-text": c.text!,
    "--site-muted": c.muted!,
    "--site-font-heading": theme?.fonts?.heading ?? DEFAULT_THEME.fonts!.heading!,
    "--site-font-body": theme?.fonts?.body ?? DEFAULT_THEME.fonts!.body!,
  };
}

/**
 * Verilmiş fon rənginin üzərində ağ, yoxsa tünd mətn oxunaqlıdır?
 *
 * WCAG-ın nisbi parlaqlıq (relative luminance) düsturu ilə hesablanır. 0.45
 * həddi ağ və tünd variantların hər ikisinin AA-nı keçdiyi nöqtəyə yaxındır.
 * Rəng oxunmasa (məs. `oklch()` və ya CSS dəyişəni), ağ qaytarılır — bu, indiyə
 * qədərki davranışdır, yəni heç nə pisləşmir.
 */
export function readableTextOn(background: string): string {
  const rgb = parseColor(background);
  if (!rgb) return "#ffffff";

  const toLinear = (channel: number): number => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);

  return luminance > 0.45 ? "#111111" : "#ffffff";
}

/** `#rgb`, `#rrggbb` və `rgb()` formalarını oxuyur. Başqa formatda null. */
function parseColor(input: string): { r: number; g: number; b: number } | null {
  const value = input.trim().toLowerCase();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex?.[1]) {
    const h = hex[1];
    if (h.length === 3) {
      return {
        r: parseInt(h[0]! + h[0]!, 16),
        g: parseInt(h[1]! + h[1]!, 16),
        b: parseInt(h[2]! + h[2]!, 16),
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgbMatch = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  return null;
}
