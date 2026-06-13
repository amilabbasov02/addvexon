"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import type { PLang } from "@/lib/platform-i18n";

/**
 * Platforma header-ini editor və tenant saytları (/sites) xaric hər route-da
 * göstərir.
 */
export function GlobalHeader({ lang }: { lang: PLang }) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const isTenantSite = pathname?.startsWith("/sites");
  if (isEditor || isTenantSite) return null;
  return <SiteHeader lang={lang} />;
}
