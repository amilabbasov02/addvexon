/**
 * Custom sitemap route — XSL stylesheet ilə (brauzerdə cədvəl kimi görünür).
 * Next-in avtomatik sitemap-ı `<?xml-stylesheet?>` əlavə etməyə imkan vermir,
 * ona görə XML-i özümüz qururuq. HOST-AWARE + 3 dilli (hreflang).
 */
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { parseHost } from "@/lib/tenant-host";
import { resolveTenantByHost } from "@/lib/tenant";
import { isLocalizedBundle, type SiteContent } from "@/lib/site-content";
import { SITE_URL, hreflangMap } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Entry = { path: string; origin: string; lastmod: string; freq: string; priority: number };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlBlock(e: Entry): string {
  const langs = hreflangMap(e.origin, e.path);
  const loc = `${e.origin}${e.path}`;
  const links = Object.entries(langs)
    .map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${esc(href)}" />`)
    .join("\n");
  return `  <url>
    <loc>${esc(loc)}</loc>
${links}
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`;
}

async function buildEntries(): Promise<Entry[]> {
  const host = (await headers()).get("host") ?? "";
  const proto = host.startsWith("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const parsed = parseHost(host);
  const now = new Date().toISOString();

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
      if (pages.length === 0) return [{ path: "/", origin, lastmod: now, freq: "weekly", priority: 1.0 }];
      return pages.map((p) => ({ path: p.slug === "" ? "/" : `/${p.slug}`, origin, lastmod: now, freq: "weekly", priority: p.slug === "" ? 1.0 : 0.8 }));
    } catch {
      return [{ path: "/", origin, lastmod: now, freq: "weekly", priority: 1.0 }];
    }
  }

  const o = SITE_URL;
  const statics: Entry[] = [
    { path: "/", origin: o, lastmod: now, freq: "weekly", priority: 1.0 },
    { path: "/marketplace", origin: o, lastmod: now, freq: "daily", priority: 0.9 },
    { path: "/pricing", origin: o, lastmod: now, freq: "weekly", priority: 0.8 },
    { path: "/about", origin: o, lastmod: now, freq: "monthly", priority: 0.6 },
    { path: "/support", origin: o, lastmod: now, freq: "monthly", priority: 0.5 },
    { path: "/terms", origin: o, lastmod: now, freq: "yearly", priority: 0.3 },
    { path: "/privacy", origin: o, lastmod: now, freq: "yearly", priority: 0.3 },
    { path: "/refund", origin: o, lastmod: now, freq: "yearly", priority: 0.3 },
  ];
  try {
    const rows = await db
      .select({ slug: siteTemplates.slug, updatedAt: siteTemplates.updatedAt })
      .from(siteTemplates)
      .where(eq(siteTemplates.published, true))
      .orderBy(desc(siteTemplates.updatedAt))
      .limit(500);
    for (const r of rows) {
      statics.push({ path: `/marketplace/${r.slug}`, origin: o, lastmod: (r.updatedAt ?? new Date()).toISOString(), freq: "weekly", priority: 0.7 });
    }
  } catch {
    // DB əlçatan deyilsə yalnız statik
  }
  return statics;
}

export async function GET() {
  const entries = await buildEntries();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(urlBlock).join("\n")}
</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
