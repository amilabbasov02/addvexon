"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  findLocale,
  type LanguageCode,
  type Locale,
  tr,
  LOCALES,
} from "@/lib/locales";

type Ctx = {
  locale: Locale;
  lang: LanguageCode;
  setLocaleByCountry: (country: string) => void;
  setLanguage: (lang: LanguageCode) => void;
  /** Translate a key using the current language. */
  t: (key: string) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);

const COUNTRY_KEY = "addvoxen.country";
const LANG_KEY = "addvoxen.language";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default render uses US/English so SSR + first paint are stable. Real
  // value rehydrates from localStorage on mount.
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [lang, setLang] = useState<LanguageCode>(DEFAULT_LOCALE.language);

  useEffect(() => {
    try {
      const country = localStorage.getItem(COUNTRY_KEY);
      const langOverride = localStorage.getItem(LANG_KEY) as LanguageCode | null;
      const next = findLocale(country);
      setLocale(next);
      setLang(langOverride ?? next.language);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocaleByCountry = useCallback((country: string) => {
    const next = findLocale(country);
    setLocale(next);
    setLang(next.language);
    try {
      localStorage.setItem(COUNTRY_KEY, next.country);
      localStorage.setItem(LANG_KEY, next.language);
    } catch {
      /* ignore */
    }
    // Update html lang attribute for accessibility / search
    document.documentElement.setAttribute("lang", next.language);
  }, []);

  const setLanguage = useCallback((l: LanguageCode) => {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("lang", l);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      lang,
      setLocaleByCountry,
      setLanguage,
      t: (key) => tr(lang, key),
    }),
    [locale, lang, setLocaleByCountry, setLanguage],
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) {
    // Fallback when consumed outside the provider — keeps server components
    // that accidentally pass through happy.
    return {
      locale: DEFAULT_LOCALE,
      lang: DEFAULT_LOCALE.language,
      setLocaleByCountry: () => {},
      setLanguage: () => {},
      t: (k) => tr(DEFAULT_LOCALE.language, k),
    };
  }
  return ctx;
}

export { LOCALES };
