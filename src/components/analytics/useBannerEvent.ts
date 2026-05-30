"use client";

import { useEffect, useRef } from "react";

/** Fire-and-forget POST to the banner event API. Never blocks the UI. */
export function trackBannerEvent(slug: string, kind: "view" | "click" | "export" | "cta") {
  if (typeof window === "undefined") return;
  fetch(`/api/templates/${encodeURIComponent(slug)}/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
    keepalive: true,
  }).catch(() => {});
}

/** Mark a banner as "viewed" once it scrolls into the viewport (≥30% visible).
 *  Each card mounts a single observer, fires once, then disconnects so the
 *  view count doesn't inflate as the user scrolls in/out. */
export function useBannerView<T extends HTMLElement>(slug: string) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.3 && !fired.current) {
            fired.current = true;
            trackBannerEvent(slug, "view");
            obs.disconnect();
          }
        }
      },
      { threshold: [0.3] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [slug]);
  return ref;
}
