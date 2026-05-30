import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { getSession } from "@/lib/session";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";

export const dynamic = "force-dynamic";

type Search = {
  category?: string;
  tier?: string;
  q?: string;
  /** "official" = curated by Addvoxen (created_by IS NULL)
   *  "community" = creator-listed (created_by IS NOT NULL, listingStatus=approved)
   *  "all" / unset = both */
  source?: string;
};

async function loadTemplates(search: Search) {
  const isOfficial = search.source === "official";
  const isCommunity = search.source === "community";
  const rows = await db.execute(
    sql`
      SELECT t.id, t.slug, t.name, t.category, t.tagline, t.tier, t.document, t.downloads,
             t.price_cents AS "priceCents", t.currency, t.sales_count AS "salesCount",
             t.thumbnail_url AS "thumbnailUrl",
             t.created_by AS "createdBy",
             u.name AS "creatorName",
             u.image AS "creatorImage",
             CASE WHEN t.created_by IS NULL THEN 'official' ELSE 'community' END AS source
      FROM templates t
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.published = TRUE
        AND (t.listing_status = 'approved' OR t.created_by IS NULL)
        ${isOfficial ? sql`AND t.created_by IS NULL` : sql``}
        ${isCommunity ? sql`AND t.created_by IS NOT NULL` : sql``}
        ${search.category ? sql`AND t.category = ${search.category}` : sql``}
        ${search.tier === "free" || search.tier === "pro" ? sql`AND t.tier = ${search.tier}` : sql``}
        ${search.q ? sql`AND t.name ILIKE ${"%" + search.q + "%"}` : sql``}
      ORDER BY
        ${isCommunity ? sql`` : sql`(CASE WHEN t.created_by IS NULL THEN 0 ELSE 1 END),`}
        t.sales_count DESC, t.downloads DESC, t.updated_at DESC
      LIMIT 60
    `,
  );
  return rows.rows as Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    tagline: string | null;
    tier: string;
    document: { canvasSize: { width: number; height: number }; background: string; layers: unknown[] };
    downloads: number;
    priceCents: number;
    currency: string;
    salesCount: number;
    thumbnailUrl: string | null;
    createdBy: string | null;
    creatorName: string | null;
    creatorImage: string | null;
    source: "official" | "community";
  }>;
}

async function loadSourceCounts() {
  const rows = await db.execute(
    sql`
      SELECT
        SUM(CASE WHEN created_by IS NULL THEN 1 ELSE 0 END)::int AS "official",
        SUM(CASE WHEN created_by IS NOT NULL AND listing_status = 'approved' THEN 1 ELSE 0 END)::int AS "community"
      FROM templates
      WHERE published = TRUE
    `,
  );
  const r = rows.rows[0] as { official: number; community: number };
  return { official: r?.official ?? 0, community: r?.community ?? 0 };
}

async function loadCategories() {
  const rows = await db
    .select({ category: templates.category, n: sql<number>`count(*)::int` })
    .from(templates)
    .where(eq(templates.published, true))
    .groupBy(templates.category)
    .orderBy(desc(sql`count(*)`));
  return rows;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const [items, categories, sourceCounts] = await Promise.all([
    loadTemplates(params),
    loadCategories(),
    loadSourceCounts(),
  ]);

  const totalCount = categories.reduce((s, c) => s + c.n, 0);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
              Template marketplace
            </p>
            <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
              {totalCount} templates, ready to remix
            </h1>
            <p className="text-on-surface-variant text-body-md font-body-md mt-2">
              Curated banners across every ad size and category. Pick one,
              hit the editor, ship in minutes.
            </p>
          </div>
          {session?.user && (
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Blank canvas
            </Link>
          )}
        </div>

        <MarketplaceFilters
          categories={categories}
          sourceCounts={sourceCounts}
          activeCategory={params.category}
          activeTier={params.tier}
          activeQuery={params.q}
          activeSource={params.source}
        />

        {items.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <p className="text-on-surface-variant text-body-md font-body-md">
              No templates match your filters yet.
            </p>
            <Link
              href="/marketplace"
              className="text-primary text-label-md font-label-md hover:underline mt-3 inline-block"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((t) => (
              <TemplateCard key={t.id} template={t} signedIn={!!session?.user} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
