/**
 * Lead searches collection API.
 *   GET  /api/leads/searches   → my searches, newest first
 *   POST /api/leads/searches   → start a new search (runs as a background job)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { leadSearches } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { uid } from "@/lib/ids";
import { enqueueJob } from "@/lib/jobs/runner";
import { JOB_TYPES } from "@/lib/jobs/handlers";
import { LEAD_CATEGORIES } from "@/lib/leads/providers/types";

export const runtime = "nodejs";

/** Searches one user may start per hour. Discovery hits a shared free API. */
const SEARCHES_PER_HOUR = 10;

const CreateSearchSchema = z.object({
  country: z.string().trim().length(2).toUpperCase(),
  city: z.string().trim().min(2).max(80),
  category: z.enum(LEAD_CATEGORIES),
  maxLeads: z.number().int().min(1).max(300).default(100),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const workspace = await getUserDefaultWorkspace(user.id);
    if (!workspace) return NextResponse.json({ searches: [] });

    const url = new URL(req.url);
    const limit = Math.min(
      Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20,
      100,
    );

    const rows = await db
      .select()
      .from(leadSearches)
      .where(eq(leadSearches.workspaceId, workspace.id))
      .orderBy(desc(leadSearches.createdAt))
      .limit(limit);

    return NextResponse.json({ searches: rows });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/searches] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const workspace = await getUserDefaultWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found for this account" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
      );
    }

    // Rate limit from the searches table itself — no extra infrastructure, and
    // it survives restarts and multiple serverless instances.
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leadSearches)
      .where(
        and(
          eq(leadSearches.userId, user.id),
          gte(leadSearches.createdAt, since),
        ),
      );

    if (count >= SEARCHES_PER_HOUR) {
      return NextResponse.json(
        {
          error: `Rate limit reached — ${SEARCHES_PER_HOUR} searches per hour. Try again later.`,
        },
        { status: 429 },
      );
    }

    const searchId = uid("lsr");
    const { country, city, category, maxLeads, filters } = parsed.data;

    await db.insert(leadSearches).values({
      id: searchId,
      userId: user.id,
      workspaceId: workspace.id,
      country,
      city,
      category,
      maxLeads,
      filters: filters ?? null,
      status: "queued",
    });

    const jobId = await enqueueJob({
      userId: user.id,
      workspaceId: workspace.id,
      type: JOB_TYPES.LEAD_SEARCH,
      payload: { searchId },
    });

    await db
      .update(leadSearches)
      .set({ jobId })
      .where(eq(leadSearches.id, searchId));

    return NextResponse.json({ searchId, jobId }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/searches] POST", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
