/**
 * Single lead search.
 *   GET /api/leads/searches/:id  → search record plus live job progress
 *
 * The UI polls this while a search runs, which is why job progress is folded
 * into the same response — one request per tick rather than two.
 */
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { backgroundJobs, leadSearches } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const workspace = await getUserDefaultWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Scope by workspace as well as id — an id alone must never be enough.
    const search = await db.query.leadSearches.findFirst({
      where: and(
        eq(leadSearches.id, id),
        eq(leadSearches.workspaceId, workspace.id),
      ),
    });

    if (!search) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let job = null;
    if (search.jobId) {
      const row = await db.query.backgroundJobs.findFirst({
        where: eq(backgroundJobs.id, search.jobId),
        columns: {
          id: true,
          status: true,
          progress: true,
          step: true,
          error: true,
          attempts: true,
        },
      });
      job = row ?? null;
    }

    return NextResponse.json({ search, job });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/searches/:id] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
