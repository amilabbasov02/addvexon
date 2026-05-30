/**
 * Documents collection API.
 *   GET  /api/documents          → list my documents (newest first, paged)
 *   POST /api/documents          → create a new document
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { documents, workspaceMembers } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";
import { uid } from "@/lib/ids";

const CreateDocSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  canvasSize: z.object({
    width: z.number().int().min(50).max(8000),
    height: z.number().int().min(50).max(8000),
  }),
  background: z.string().default("#0b1326"),
  layers: z.array(z.any()).default([]),
  templateId: z.string().optional(),
  workspaceId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30"), 100);
    const cursor = url.searchParams.get("cursor"); // updatedAt ISO string

    const memberships = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id));
    if (memberships.length === 0) {
      return NextResponse.json({ documents: [], nextCursor: null });
    }
    const wsIds = memberships.map((m) => m.workspaceId);

    // Build query: documents in any of my workspaces.
    const rows = await db.query.documents.findMany({
      where: (d, { inArray, lt, and: andQ }) =>
        cursor
          ? andQ(inArray(d.workspaceId, wsIds), lt(d.updatedAt, new Date(cursor)))
          : inArray(d.workspaceId, wsIds),
      orderBy: desc(documents.updatedAt),
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const nextCursor = hasMore
      ? items[items.length - 1].updatedAt.toISOString()
      : null;

    return NextResponse.json({
      documents: items.map((d) => ({
        id: d.id,
        title: d.title,
        canvasSize: d.canvasSize,
        thumbnailUrl: d.thumbnailUrl,
        templateId: d.templateId,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
      })),
      nextCursor,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = CreateDocSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let workspaceId = parsed.data.workspaceId;
    if (!workspaceId) {
      const ws = await getUserDefaultWorkspace(user.id);
      if (!ws) {
        return NextResponse.json(
          { error: "No workspace found for user" },
          { status: 400 },
        );
      }
      workspaceId = ws.id;
    } else {
      const member = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId),
          ),
        )
        .limit(1);
      if (member.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const id = uid("doc");
    const now = new Date();
    await db.insert(documents).values({
      id,
      workspaceId,
      createdBy: user.id,
      title: parsed.data.title ?? "Untitled design",
      canvasSize: parsed.data.canvasSize,
      background: parsed.data.background,
      layers: parsed.data.layers,
      templateId: parsed.data.templateId,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("POST /api/documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
