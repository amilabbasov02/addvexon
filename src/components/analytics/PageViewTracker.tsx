"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/site/LocaleContext";

const VISITOR_KEY = "addvoxen.visitor";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * One pageview ping per route change. Runs on every public route via the
 * root layout; admin / editor / dashboard are excluded so internal use
 * doesn't pollute the visitor count.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    if (!pathname) return;
    // Skip authenticated admin / editor / dashboard surfaces.
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/editor") ||
      pathname.startsWith("/api/")
    ) {
      return;
    }
    const visitorId = getVisitorId();
    const referrer = document.referrer || null;
    const body = JSON.stringify({
      path: pathname,
      visitorId,
      referrer,
      country: locale.country,
    });
    // Use sendBeacon when possible — survives unload / navigation.
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/pageview", blob);
      return;
    }
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, locale.country]);

  return null;
}
