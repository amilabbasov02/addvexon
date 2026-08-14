/**
 * Tenant render dispatcher. Məzmundakı `design` açarına görə tamamilə fərqli
 * dizayn komponentini seçir. Tema rəngləri CSS dəyişənləri kimi wrapper-ə
 * tətbiq olunur; hər dizaynın öz strukturu var.
 *
 * Multipage: cari `slug`-a uyğun səhifə render olunur (getPage).
 */
import type { ComponentType } from "react";
import {
  themeToCssVars,
  getPage,
  type DesignKey,
  type Page,
  type Section,
  type SiteContent,
  type SiteTheme,
  type Locale,
} from "@/lib/site-content";
import { CareDesign } from "./designs/Care";
import { BistroDesign } from "./designs/Bistro";
import { CorporateDesign } from "./designs/Corporate";
import { RetailDesign } from "./designs/Retail";
import { BloomDesign } from "./designs/Bloom";
import { StudioDesign } from "./designs/Studio";
import { LumenDesign } from "./designs/Lumen";
import { EmberDesign } from "./designs/Ember";
import { MeridianDesign } from "./designs/Meridian";
import { ForgeDesign } from "./designs/Forge";
import { AtlasDesign } from "./designs/Atlas";
import { LocaleSwitcher } from "./LocaleSwitcher";

type DesignProps = {
  content: SiteContent;
  page: Page;
  theme: SiteTheme;
  lang?: Locale;
};

/**
 * Açar → komponent xəritəsi. Əvvəl uzun ternary zənciri idi; 11 dizaynda o,
 * oxunmaz olur və yeni dizayn əlavə edəndə səhv etmək asanlaşır. Record tipi
 * həm də hər DesignKey-in qarşılığı olmasını compile-time zəmanət edir.
 */
const DESIGNS: Record<DesignKey, ComponentType<DesignProps>> = {
  care: CareDesign,
  bistro: BistroDesign,
  corporate: CorporateDesign,
  retail: RetailDesign,
  bloom: BloomDesign,
  studio: StudioDesign,
  lumen: LumenDesign,
  ember: EmberDesign,
  meridian: MeridianDesign,
  forge: ForgeDesign,
  atlas: AtlasDesign,
};

const DEFAULT_DESIGN: DesignKey = "care";

export function SiteRenderer({
  content,
  theme,
  slug = "",
  locales = [],
  currentLocale = "az",
}: {
  content: SiteContent;
  theme: SiteTheme | null | undefined;
  slug?: string;
  locales?: Locale[];
  currentLocale?: Locale;
}) {
  const cssVars = themeToCssVars(theme) as React.CSSProperties;
  const page = getPage(content, slug);
  const designKey = content.design ?? DEFAULT_DESIGN;
  const t = theme ?? {};

  if (!page) {
    return (
      <div style={cssVars} className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Bu səhifə tapılmadı.
      </div>
    );
  }

  // Naməlum açar (məs. köhnə məzmunda silinmiş dizayn) səhifəni sındırmasın.
  const Design = DESIGNS[designKey] ?? DESIGNS[DEFAULT_DESIGN];
  const faqJsonLd = buildFaqJsonLd(page);

  return (
    <div style={cssVars} className="min-h-screen">
      <LocaleSwitcher available={locales} current={currentLocale} />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // Escape olunmuş JSON — aşağıdaki buildFaqJsonLd `<` simvolunu
          // neytrallaşdırır, ona görə tenant mətnindəki `</script>` script
          // teqindən çıxa bilmir.
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      )}
      {designKey === "bistro" && (
        // Bistro şriftini render qatında yükləyir; yeni dizaynlar öz şriftlərini
        // komponentin içində yükləyir.
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap" />
      )}
      <Design content={content} page={page} theme={t} lang={currentLocale} />
    </div>
  );
}

/**
 * FAQ bölməsindən `FAQPage` struktur datası qurur.
 *
 * Render qatındadır, dizaynların içində deyil — məzmun modeli birdir, deməli
 * sxem də bir dəfə hesablanmalıdır. Əks halda hər dizayn öz nüsxəsini yazır və
 * beşi bir-birindən yayınır (escape üsulu, sahə adları, boş halın idarəsi).
 *
 * Yalnız FAQ üçün qurulur. `hours` bölməsi üçün `OpeningHoursSpecification`
 * qəsdən yazılmır: `days` və `hours` sahələri üç dildə sərbəst mətndir
 * ("Bazar ertəsi – Cümə"), onları `dayOfWeek` kodlarına çevirmək təxminə
 * söykənərdi. Səhv struktur data heç struktur datadan pisdir.
 */
function buildFaqJsonLd(page: Page): string | null {
  const faqSections = page.sections.filter(
    (s): s is Extract<Section, { type: "faq" }> => s.type === "faq",
  );

  const entities = faqSections
    .flatMap((s) => s.items ?? [])
    .filter((item) => item.question?.trim() && item.answer?.trim())
    .map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: item.answer.trim() },
    }));

  if (entities.length === 0) return null;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities,
  }).replace(/</g, "\\u003c");
}
