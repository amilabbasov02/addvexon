import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { templates, templateLikes } from "@/db/schema";

function uid() {
  return `lk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

async function resolveTemplate(slug: string) {
  const rows = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

/**
 * POST /api/lib/heart   { slug }   → add like
 * DELETE                { slug }   → remove like
 *
 * Ad-blocker-safe replacement for /api/templates/[slug]/like.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const templateId = await resolveTemplate(slug);
  if (!templateId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const templateId = await resolveTemplate(slug);
  if (!templateId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db
    .delete(templateLikes)
    .where(
      and(
        eq(templateLikes.templateId, templateId),
        eq(templateLikes.userId, session.user.id),
      ),
    );
  return NextResponse.json({ liked: false });
}
