/**
 * Browse templates from the database.
 *   GET /api/templates?category=Editorial&tier=free&q=neo&limit=24&cursor=...
 */
import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, desc, lt, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const tier = url.searchParams.get("tier");
  const q = url.searchParams.get("q");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "24"), 100);
  const cursor = url.searchParams.get("cursor"); // updated_at ISO

  const conds: SQL[] = [eq(templates.published, true)];
  if (category) conds.push(eq(templates.category, category));
  if (tier && (tier === "free" || tier === "pro")) {
    conds.push(eq(templates.tier, tier));
  }
  if (q) conds.push(ilike(templates.name, `%${q}%`));
  if (cursor) conds.push(lt(templates.updatedAt, new Date(cursor)));

  const rows = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      category: templates.category,
      tagline: templates.tagline,
      tier: templates.tier,
      document: templates.document,
      downloads: templates.downloads,
      thumbnailUrl: templates.thumbnailUrl,
      updatedAt: templates.updatedAt,
    })
    .from(templates)
    .where(and(...conds))
    .orderBy(desc(templates.downloads), desc(templates.updatedAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const nextCursor = hasMore
    ? items[items.length - 1].updatedAt.toISOString()
    : null;

  const categoriesRows = await db
    .select({ category: templates.category, c: sql<number>`count(*)::int` })
    .from(templates)
    .where(eq(templates.published, true))
    .groupBy(templates.category);

  return NextResponse.json({
    templates: items,
    categories: categoriesRows,
    nextCursor,
  });
}
