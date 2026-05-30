/**
 * Ad campaign API — users brief Addvoxen to launch a campaign on Meta /
 * Google Ads / TikTok / LinkedIn / X / Pinterest / Snapchat under our
 * managed Business Manager hosts. The user never has to log in to those
 * platforms themselves; we take the creative, the budget and the audience
 * and operate the campaign on their behalf.
 *
 *   POST /api/campaigns
 *     { documentId, name, platform, objective, dailyBudgetCents,
 *       totalBudgetCents?, landingUrl, audience?, startsAt, endsAt? }
 *   GET  /api/campaigns                  → my campaigns
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { adCampaigns, documents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { uid } from "@/lib/ids";

const PLATFORMS = [
  "meta",
  "google",
  "tiktok",
  "linkedin",
  "twitter",
  "pinterest",
  "snapchat",
] as const;

const OBJECTIVES = [
  "traffic",
  "conversions",
  "awareness",
  "engagement",
] as const;

const BodySchema = z.object({
  documentId: z.string().min(1),
  name: z.string().min(2).max(120),
  platform: z.enum(PLATFORMS),
  objective: z.enum(OBJECTIVES).default("traffic"),
  dailyBudgetCents: z.number().int().min(100), // min $1/day
  totalBudgetCents: z.number().int().min(100).optional(),
  landingUrl: z.string().url(),
  audience: z
    .object({
      countries: z.array(z.string()).optional(),
      ages: z.object({ min: z.number(), max: z.number() }).optional(),
      genders: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
    })
    .optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
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

    // Verify the document belongs to the user
    const docRows = await db
      .select({ id: documents.id, createdBy: documents.createdBy })
      .from(documents)
      .where(eq(documents.id, parsed.data.documentId))
      .limit(1);
    if (docRows.length === 0 || docRows[0].createdBy !== user.id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const id = uid("cmp");
    await db.insert(adCampaigns).values({
      id,
      userId: user.id,
      documentId: parsed.data.documentId,
      name: parsed.data.name,
      platform: parsed.data.platform,
      objective: parsed.data.objective,
      dailyBudgetCents: parsed.data.dailyBudgetCents,
      totalBudgetCents: parsed.data.totalBudgetCents ?? null,
      landingUrl: parsed.data.landingUrl,
      audience: parsed.data.audience ?? null,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      status: "pending",
    });

    return NextResponse.json({ id, status: "pending" }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("campaigns POST:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.userId, user.id))
      .orderBy(desc(adCampaigns.createdAt));
    return NextResponse.json({ campaigns: rows });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
