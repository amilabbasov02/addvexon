/**
 * Tenant saytı üçün locale təyini.
 * Prioritet: ziyarətçinin seçimi (cookie) → bölgə (geo) → defaultLocale → mövcud.
 *
 * "Əsasən EN; AZ-dan giribsə AZ; bölgəyə görə dəyişir" — geo header
 * (x-vercel-ip-country) əsasında.
 */
import type { Locale } from "./site-content";

export const SITE_LOCALE_COOKIE = "site_locale";

/** Ölkə kodu → dil. Sadalanmayan ölkələr üçün EN. */
const COUNTRY_LOCALE: Record<string, Locale> = {
  AZ: "az",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  KG: "ru",
  UA: "ru",
  AM: "ru",
  GE: "ru",
  UZ: "ru",
  TM: "ru",
  TJ: "ru",
  MD: "ru",
};

export function localeFromCountry(country?: string | null): Locale {
  if (!country) return "en";
  return COUNTRY_LOCALE[country.toUpperCase()] ?? "en";
}

export function resolveLocale(opts: {
  cookie?: string | null;
  country?: string | null;
  available: Locale[];
  defaultLocale?: Locale | null;
}): Locale {
  const { cookie, country, available, defaultLocale } = opts;
  const ok = (l?: string | null): l is Locale => !!l && available.includes(l as Locale);
  if (ok(cookie)) return cookie;
  const geo = localeFromCountry(country);
  if (ok(geo)) return geo;
  if (ok(defaultLocale)) return defaultLocale;
  return available[0] ?? "en";
}
