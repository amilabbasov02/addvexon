/**
 * Admin actions on a listing.
 *
 *   POST /api/admin/listings/:id
 *     { action: "approve" | "reject" | "takedown", reason?: string }
 *
 *  - approve  : moves pending → approved (listing goes live)
 *  - reject   : moves pending → rejected (listing never went live; reason sent to creator)
 *  - takedown : moves an approved listing back to "rejected" + unpublishes
 *               it; reason sent to creator. We don't delete the row — buyers
 *               who already purchased it keep their copy.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { templates, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";

const BodySchema = z.object({
  action: z.enum(["approve", "reject", "takedown"]),
  reason: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rows = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const t = rows[0];

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      takedown: "rejected",
    } as const;
    const newStatus = statusMap[parsed.data.action];

    await db
      .update(templates)
      .set({
        listingStatus: newStatus,
        // takedown → also unpublish so the marketplace stops surfacing it
        published: parsed.data.action === "takedown" ? false : t.published,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id));

    // Notify the creator (if any)
    if (t.createdBy) {
      const creator = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, t.createdBy))
        .limit(1);
      if (creator[0]?.email) {
        const subjectMap = {
          approve: `Your listing "${t.name}" is live on Addvoxen`,
          reject: `Your listing "${t.name}" was not approved`,
          takedown: `Your listing "${t.name}" has been removed`,
        };
        const bodyMap = {
          approve: `Good news — your template "${t.name}" is now live on the Addvoxen marketplace.\n\nBuyers can now find it under Community templates. You'll see sales appear in your creator dashboard.`,
          reject: `We weren't able to approve "${t.name}" this time.${
            parsed.data.reason ? `\n\nReason:\n${parsed.data.reason}` : ""
          }\n\nYou can adjust and resubmit at any time.`,
          takedown: `Your listing "${t.name}" has been removed from the Addvoxen marketplace.${
            parsed.data.reason ? `\n\nReason:\n${parsed.data.reason}` : ""
          }\n\nAnyone who already purchased it keeps their copy. Please reach out if you have questions.`,
        };
        try {
          await sendEmail({
            to: creator[0].email,
            subject: subjectMap[parsed.data.action],
            text: `Hi ${creator[0].name ?? "there"},\n\n${bodyMap[parsed.data.action]}\n\n— Addvoxen team`,
          });
        } catch (err) {
          console.error("listing notification failed:", err);
        }
      }
    }

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("admin listings action:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
