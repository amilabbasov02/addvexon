"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BRAND } from "@/lib/brand";

/**
 * Platforma footer-i (işıqlı). /editor, /admin və tenant saytlarında (/sites)
 * gizlənir — onların öz konteksti var.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/editor")) return null;
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/sites")) return null;

  const year = new Date().getFullYear();

  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Məhsul",
      links: [
        { label: "Şablonlar", href: "/marketplace" },
        { label: "Qiymətlər", href: "/pricing" },
        { label: "Necə işləyir", href: "/#nece-isleyir" },
      ],
    },
    {
      title: "Şirkət",
      links: [
        { label: "Haqqımızda", href: "/about" },
        { label: "Dəstək", href: "/support" },
      ],
    },
    {
      title: "Hüquqi",
      links: [
        { label: "Məxfilik", href: "/privacy" },
        { label: "İstifadə şərtləri", href: "/terms" },
        { label: "Geri qaytarma", href: "/refund" },
      ],
    },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo href="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              {BRAND.tagline}
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-400 sm:flex-row">
          <span>© {year} {BRAND.name}. Bütün hüquqlar qorunur.</span>
          <a href={`mailto:${BRAND.email}`} className="hover:text-slate-700">
            {BRAND.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
