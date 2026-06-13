"use client";

/**
 * Tenant saytı üçün dil keçidi (AZ/RU/EN). Seçimi cookie-yə yazır və səhifəni
 * yeniləyir — server cookie-ni oxuyub uyğun dildə render edir.
 */
import { LOCALE_LABELS, type Locale } from "@/lib/site-content";
import { SITE_LOCALE_COOKIE } from "@/lib/site-locale";

export function LocaleSwitcher({
  available,
  current,
}: {
  available: Locale[];
  current: Locale;
}) {
  if (!available || available.length < 2) return null;

  function choose(l: Locale) {
    document.cookie = `${SITE_LOCALE_COOKIE}=${l}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <div className="fixed right-4 top-4 z-[60] flex items-center gap-0.5 rounded-full border border-black/10 bg-white/90 p-1 shadow-md backdrop-blur">
      {available.map((l) => (
        <button
          key={l}
          onClick={() => choose(l)}
          aria-current={l === current}
          className={
            "rounded-full px-2.5 py-1 text-xs font-bold transition-colors " +
            (l === current ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900")
          }
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
