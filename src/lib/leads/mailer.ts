/**
 * Outreach email delivery over the project's own SMTP server.
 *
 * Separate from `lib/email.ts` on purpose. That module sends transactional mail
 * (magic links, receipts) through Resend and should stay exactly as it is —
 * mixing cold outreach into the same sending identity is how a domain's
 * transactional deliverability gets destroyed by an unrelated spam complaint.
 *
 * Everything here is env-driven; no credential is ever imported, logged or
 * returned to a client. `assertSendable` is the gate every send passes through,
 * and it fails closed.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, gte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { emailMessages, leads, suppressionList } from "@/db/schema";
import { uid } from "@/lib/ids";

/** Outreach emails one workspace may send per hour. */
const SENDS_PER_HOUR = 40;

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

export class OutreachBlockedError extends Error {}

/** Read SMTP settings from the environment, or explain what is missing. */
export function readSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  const missing = [
    !host && "SMTP_HOST",
    !user && "SMTP_USER",
    !password && "SMTP_PASSWORD",
    !from && "SMTP_FROM",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new OutreachBlockedError(
      `Outreach email is not configured — missing ${missing.join(", ")}`,
    );
  }

  return {
    host: host!,
    port: Number.parseInt(process.env.SMTP_PORT ?? "465", 10),
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    user: user!,
    password: password!,
    from: from!,
  };
}

async function createTransport() {
  const config = readSmtpConfig();
  // Imported lazily so a deployment without outreach configured never has to
  // load nodemailer, and so this module stays importable from the edge.
  const nodemailer = await import("nodemailer");

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  });
}

/** Verify the SMTP credentials without sending anything. */
export async function verifySmtpConnection(): Promise<{ ok: true }> {
  const transport = await createTransport();
  await transport.verify();
  return { ok: true };
}

// ── Opt-out ─────────────────────────────────────────────────────────────────

function unsubscribeSecret(): string {
  const secret =
    process.env.OUTREACH_UNSUBSCRIBE_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new OutreachBlockedError(
      "Cannot build opt-out links — set OUTREACH_UNSUBSCRIBE_SECRET",
    );
  }
  return secret;
}

/**
 * Stateless opt-out token: an HMAC over the lead id.
 *
 * No database column and no expiry — an unsubscribe link must keep working
 * long after the campaign, and a recipient should never see a dead opt-out.
 */
export function unsubscribeToken(leadId: string): string {
  const mac = createHmac("sha256", unsubscribeSecret())
    .update(leadId)
    .digest("base64url")
    .slice(0, 32);
  return `${leadId}.${mac}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const leadId = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = unsubscribeToken(leadId).slice(leadId.length + 1);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? leadId : null;
}

export function unsubscribeUrl(leadId: string): string {
  const base =
    process.env.BETTER_AUTH_URL ??
    `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "addvoxen.com"}`;
  return `${base.replace(/\/$/, "")}/unsubscribe/${unsubscribeToken(leadId)}`;
}

/** Record an opt-out. Idempotent — a second click is not an error. */
export async function suppressLead(
  leadId: string,
  reason = "unsubscribed",
): Promise<void> {
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
  if (!lead?.email) return;

  await db
    .insert(suppressionList)
    .values({
      id: uid("sup"),
      workspaceId: lead.workspaceId,
      value: lead.email.toLowerCase(),
      kind: "email",
      reason,
    })
    .onConflictDoNothing();

  await db
    .update(leads)
    .set({ status: "not_interested", updatedAt: new Date() })
    .where(eq(leads.id, leadId));
}

// ── Sending ─────────────────────────────────────────────────────────────────

/**
 * Every reason a send may not proceed, checked before the transport is opened.
 * Fails closed: anything unexpected is a block, not a send.
 */
export async function assertSendable(input: {
  workspaceId: string;
  toAddress: string;
}): Promise<void> {
  const address = input.toAddress.trim().toLowerCase();
  if (!address || !address.includes("@")) {
    throw new OutreachBlockedError("This lead has no usable email address");
  }

  const domain = address.split("@")[1] ?? "";
  const suppressed = await db
    .select({ id: suppressionList.id })
    .from(suppressionList)
    .where(
      and(
        eq(suppressionList.workspaceId, input.workspaceId),
        or(
          eq(suppressionList.value, address),
          eq(suppressionList.value, domain),
        ),
      ),
    )
    .limit(1);

  if (suppressed.length > 0) {
    throw new OutreachBlockedError(
      "This address has opted out and cannot be contacted",
    );
  }

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailMessages)
    .where(
      and(
        eq(emailMessages.workspaceId, input.workspaceId),
        eq(emailMessages.direction, "outbound"),
        eq(emailMessages.status, "sent"),
        gte(emailMessages.createdAt, since),
      ),
    );

  if (count >= SENDS_PER_HOUR) {
    throw new OutreachBlockedError(
      `Sending limit reached — ${SENDS_PER_HOUR} outreach emails per hour. Try again later.`,
    );
  }
}

export type SendOutreachInput = {
  workspaceId: string;
  leadId: string;
  outreachMessageId: string;
  toAddress: string;
  subject: string;
  body: string;
};

export type SendResult = {
  emailMessageId: string;
  messageId: string | null;
};

/**
 * Send one outreach email and log it, whatever the outcome.
 *
 * The row is written before the transport is touched, so a crash mid-send
 * leaves evidence rather than silence. `List-Unsubscribe` is set because it is
 * what well-behaved mail clients and providers look for, and because an opt-out
 * that only exists in the body is one the recipient has to hunt for.
 */
export async function sendOutreachEmail(
  input: SendOutreachInput,
): Promise<SendResult> {
  await assertSendable({
    workspaceId: input.workspaceId,
    toAddress: input.toAddress,
  });

  const config = readSmtpConfig();
  const optOut = unsubscribeUrl(input.leadId);
  const rowId = uid("eml");

  await db.insert(emailMessages).values({
    id: rowId,
    workspaceId: input.workspaceId,
    leadId: input.leadId,
    outreachMessageId: input.outreachMessageId,
    direction: "outbound",
    fromAddress: config.from,
    toAddress: input.toAddress,
    subject: input.subject,
    bodyText: input.body,
    status: "queued",
    attempts: 1,
  });

  try {
    const transport = await createTransport();
    const info = await transport.sendMail({
      from: config.from,
      to: input.toAddress,
      subject: input.subject,
      text: input.body,
      headers: {
        "List-Unsubscribe": `<${optOut}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    await db
      .update(emailMessages)
      .set({
        status: "sent",
        messageId: info.messageId ?? null,
        sentAt: new Date(),
      })
      .where(eq(emailMessages.id, rowId));

    return { emailMessageId: rowId, messageId: info.messageId ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown SMTP error";
    await db
      .update(emailMessages)
      .set({ status: "failed", error: message.slice(0, 1000) })
      .where(eq(emailMessages.id, rowId));

    throw new Error(`Could not send the email: ${message}`);
  }
}
