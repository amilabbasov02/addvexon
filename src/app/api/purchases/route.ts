/**
 * Buy a paid template. For now the purchase is recorded as "completed"
 * without going through a real payment provider — billing arrives when
 * our company bank account + payment integration are live. Until then,
 * the buyer simply gets immediate access and we owe the creator their
 * cut, which we settle manually.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { templates, purchases } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { uid } from "@/lib/ids";

const BodySchema = z.object({
  templateId: z.string().min(1),
});

const PLATFORM_COMMISSION_PCT = 30;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const tplRows = await db
      .select()
      .from(templates)
      .where(eq(templates.id, parsed.data.templateId))
      .limit(1);
    if (tplRows.length === 0)
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    const tpl = tplRows[0];

    if (tpl.listingStatus !== "approved" && tpl.priceCents > 0) {
      return NextResponse.json(
        { error: "This template is not available for purchase yet." },
        { status: 400 },
      );
    }

    if (tpl.createdBy === user.id) {
      return NextResponse.json(
        { error: "You can't buy your own template." },
        { status: 400 },
      );
    }

    // Already owned? Idempotent — return the existing purchase.
    const owned = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(
        sql`${purchases.buyerId} = ${user.id} AND ${purchases.templateId} = ${tpl.id}`,
      )
      .limit(1);
    if (owned.length > 0) {
      return NextResponse.json(
        { id: owned[0].id, status: "already_owned" },
        { status: 200 },
      );
    }

    const platformFee = Math.round(
      (tpl.priceCents * PLATFORM_COMMISSION_PCT) / 100,
    );
    const creatorPayout = tpl.priceCents - platformFee;
    const id = uid("buy");

    await db.insert(purchases).values({
      id,
      buyerId: user.id,
      templateId: tpl.id,
      creatorId: tpl.createdBy ?? null,
      paidCents: tpl.priceCents,
      currency: tpl.currency,
      platformFeeCents: platformFee,
      creatorPayoutCents: creatorPayout,
      status: "completed",
    });

    // Bump creator's lifetime stats
    await db
      .update(templates)
      .set({
        salesCount: sql`${templates.salesCount} + 1`,
        revenueCents: sql`${templates.revenueCents} + ${tpl.priceCents}`,
        downloads: sql`${templates.downloads} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, tpl.id));

    return NextResponse.json({ id, status: "completed" }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("purchases POST:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

/** GET /api/purchases → my purchases */
export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({
        id: purchases.id,
        templateId: purchases.templateId,
        paidCents: purchases.paidCents,
        currency: purchases.currency,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .where(eq(purchases.buyerId, user.id));
    return NextResponse.json({ purchases: rows });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
