/**
 * Demo site for a lead.
 *   GET  /api/leads/:id/demo  → the existing demo, if one was generated
 *   POST /api/leads/:id/demo  → generate one (idempotent per lead)
 *
 * Generation clones a template's preview content and swaps in the business
 * details, so it finishes in well under a second — no background job needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import {
  DemoGenerationError,
  generateDemoForLead,
  getDemoForLead,
} from "@/lib/leads/demo-generator";

export const runtime = "nodejs";

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
    await loadLead(user.id, id);

    const demo = await getDemoForLead(id);
    return NextResponse.json({ demo });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/:id/demo] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lead = await loadLead(user.id, id);

    const demo = await generateDemoForLead(lead, user.id);
    return NextResponse.json({ demo }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;

    // A missing template or missing preview content is the operator's problem
    // to fix, not a server fault — say so plainly instead of returning a 500.
    if (err instanceof DemoGenerationError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }

    console.error("[leads/:id/demo] POST", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
