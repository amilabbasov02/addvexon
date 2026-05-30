/**
 * Country / language matrix. Single source of truth for the locale picker
 * in the header and any place that needs to format prices.
 *
 * Each entry: country code, English label, native label, flag, default
 * language for that country, currency, locale tag for Intl.NumberFormat.
 */
export type Locale = {
  country: string; // ISO-3166-1 alpha-2
  flag: string;
  label: string;
  native: string;
  language: LanguageCode;
  currency: string;
  locale: string;
};

export type LanguageCode = "en" | "az" | "tr" | "ru" | "es";

export const LOCALES: Locale[] = [
  { country: "US", flag: "🇺🇸", label: "United States", native: "English (US)", language: "en", currency: "USD", locale: "en-US" },
  { country: "GB", flag: "🇬🇧", label: "United Kingdom", native: "English (UK)", language: "en", currency: "GBP", locale: "en-GB" },
  { country: "AZ", flag: "🇦🇿", label: "Azerbaijan", native: "Azərbaycan", language: "az", currency: "AZN", locale: "az-AZ" },
  { country: "TR", flag: "🇹🇷", label: "Türkiye", native: "Türkçe", language: "tr", currency: "TRY", locale: "tr-TR" },
  { country: "RU", flag: "🇷🇺", label: "Russia", native: "Русский", language: "ru", currency: "RUB", locale: "ru-RU" },
  { country: "ES", flag: "🇪🇸", label: "España", native: "Español", language: "es", currency: "EUR", locale: "es-ES" },
  { country: "DE", flag: "🇩🇪", label: "Germany", native: "Deutsch", language: "en", currency: "EUR", locale: "de-DE" },
  { country: "FR", flag: "🇫🇷", label: "France", native: "Français", language: "en", currency: "EUR", locale: "fr-FR" },
  { country: "BR", flag: "🇧🇷", label: "Brazil", native: "Português", language: "es", currency: "BRL", locale: "pt-BR" },
  { country: "MX", flag: "🇲🇽", label: "Mexico", native: "Español (MX)", language: "es", currency: "MXN", locale: "es-MX" },
  { country: "IN", flag: "🇮🇳", label: "India", native: "English / हिंदी", language: "en", currency: "INR", locale: "en-IN" },
  { country: "AE", flag: "🇦🇪", label: "UAE", native: "English / العربية", language: "en", currency: "AED", locale: "en-AE" },
];

export const DEFAULT_LOCALE = LOCALES[0];

export function findLocale(country?: string | null): Locale {
  if (!country) return DEFAULT_LOCALE;
  return LOCALES.find((l) => l.country === country.toUpperCase()) ?? DEFAULT_LOCALE;
}

// ===========================================================================
//  Minimal i18n map — UI labels for nav, footer-level CTAs, and a handful of
//  common buttons. Strings that aren't in the map fall back to English.
// ===========================================================================
type Dict = Record<string, string>;
type Translations = Record<LanguageCode, Dict>;

export const T: Translations = {
  en: {
    "nav.designs": "My designs",
    "nav.templates": "Templates",
    "nav.campaigns": "Campaigns",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.analytics": "Analytics",
    "nav.support": "Support",
    "nav.signin": "Sign in",
    "nav.signup": "Get Started",
    "common.new_design": "New design",
    "common.browse_templates": "Browse templates",
    "common.use_template": "Use template",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.export": "Export",
    "common.coming_soon": "Coming soon",
  },
  az: {
    "nav.designs": "Dizaynlarım",
    "nav.templates": "Şablonlar",
    "nav.campaigns": "Kampaniyalar",
    "nav.pricing": "Qiymətlər",
    "nav.about": "Haqqımızda",
    "nav.analytics": "Analitika",
    "nav.support": "Dəstək",
    "nav.signin": "Daxil ol",
    "nav.signup": "Başla",
    "common.new_design": "Yeni dizayn",
    "common.browse_templates": "Şablonlara bax",
    "common.use_template": "Şablonu istifadə et",
    "common.edit": "Redaktə et",
    "common.delete": "Sil",
    "common.save": "Saxla",
    "common.export": "Export",
    "common.coming_soon": "Tezliklə",
  },
  tr: {
    "nav.designs": "Tasarımlarım",
    "nav.templates": "Şablonlar",
    "nav.campaigns": "Kampanyalar",
    "nav.pricing": "Fiyatlar",
    "nav.about": "Hakkında",
    "nav.analytics": "Analitik",
    "nav.support": "Destek",
    "nav.signin": "Giriş yap",
    "nav.signup": "Başla",
    "common.new_design": "Yeni tasarım",
    "common.browse_templates": "Şablonlara göz at",
    "common.use_template": "Şablonu kullan",
    "common.edit": "Düzenle",
    "common.delete": "Sil",
    "common.save": "Kaydet",
    "common.export": "Dışa aktar",
    "common.coming_soon": "Yakında",
  },
  ru: {
    "nav.designs": "Мои дизайны",
    "nav.templates": "Шаблоны",
    "nav.campaigns": "Кампании",
    "nav.pricing": "Цены",
    "nav.about": "О нас",
    "nav.analytics": "Аналитика",
    "nav.support": "Поддержка",
    "nav.signin": "Войти",
    "nav.signup": "Начать",
    "common.new_design": "Новый дизайн",
    "common.browse_templates": "Шаблоны",
    "common.use_template": "Использовать шаблон",
    "common.edit": "Изменить",
    "common.delete": "Удалить",
    "common.save": "Сохранить",
    "common.export": "Экспорт",
    "common.coming_soon": "Скоро",
  },
  es: {
    "nav.designs": "Mis diseños",
    "nav.templates": "Plantillas",
    "nav.campaigns": "Campañas",
    "nav.pricing": "Precios",
    "nav.about": "Acerca de",
    "nav.analytics": "Analíticas",
    "nav.support": "Soporte",
    "nav.signin": "Iniciar sesión",
    "nav.signup": "Empezar",
    "common.new_design": "Nuevo diseño",
    "common.browse_templates": "Ver plantillas",
    "common.use_template": "Usar plantilla",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.save": "Guardar",
    "common.export": "Exportar",
    "common.coming_soon": "Próximamente",
  },
};

export function tr(lang: LanguageCode, key: string): string {
  return T[lang]?.[key] ?? T.en[key] ?? key;
}
