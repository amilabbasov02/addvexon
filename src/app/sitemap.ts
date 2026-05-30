import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { templates, users, userProfiles } from "@/db/schema";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

/**
 * App Router sitemap. Static marketing routes + dynamic banner detail and
 * public user profile pages. Google re-fetches this every few hours so
 * newly-published banners get indexed without manual resubmission.
 */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE}/`, lastModified: now, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/marketplace`, lastModified: now, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE}/pricing`, lastModified: now, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE}/about`, lastModified: now, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE}/campaigns`, lastModified: now, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/support`, lastModified: now, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/signin`, lastModified: now, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${BASE}/signup`, lastModified: now, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE}/refund`, lastModified: now, priority: 0.3, changeFrequency: "yearly" as const },
  ];

  // Pull DB rows in parallel — slug list + active profiles.
  const [tplRows, profileRows] = await Promise.all([
    db
      .select({ slug: templates.slug, updatedAt: templates.updatedAt })
      .from(templates)
      .where(eq(templates.published, true))
      .orderBy(desc(templates.updatedAt))
      .limit(500),
    db
      .select({ handle: userProfiles.handle, userId: users.id })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .limit(500),
  ]);

  const bannerRoutes = tplRows.map((t) => ({
    url: `${BASE}/banner/${t.slug}`,
    lastModified: t.updatedAt ?? now,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  const profileRoutes = profileRows
    .map((p) => p.handle ?? p.userId)
    .filter((s): s is string => !!s)
    .map((handle) => ({
      url: `${BASE}/u/${handle}`,
      lastModified: now,
      priority: 0.4,
      changeFrequency: "monthly" as const,
    }));

  return [...staticRoutes, ...bannerRoutes, ...profileRoutes];
}
