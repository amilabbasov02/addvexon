/**
 * Mark a waitlist entry as contacted (admin-only).
 *   POST /api/admin/waitlist/:id  { action: "contacted" | "converted" }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  action: z.enum(["contacted", "converted"]),
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
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    const patch =
      parsed.data.action === "contacted"
        ? { contactedAt: new Date() }
        : { convertedAt: new Date(), contactedAt: new Date() };
    await db.update(waitlist).set(patch).where(eq(waitlist.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
