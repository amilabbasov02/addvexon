/**
 * Send a drafted outreach email.
 *   POST /api/leads/:id/outreach/send  { outreachMessageId }
 *
 * One lead, one email, one explicit action. There is no bulk endpoint, and
 * that is deliberate — every send passes the suppression and rate-limit gate in
 * `assertSendable`, and a human decides each one.
 */
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leadEvents, leads, outreachMessages } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { uid } from "@/lib/ids";
import { OutreachBlockedError, sendOutreachEmail } from "@/lib/leads/mailer";

export const runtime = "nodejs";

const SendSchema = z.object({
  outreachMessageId: z.string().min(1),
  /** Optional override — falls back to the address discovered on the lead. */
  toAddress: z.string().email().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const workspace = await getUserDefaultWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lead = await db.query.leads.findFirst({
      where: and(eq(leads.id, id), eq(leads.workspaceId, workspace.id)),
    });
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const parsed = SendSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const draft = await db.query.outreachMessages.findFirst({
      where: and(
        eq(outreachMessages.id, parsed.data.outreachMessageId),
        eq(outreachMessages.leadId, lead.id),
      ),
    });
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    if (draft.status === "sent") {
      return NextResponse.json(
        { error: "This message has already been sent" },
        { status: 409 },
      );
    }

    const toAddress = parsed.data.toAddress ?? lead.email;
    if (!toAddress) {
      return NextResponse.json(
        { error: "This lead has no email address" },
        { status: 422 },
      );
    }

    const result = await sendOutreachEmail({
      workspaceId: lead.workspaceId,
      leadId: lead.id,
      outreachMessageId: draft.id,
      toAddress,
      subject: draft.subject,
      body: draft.body,
    });

    await db
      .update(outreachMessages)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(outreachMessages.id, draft.id));

    await db
      .update(leads)
      .set({
        status: "contacted",
        contactedAt: lead.contactedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, lead.id));

    await db.insert(leadEvents).values({
      id: uid("lev"),
      leadId: lead.id,
      type: "email_sent",
      actorUserId: user.id,
      detail: {
        to: toAddress,
        outreachMessageId: draft.id,
        messageId: result.messageId,
      },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Response) return err;

    // Suppression, rate limits and missing configuration are all the caller's
    // situation to resolve, not server faults — say which, plainly.
    if (err instanceof OutreachBlockedError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }

    console.error("[leads/:id/outreach/send] POST", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
