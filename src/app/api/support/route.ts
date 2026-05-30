import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportRequests } from "@/db/schema";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

const SUPPORT_INBOX = process.env.SUPPORT_EMAIL ?? "support@addvoxen.com";

function uid() {
  return `sr_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    subject?: string;
    body?: string;
    country?: string;
  };
  const name = (body.name ?? "").trim().slice(0, 100);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 200);
  const subject = (body.subject ?? "").trim().slice(0, 200);
  const text = (body.body ?? "").trim().slice(0, 5000);
  const country = (body.country ?? "").trim().slice(0, 4) || null;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  if (!subject)
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const session = await getSession();
  const id = uid();
  try {
    await db.insert(supportRequests).values({
      id,
      userId: session?.user?.id ?? null,
      name,
      email,
      subject,
      body: text,
      country,
    });
  } catch (err) {
    console.error("support insert failed", err);
    return NextResponse.json({ error: "Could not save request" }, { status: 500 });
  }

  // Fire-and-forget email to the support inbox. If Resend isn't configured
  // the email helper logs to stdout — the row is already persisted so we
  // never lose the message.
  try {
    await sendEmail({
      to: SUPPORT_INBOX,
      subject: `[Addvoxen support] ${subject}`,
      text: [
        `New support request #${id}`,
        ``,
        `From: ${name} <${email}>`,
        `User: ${session?.user?.id ?? "anonymous"}`,
        `Country: ${country ?? "—"}`,
        ``,
        text,
      ].join("\n"),
    });
  } catch (err) {
    console.error("support email failed", err);
  }

  return NextResponse.json({ ok: true, id });
}
