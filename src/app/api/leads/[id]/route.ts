/**
 * Single lead.
 *   GET   /api/leads/:id  → lead, website analysis and activity history
 *   PATCH /api/leads/:id  → change status (contacted / archived / excluded / …)
 */
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leadAnalyses, leadEvents, leads } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { uid } from "@/lib/ids";

export const runtime = "nodejs";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "replied",
  "interested",
  "not_interested",
  "converted",
  "archived",
  "excluded",
] as const;

const PatchSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  note: z.string().max(1000).optional(),
});

/** Load a lead, or throw the right HTTP response. Workspace-scoped always. */
async function loadLead(userId: string, leadId: string) {
  const workspace = await getUserDefaultWorkspace(userId);
  if (!workspace) throw new Response("Not found", { status: 404 });

  const lead = await db.query.leads.findFirst({
    where: and(eq(leads.id, leadId), eq(leads.workspaceId, workspace.id)),
  });
  if (!lead) throw new Response("Not found", { status: 404 });

  return lead;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lead = await loadLead(user.id, id);

    const [analysis, events] = await Promise.all([
      db.query.leadAnalyses.findFirst({ where: eq(leadAnalyses.leadId, id) }),
      db
        .select()
        .from(leadEvents)
        .where(eq(leadEvents.leadId, id))
        .orderBy(desc(leadEvents.createdAt))
        .limit(50),
    ]);

    return NextResponse.json({ lead, analysis: analysis ?? null, events });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/:id] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lead = await loadLead(user.id, id);

    const body = await req.json().catch(() => null);
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { status, note } = parsed.data;

    await db
      .update(leads)
      .set({
        status,
        // Stamp the first time it is marked contacted; later edits don't move it.
        ...(status === "contacted" && !lead.contactedAt
          ? { contactedAt: new Date() }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id));

    await db.insert(leadEvents).values({
      id: uid("lev"),
      leadId: id,
      type: "status_changed",
      actorUserId: user.id,
      detail: { from: lead.status, to: status, ...(note ? { note } : {}) },
    });

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/:id] PATCH", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
