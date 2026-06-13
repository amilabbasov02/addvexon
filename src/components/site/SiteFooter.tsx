"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BRAND } from "@/lib/brand";
import { PT, type PLang } from "@/lib/platform-i18n";

/**
 * Platforma footer-i (işıqlı). /editor, /admin və tenant saytlarında (/sites)
 * gizlənir — onların öz konteksti var.
 */
export function SiteFooter({ lang }: { lang: PLang }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/editor")) return null;
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/sites")) return null;

  const year = new Date().getFullYear();
  const f = PT[lang].footer;

  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: f.product,
      links: [
        { label: f.templates, href: "/marketplace" },
        { label: f.pricing, href: "/pricing" },
        { label: f.how, href: "/#nece-isleyir" },
      ],
    },
    {
      title: f.company,
      links: [
        { label: f.about, href: "/about" },
        { label: f.support, href: "/support" },
      ],
    },
    {
      title: f.legal,
      links: [
        { label: f.privacy, href: "/privacy" },
        { label: f.terms, href: "/terms" },
        { label: f.refund, href: "/refund" },
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
          <span>© {year} {BRAND.name}. {f.rights}</span>
          <a href={`mailto:${BRAND.email}`} className="hover:text-slate-700">
            {BRAND.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
