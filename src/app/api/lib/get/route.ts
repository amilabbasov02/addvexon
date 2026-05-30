import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";

/**
 * POST /api/lib/get   { slug: string }
 *
 * Ad-blocker-safe replacement for GET /api/templates/[slug]. Many slugs
 * contain words like "banner" or IAB ad dimensions ("728x90", "300x250")
 * which uBlock / AdBlock filter lists treat as ad-tracker patterns and
 * blanket-block. Moving the slug into the request body keeps the path
 * itself neutral so the filter rules don't match.
 *
 * Returns the same shape as the old endpoint: `{ template }` on hit, 404
 * on miss, 400 if the body is missing the slug.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const rows = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      category: templates.category,
      tagline: templates.tagline,
      tier: templates.tier,
      document: templates.document,
      thumbnailUrl: templates.thumbnailUrl,
    })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ template: rows[0] });
}
