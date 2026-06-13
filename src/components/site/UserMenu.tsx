"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";

function avatarInitials(name?: string | null, email?: string | null) {
  const src = name || email || "";
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const MENU = [
  { href: "/panel", icon: "language", label: "Saytlarım" },
  { href: "/marketplace", icon: "grid_view", label: "Şablonlar" },
  { href: "/settings/profile", icon: "settings", label: "Profil" },
];

export function UserMenu() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }
  }, [open]);

  if (isPending || !data?.user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/signin"
          className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Giriş
        </Link>
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? "İstifadəçi"} className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {avatarInitials(user.name, user.email)}
          </div>
        )}
        <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{user.name || user.email}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <div className="py-1">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                {m.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                await authClient.signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Çıxış
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
