import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { templates, users } from "@/db/schema";
import { ListingsAdminClient } from "./ListingsAdminClient";

export const dynamic = "force-dynamic";

async function loadListings() {
  return db.execute(sql`
    SELECT
      t.id, t.slug, t.name, t.category, t.tagline,
      t.price_cents AS "priceCents", t.currency,
      t.listing_status AS "listingStatus",
      t.published,
      t.downloads, t.sales_count AS "salesCount", t.revenue_cents AS "revenueCents",
      t.document, t.created_at AS "createdAt",
      t.created_by AS "createdBy",
      u.email AS "creatorEmail",
      u.name  AS "creatorName"
    FROM templates t
    LEFT JOIN users u ON u.id = t.created_by
    WHERE t.created_by IS NOT NULL
    ORDER BY
      CASE t.listing_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
      t.created_at DESC
    LIMIT 200
  `).then((r) => r.rows as Listing[]);
}

export type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  priceCents: number;
  currency: string;
  listingStatus: string;
  published: boolean;
  downloads: number;
  salesCount: number;
  revenueCents: number;
  document: {
    canvasSize: { width: number; height: number };
    background: string;
    layers: unknown[];
  };
  createdAt: string;
  createdBy: string | null;
  creatorEmail: string | null;
  creatorName: string | null;
};

export default async function AdminListingsPage() {
  const listings = await loadListings();
  return <ListingsAdminClient listings={listings} />;
}
