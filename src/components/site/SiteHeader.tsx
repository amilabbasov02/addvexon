"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "./UserMenu";
import { Logo } from "./Logo";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Şablonlar", href: "/marketplace" },
  { label: "Necə işləyir", href: "/#nece-isleyir" },
  { label: "Qiymətlər", href: "/pricing" },
  { label: "Dəstək", href: "/support" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname || href.includes("#")) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-10">
          <Logo href="/" />
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "text-sm font-medium transition-colors " +
                    (active
                      ? "text-indigo-600"
                      : "text-slate-600 hover:text-slate-900")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Şablona bax
          </Link>
          <UserMenu />
          <button
            type="button"
            aria-label="Menyu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/marketplace"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Şablona bax
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
