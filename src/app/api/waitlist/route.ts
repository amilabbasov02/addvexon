/**
 * Join the Addvoxen waitlist. Replaces public Stripe checkout while our own
 * billing/banking integration is being set up. Admins receive these emails
 * and upgrade users manually via `scripts/admin-upgrade-user.ts`.
 *
 *   POST /api/waitlist
 *   { email, name?, plan?, company?, teamSize?, notes?, referrer? }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { uid } from "@/lib/ids";
import { sendEmail } from "@/lib/email";

const BodySchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  plan: z.enum(["pro", "team", "enterprise"]).default("pro"),
  company: z.string().max(120).optional(),
  teamSize: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
  referrer: z.string().max(200).optional(),
  locale: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await db
      .insert(waitlist)
      .values({
        id: uid("wl"),
        ...parsed.data,
      })
      .onConflictDoNothing();

    // Internal notification (logs to console in dev unless RESEND_API_KEY is set)
    try {
      await sendEmail({
        to: process.env.WAITLIST_NOTIFICATION_EMAIL ?? "support@kayzen.az",
        subject: `[Addvoxen waitlist] ${parsed.data.email} → ${parsed.data.plan}`,
        text: [
          `New waitlist signup`,
          ``,
          `Email:   ${parsed.data.email}`,
          `Name:    ${parsed.data.name ?? "—"}`,
          `Plan:    ${parsed.data.plan}`,
          `Company: ${parsed.data.company ?? "—"}`,
          `Size:    ${parsed.data.teamSize ?? "—"}`,
          `Referrer:${parsed.data.referrer ?? "—"}`,
          ``,
          `Notes:`,
          parsed.data.notes ?? "—",
          ``,
          `To upgrade manually:`,
          `  npx tsx scripts/admin-upgrade-user.ts ${parsed.data.email} ${parsed.data.plan}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Failed to send notification email:", err);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("waitlist error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
