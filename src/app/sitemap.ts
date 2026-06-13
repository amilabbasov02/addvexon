import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

/**
 * App Router sitemap — statik marketinq route-ları + hazır sayt şablonlarının
 * detal səhifələri (/marketplace/[slug]). Yeni məhsula uyğun (banner route-ları
 * silindi). Tenant saytları öz hostlarındadır — bu sitemap addvoxen.com üçündür.
 */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE}/`, lastModified: now, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/marketplace`, lastModified: now, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE}/pricing`, lastModified: now, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE}/about`, lastModified: now, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE}/support`, lastModified: now, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/signin`, lastModified: now, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${BASE}/signup`, lastModified: now, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE}/refund`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
  ];

  let tplRoutes: { url: string; lastModified: Date; priority: number; changeFrequency: "weekly" }[] = [];
  try {
    const rows = await db
      .select({ slug: siteTemplates.slug, updatedAt: siteTemplates.updatedAt })
      .from(siteTemplates)
      .where(eq(siteTemplates.published, true))
      .orderBy(desc(siteTemplates.updatedAt))
      .limit(500);
    tplRoutes = rows.map((t) => ({
      url: `${BASE}/marketplace/${t.slug}`,
      lastModified: t.updatedAt ?? now,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch {
    // DB əlçatan deyilsə yalnız statik route-lar
  }

  return [...staticRoutes, ...tplRoutes];
}
