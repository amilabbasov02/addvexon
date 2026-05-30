import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import {
  templates,
  templateComments,
  users,
  userProfiles,
} from "@/db/schema";

function uid() {
  return `cm_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const MAX_LEN = 1500;

async function resolveTemplate(slug: string) {
  const rows = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

/**
 * POST /api/lib/messages   { op: "list", slug }   → list comments
 *                          { op: "add", slug, body } → add a comment
 *
 * Ad-blocker-safe replacement for /api/templates/[slug]/comments. Path is
 * generic, slug + operation in body.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { op?: string; slug?: string; body?: string }
    | null;
  const op = body?.op;
  const slug = body?.slug?.trim();
  if (!slug || (op !== "list" && op !== "add")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const templateId = await resolveTemplate(slug);
  if (!templateId) {
    return op === "list"
      ? NextResponse.json({ comments: [] })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (op === "list") {
    const rows = await db
      .select({
        id: templateComments.id,
        body: templateComments.body,
        createdAt: templateComments.createdAt,
        userId: templateComments.userId,
        userName: users.name,
        userImage: users.image,
        userHandle: userProfiles.handle,
      })
      .from(templateComments)
      .leftJoin(users, eq(users.id, templateComments.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, templateComments.userId))
      .where(eq(templateComments.templateId, templateId))
      .orderBy(desc(templateComments.createdAt))
      .limit(100);
    return NextResponse.json({ comments: rows });
  }

  // op === "add"
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const text = (body?.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Comment too long (${MAX_LEN} max)` },
      { status: 400 },
    );
  }
  const id = uid();
  await db.insert(templateComments).values({
    id,
    templateId,
    userId: session.user.id,
    body: text,
  });
  const profile = await db
    .select({ handle: userProfiles.handle })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1);
  return NextResponse.json({
    id,
    body: text,
    createdAt: new Date().toISOString(),
    userId: session.user.id,
    userName: session.user.name ?? null,
    userImage: (session.user as { image?: string | null }).image ?? null,
    userHandle: profile[0]?.handle ?? null,
  });
}
