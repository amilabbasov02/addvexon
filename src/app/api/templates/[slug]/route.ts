import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";

/**
 * GET /api/templates/[slug]
 *
 * Lightweight single-template fetch used by the editor when it boots with
 * a ?template=… param. Avoids pulling the entire catalog (40+ rows of
 * document JSON) just to find one slug — that latency was the main cause
 * of the "Loading template…" overlay staying visible too long.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
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
