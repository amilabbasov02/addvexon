import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { parseHost } from "@/lib/tenant-host";
import { resolveTenantByHost } from "@/lib/tenant";
import { isLocalizedBundle, type SiteContent } from "@/lib/site-content";
import { SITE_URL, hreflangMap } from "@/lib/seo";

/**
 * HOST-AWARE + 3 DİLLİ sitemap.
 *  - Platforma (addvoxen.com): marketinq + /marketplace/[slug] səhifələri.
 *  - Tenant hostu: həmin müştəri saytının öz səhifələri, öz host-u ilə.
 * Hər URL üçün hreflang alternativləri (az/en/ru + x-default) → ?lang= ilə.
 */

type Entry = {
  url: string;
  lastModified: Date;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  alternates: { languages: Record<string, string> };
};

function entry(origin: string, path: string, priority: number, freq: Entry["changeFrequency"], lastModified = new Date()): Entry {
  return { url: `${origin}${path}`, lastModified, changeFrequency: freq, priority, alternates: { languages: hreflangMap(origin, path) } };
}

export default async function sitemap(): Promise<Entry[]> {
  const host = (await headers()).get("host") ?? "";
  const proto = host.startsWith("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const parsed = parseHost(host);

  // ── TENANT saytı: öz səhifələri, öz host-u ──
  if (parsed.kind === "tenant") {
    const origin = `${proto}://${host}`;
    try {
      const resolved = await resolveTenantByHost(host);
      const raw = resolved?.content?.content;
      let pages: SiteContent["pages"] = [];
      if (isLocalizedBundle(raw)) {
        const loc = (raw.defaultLocale && raw.locales[raw.defaultLocale]) || Object.values(raw.locales)[0];
        pages = loc?.pages ?? [];
      } else if (raw && typeof raw === "object" && "pages" in raw) {
        pages = (raw as SiteContent).pages;
      }
      if (pages.length === 0) return [entry(origin, "/", 1.0, "weekly")];
      return pages.map((p) => entry(origin, p.slug === "" ? "/" : `/${p.slug}`, p.slug === "" ? 1.0 : 0.8, "weekly"));
    } catch {
      return [entry(origin, "/", 1.0, "weekly")];
    }
  }

  // ── PLATFORMA ──
  const now = new Date();
  const staticRoutes: Entry[] = [
    entry(SITE_URL, "/", 1.0, "weekly", now),
    entry(SITE_URL, "/marketplace", 0.9, "daily", now),
    entry(SITE_URL, "/pricing", 0.8, "weekly", now),
    entry(SITE_URL, "/about", 0.6, "monthly", now),
    entry(SITE_URL, "/support", 0.5, "monthly", now),
    entry(SITE_URL, "/terms", 0.3, "yearly", now),
    entry(SITE_URL, "/privacy", 0.3, "yearly", now),
    entry(SITE_URL, "/refund", 0.3, "yearly", now),
  ];

  let tplRoutes: Entry[] = [];
  try {
    const rows = await db
      .select({ slug: siteTemplates.slug, updatedAt: siteTemplates.updatedAt })
      .from(siteTemplates)
      .where(eq(siteTemplates.published, true))
      .orderBy(desc(siteTemplates.updatedAt))
      .limit(500);
    tplRoutes = rows.map((t) => entry(SITE_URL, `/marketplace/${t.slug}`, 0.7, "weekly", t.updatedAt ?? now));
  } catch {
    // DB əlçatan deyilsə yalnız statik route-lar
  }

  return [...staticRoutes, ...tplRoutes];
}
