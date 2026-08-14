/**
 * Outreach drafts for a lead.
 *   GET  /api/leads/:id/outreach  → saved drafts, newest first
 *   POST /api/leads/:id/outreach  → generate variants and save the chosen one
 *
 * Generation and sending are separate endpoints on purpose: a draft should be
 * readable, editable and approvable before anything leaves the building.
 */
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leadAnalyses, leadEvents, leads, outreachMessages } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { uid } from "@/lib/ids";
import { getDemoForLead } from "@/lib/leads/demo-generator";
import { buildOutreachVariants, rewriteWithAi } from "@/lib/leads/outreach";
import { unsubscribeUrl } from "@/lib/leads/mailer";

export const runtime = "nodejs";

const GenerateSchema = z.object({
  locale: z.enum(["az", "en"]).default("az"),
  /** Omit to get all three back without saving anything. */
  variant: z.number().int().min(1).max(3).optional(),
  senderName: z.string().trim().min(1).max(80).default("Addvoxen"),
  useAi: z.boolean().default(false),
});

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

    const drafts = await db
      .select()
      .from(outreachMessages)
      .where(eq(outreachMessages.leadId, id))
      .orderBy(desc(outreachMessages.createdAt))
      .limit(20);

    return NextResponse.json({ drafts });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/:id/outreach] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lead = await loadLead(user.id, id);

    const body = await req.json().catch(() => ({}));
    const parsed = GenerateSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { locale, variant, senderName, useAi } = parsed.data;

    const [analysis, demo] = await Promise.all([
      db.query.leadAnalyses.findFirst({ where: eq(leadAnalyses.leadId, id) }),
      getDemoForLead(id),
    ]);

    let variants = buildOutreachVariants({
      lead,
      demoUrl: demo?.url ?? null,
      locale,
      senderName,
      unsubscribeUrl: unsubscribeUrl(lead.id),
      // No analysis row means we never checked; treat that as "no website" only
      // when the lead genuinely has no URL, rather than guessing.
      noWebsite: !lead.websiteUrl || analysis?.reachable === false,
      websiteIssues: analysis?.issues ?? [],
    });

    if (useAi) {
      variants = await Promise.all(variants.map((v) => rewriteWithAi(v)));
    }

    // No variant chosen: this is a preview request, so save nothing.
    if (!variant) return NextResponse.json({ variants, demoUrl: demo?.url ?? null });

    const chosen = variants.find((v) => v.variant === variant) ?? variants[0]!;
    const messageId = uid("out");

    await db.insert(outreachMessages).values({
      id: messageId,
      workspaceId: lead.workspaceId,
      leadId: lead.id,
      variant: chosen.variant,
      locale,
      subject: chosen.subject,
      body: chosen.body,
      demoUrl: demo?.url ?? null,
      status: "ready",
      generator: useAi ? "ai" : "template",
      createdBy: user.id,
    });

    await db.insert(leadEvents).values({
      id: uid("lev"),
      leadId: lead.id,
      type: "message_drafted",
      actorUserId: user.id,
      detail: { outreachMessageId: messageId, variant: chosen.variant, locale },
    });

    return NextResponse.json(
      { message: { id: messageId, ...chosen }, variants },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads/:id/outreach] POST", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
