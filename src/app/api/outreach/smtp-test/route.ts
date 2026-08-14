/**
 * SMTP diagnostics.
 *   GET  /api/outreach/smtp-test  → verify the connection and credentials
 *   POST /api/outreach/smtp-test  { to } → send a test email to yourself
 *
 * Authenticated, and the POST will only send to the signed-in user's own
 * address unless an admin overrides it — a "test" endpoint that will mail an
 * arbitrary stranger is an open relay with extra steps.
 *
 * Never returns host, user or password. Configuration problems come back as
 * the names of the missing variables, nothing more.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import {
  OutreachBlockedError,
  readSmtpConfig,
  verifySmtpConnection,
} from "@/lib/leads/mailer";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();
    await verifySmtpConnection();

    const config = readSmtpConfig();
    return NextResponse.json({
      ok: true,
      // Enough to confirm which server answered, without leaking credentials.
      host: config.host,
      port: config.port,
      secure: config.secure,
      from: config.from,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof OutreachBlockedError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "SMTP connection failed",
      },
      { status: 502 },
    );
  }
}

const TestSchema = z.object({ to: z.string().email().optional() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = TestSchema.safeParse(await req.json().catch(() => ({})));
    const requested = parsed.success ? parsed.data.to : undefined;

    // Only an admin may aim the test somewhere other than their own inbox.
    const to =
      requested && isAdminEmail(user.email) ? requested : user.email;

    const config = readSmtpConfig();
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
    });

    const info = await transport.sendMail({
      from: config.from,
      to,
      subject: "Addvoxen — SMTP test",
      text:
        "This is a test message from Addvoxen Lead Finder.\n\n" +
        "If you are reading it, outbound outreach email is configured correctly.",
    });

    return NextResponse.json({ ok: true, to, messageId: info.messageId });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof OutreachBlockedError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not send the test email",
      },
      { status: 502 },
    );
  }
}
