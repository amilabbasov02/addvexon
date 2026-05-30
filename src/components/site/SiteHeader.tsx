"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale } from "./LocaleContext";

type NavItem = { tKey: string; href: string };

const NAV: NavItem[] = [
  { tKey: "nav.designs", href: "/dashboard" },
  { tKey: "nav.templates", href: "/marketplace" },
  { tKey: "nav.campaigns", href: "/campaigns" },
  { tKey: "nav.pricing", href: "/pricing" },
  { tKey: "nav.about", href: "/about" },
  { tKey: "nav.support", href: "/support" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="flex justify-between items-center px-4 sm:px-8 lg:px-16 py-3 w-full mx-auto">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary hover:opacity-80 transition-opacity"
            onClick={() => setOpen(false)}
          >
            {t("header.brand")}
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "font-label-md text-label-md transition-colors " +
                    (active
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-on-surface-variant hover:text-on-surface")
                  }
                >
                  {t(item.tKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu />
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-on-surface hover:bg-white/5 transition-colors"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-surface-container/80 backdrop-blur-xl">
          <div className="flex flex-col px-margin-mobile py-4 gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    "font-label-md text-label-md px-4 py-3 rounded-lg transition-colors " +
                    (active
                      ? "bg-primary-container/20 text-primary-fixed-dim"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5")
                  }
                >
                  {t(item.tKey)}
                </Link>
              );
            })}
            <Link
              href="/editor?new=1"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-5 py-3 rounded-full transition-all"
            >
              {t("nav.signup")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
