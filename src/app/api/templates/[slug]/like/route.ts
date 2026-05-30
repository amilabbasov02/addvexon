import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { templates, templateLikes } from "@/db/schema";

function uid() {
  return `lk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/**
 * Toggle a "heart" on a template. POST adds, DELETE removes. Always returns
 * the resulting state so the optimistic UI can resync if it drifted.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const tpl = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (tpl.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const templateId = tpl[0].id;
  // Idempotent insert — ignore duplicate-key conflicts so repeated POSTs
  // from a slow / double-click never 500 the user.
  try {
    await db.insert(templateLikes).values({
      id: uid(),
      templateId,
      userId: session.user.id,
    });
  } catch {
    /* already liked — no-op */
  }
  return NextResponse.json({ liked: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const tpl = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (tpl.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db
    .delete(templateLikes)
    .where(
      and(
        eq(templateLikes.templateId, tpl[0].id),
        eq(templateLikes.userId, session.user.id),
      ),
    );
  return NextResponse.json({ liked: false });
}
