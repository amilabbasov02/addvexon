/**
 * Single-document API.
 *   GET    /api/documents/:id   → fetch document
 *   PATCH  /api/documents/:id   → update (partial — typically the autosave payload)
 *   DELETE /api/documents/:id   → permanent delete
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireUser, requireWorkspaceAccess } from "@/lib/session";

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  canvasSize: z
    .object({
      width: z.number().int().min(50).max(8000),
      height: z.number().int().min(50).max(8000),
    })
    .optional(),
  background: z.string().optional(),
  layers: z.array(z.any()).optional(),
  thumbnailUrl: z.string().optional(),
});

async function loadDoc(id: string) {
  const rows = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const doc = await loadDoc(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await requireWorkspaceAccess(user.id, doc.workspaceId);
    return NextResponse.json({ document: doc });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/documents/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const doc = await loadDoc(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await requireWorkspaceAccess(user.id, doc.workspaceId);

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await db
      .update(documents)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(documents.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("PATCH /api/documents/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const doc = await loadDoc(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await requireWorkspaceAccess(user.id, doc.workspaceId);
    await db.delete(documents).where(eq(documents.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/documents/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
