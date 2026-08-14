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

/**
 * Ölkə kodundan dil.
 *
 * "Məlumat yoxdur" ilə "ölkə məlumdur, amma siyahıda deyil" fərqlidir və bu
 * fərq vacibdir:
 *
 *   - Geo başlığı ümumiyyətlə yoxdursa (lokal iş, Vercel-dən kənar hostinq,
 *     başlığı ötürməyən proxy) `null` qaytarılır ki, seçim tenant-ın
 *     `defaultLocale`-inə düşsün. Əvvəl burada `"en"` qaytarılırdı və nəticədə
 *     tenant-ın seçdiyi dil heç vaxt nəzərə alınmırdı — Bakıdakı salona
 *     göndərilən demo linki ingiliscə açılırdı.
 *   - Ölkə məlumdur, amma siyahıda yoxdursa (Almaniya, ABŞ, Türkiyə) `"en"`
 *     qaytarılır — xarici ziyarətçi üçün ingiliscə ən faydalı seçimdir.
 */
export function localeFromCountry(country?: string | null): Locale | null {
  if (!country) return null;
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
