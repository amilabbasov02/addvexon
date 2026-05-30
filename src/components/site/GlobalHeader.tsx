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
  if (isEditor) return null;
  return <SiteHeader />;
}
