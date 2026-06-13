"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

/**
 * Mounts the marketing/app site header on every route EXCEPT the editor —
 * editor routes render their own contextual EditorHeader inside the page so
 * Save / Export buttons can be wired to the canvas state.
 */
export function GlobalHeader() {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  // Tenant public saytları (host-based rewrite → /_sites) platforma
  // header-ini göstərmir — onların öz dizaynı var.
  const isTenantSite = pathname?.startsWith("/sites");
  if (isEditor || isTenantSite) return null;
  return <SiteHeader />;
}
