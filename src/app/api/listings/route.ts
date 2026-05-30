/**
 * Marketplace listing API — creators publish their designs for sale.
 *
 *   POST /api/listings
 *     { documentId, name, category, tagline, priceCents, currency? }
 *   → Promotes the user's document to a listing on the marketplace.
 *     Lands in "pending" status; an admin approves it via
 *     `npx tsx scripts/admin-listings.ts approve <slug>`.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, templates } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { uid, slugify } from "@/lib/ids";

const BodySchema = z.object({
  documentId: z.string().min(1),
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60).default("Editorial"),
  tagline: z.string().max(200).optional(),
  priceCents: z.number().int().min(0).max(100_000),
  currency: z.string().length(3).default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parsed.data.documentId))
      .limit(1);
    if (doc.length === 0 || doc[0].createdBy !== user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const d = doc[0];

    const baseSlug = slugify(parsed.data.name);
    const slug = `${baseSlug}-${uid("").replace(/^_/, "").slice(0, 6)}`;

    const tier = parsed.data.priceCents > 0 ? "pro" : "free";
    const id = uid("tpl");

    await db.insert(templates).values({
      id,
      slug,
      name: parsed.data.name,
      category: parsed.data.category,
      tagline: parsed.data.tagline ?? null,
      document: {
        canvasSize: d.canvasSize as { width: number; height: number },
        background: d.background,
        layers: d.layers as unknown[],
      },
      tier,
      createdBy: user.id,
      published: true,
      listingStatus: "pending",
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
    });

    return NextResponse.json({ id, slug, status: "pending" }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("listings POST:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** GET /api/listings → my listings (creator dashboard) */
export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({
        id: templates.id,
        slug: templates.slug,
        name: templates.name,
        category: templates.category,
        tagline: templates.tagline,
        priceCents: templates.priceCents,
        currency: templates.currency,
        listingStatus: templates.listingStatus,
        salesCount: templates.salesCount,
        revenueCents: templates.revenueCents,
        downloads: templates.downloads,
        createdAt: templates.createdAt,
      })
      .from(templates)
      .where(eq(templates.createdBy, user.id));
    return NextResponse.json({ listings: rows });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
