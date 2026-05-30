"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, useLocale } from "./LocaleContext";

/** Compact flag dropdown in the header. Country selection picks both the
 *  default language for that country and the currency used in price tags. */
export function LocaleSwitcher() {
  const { locale, setLocaleByCountry } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${locale.label} · ${locale.currency} · ${locale.language.toUpperCase()}`}
        className={
          "flex items-center gap-1.5 h-9 px-2.5 rounded-full transition-all border " +
          (open
            ? "border-primary/50 bg-primary-container/15 text-on-surface"
            : "border-white/10 text-on-surface-variant hover:text-on-surface hover:border-white/25 hover:bg-white/5")
        }
      >
        <span className="text-[18px] leading-none">{locale.flag}</span>
        <span className="text-label-sm font-label-sm font-bold tracking-wider">
          {locale.currency}
        </span>
        <span
          className={
            "material-symbols-outlined text-[16px] transition-transform " +
            (open ? "rotate-180" : "")
          }
        >
          expand_more
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 bg-surface-container-high border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                language
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-on-surface text-label-md font-label-md">
                Country, currency &amp; language
              </p>
              <p className="text-on-surface-variant text-label-sm font-label-sm">
                Pick where you bill from — UI translates instantly.
              </p>
            </div>
          </div>

          {/* Current selection summary */}
          <div className="mx-3 my-3 rounded-xl border border-primary/30 bg-primary-container/10 p-3 flex items-center gap-3">
            <span className="text-[28px] leading-none">{locale.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-on-surface font-label-md text-label-md truncate">
                {locale.label}
              </p>
              <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
                {locale.native}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Currency
              </p>
              <p className="text-on-surface font-label-md text-label-md">
                {locale.currency}
              </p>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto pb-2">
            {LOCALES.map((l) => {
              const active = l.country === locale.country;
              return (
                <button
                  key={l.country}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLocaleByCountry(l.country);
                    setOpen(false);
                  }}
                  className={
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors " +
                    (active ? "bg-primary-container/15" : "")
                  }
                >
                  <span className="w-7 h-7 rounded-md flex items-center justify-center text-[18px] leading-none bg-surface-container/80 border border-white/10">
                    {l.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={
                        "text-label-md font-label-md truncate " +
                        (active ? "text-on-surface" : "text-on-surface")
                      }
                    >
                      {l.label}
                    </p>
                    <p className="text-on-surface-variant text-label-sm font-label-sm truncate">
                      {l.native}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {l.language}
                    </p>
                    <p className="text-on-surface text-label-sm font-label-sm">
                      {l.currency}
                    </p>
                  </div>
                  {active && (
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
