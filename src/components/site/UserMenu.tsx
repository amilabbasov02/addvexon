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

export function UserMenu() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [livePlan, setLivePlan] = useState<string | null>(null);
  const [liveHandle, setLiveHandle] = useState<string | null>(null);

  // Fetch the real plan + handle from DB once the session is known —
  // better-auth's session payload doesn't carry our custom columns.
  useEffect(() => {
    if (!data?.user) return;
    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (j: { user?: { plan?: string; handle?: string | null } } | null) => {
          if (cancelled) return;
          if (j?.user?.plan) setLivePlan(j.user.plan);
          if (j?.user?.handle) setLiveHandle(j.user.handle);
        },
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [data?.user]);

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

  // Show Sign in / Get Started immediately (without waiting for the session
  // probe). If the user is actually signed in, the avatar replaces these
  // links as soon as the session resolves — but new visitors get instant
  // affordance instead of a blank placeholder.
  if (isPending || !data?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/signin"
          className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-full transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const user = data.user;
  // Session payload may not include our custom `plan` field, so fall back
  // to the value the /api/me endpoint returned (which queries the DB).
  const plan = livePlan ?? (user as { plan?: string }).plan ?? "free";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/5 transition-colors"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="w-8 h-8 rounded-full border border-white/15 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center">
            {avatarInitials(user.name, user.email)}
          </div>
        )}
        <span className="hidden md:inline text-label-md font-label-md text-on-surface max-w-35 truncate">
          {user.name || user.email}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 bg-surface-container-high border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-label-md font-label-md text-on-surface truncate">
              {user.name || user.email}
            </p>
            <p className="text-label-sm font-label-sm text-on-surface-variant truncate">
              {user.email}
            </p>
            <span
              className={
                "inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                (plan === "free"
                  ? "bg-surface-container-high/60 text-on-surface-variant"
                  : "bg-primary text-on-primary")
              }
            >
              {plan === "free" ? "Free plan" : `${plan} plan`}
            </span>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                dashboard
              </span>
              My designs
            </Link>
            <Link
              href="/editor?new=1"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                draw
              </span>
              New design
            </Link>
            <Link
              href="/marketplace"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                grid_view
              </span>
              Browse templates
            </Link>
            <Link
              href={`/u/${liveHandle ?? user.id}`}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                account_circle
              </span>
              My profile
            </Link>
            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                settings
              </span>
              Edit profile
            </Link>
            <Link
              href="/analytics"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                analytics
              </span>
              Analytics
            </Link>
          </div>
          <div className="border-t border-white/10 py-1">
            {plan === "free" && (
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-tertiary-fixed-dim hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  bolt
                </span>
                Upgrade to Pro
              </Link>
            )}
            <Link
              href="#settings"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                settings
              </span>
              Settings
            </Link>
          </div>
          <div className="border-t border-white/10 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                await authClient.signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
