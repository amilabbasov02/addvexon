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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tpl = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (tpl.length === 0) {
    return NextResponse.json({ comments: [] });
  }
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
    .where(eq(templateComments.templateId, tpl[0].id))
    .orderBy(desc(templateComments.createdAt))
    .limit(100);
  return NextResponse.json({ comments: rows });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { body?: string } | null;
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
  const tpl = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (tpl.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const id = uid();
  await db.insert(templateComments).values({
    id,
    templateId: tpl[0].id,
    userId: session.user.id,
    body: text,
  });
  // Resolve the commenter's handle so the optimistic client-side insert
  // links straight to /u/{handle}.
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
