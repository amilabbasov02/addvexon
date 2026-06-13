/**
 * Tenant render dispatcher. Məzmundakı `design` açarına görə tamamilə fərqli
 * dizayn komponentini seçir (care / bistro / corporate). Tema rəngləri CSS
 * dəyişənləri kimi wrapper-ə tətbiq olunur; hər dizaynın öz strukturu var.
 *
 * Multipage: cari `slug`-a uyğun səhifə render olunur (getPage).
 */
import {
  themeToCssVars,
  getPage,
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
import { LocaleSwitcher } from "./LocaleSwitcher";

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
  const design = content.design ?? "care";
  const t = theme ?? {};

  if (!page) {
    return (
      <div style={cssVars} className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Bu səhifə tapılmadı.
      </div>
    );
  }

  return (
    <div style={cssVars} className="min-h-screen">
      <LocaleSwitcher available={locales} current={currentLocale} />
      {design === "bistro" && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap" />
      )}
      {design === "bistro" ? (
        <BistroDesign content={content} page={page} theme={t} lang={currentLocale} />
      ) : design === "corporate" ? (
        <CorporateDesign content={content} page={page} theme={t} lang={currentLocale} />
      ) : design === "retail" ? (
        <RetailDesign content={content} page={page} theme={t} lang={currentLocale} />
      ) : design === "bloom" ? (
        <BloomDesign content={content} page={page} theme={t} lang={currentLocale} />
      ) : design === "studio" ? (
        <StudioDesign content={content} page={page} theme={t} lang={currentLocale} />
      ) : (
        <CareDesign content={content} page={page} theme={t} lang={currentLocale} />
      )}
    </div>
  );
}
