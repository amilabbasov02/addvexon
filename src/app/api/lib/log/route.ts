import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { templates, bannerEvents } from "@/db/schema";

const VALID_KINDS = new Set(["view", "click", "export", "cta"]);

function uid() {
  return `ev_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function hashIp(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = process.env.BETTER_AUTH_SECRET ?? "addvoxen-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 16);
}

/**
 * POST /api/lib/log   { slug, kind }
 *
 * Ad-blocker-safe replacement for /api/templates/[slug]/event. Old path
 * included "/event" + the slug (often containing "banner"/IAB dimensions)
 * which uBlock filter lists treated as a tracking pixel. Body-only payload
 * keeps the URL neutral.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { slug?: string; kind?: string }
    | null;
  const slug = body?.slug?.trim();
  const kind = body?.kind;
  if (!slug || !kind || !VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const tpl = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  if (tpl.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  try {
    await db.insert(bannerEvents).values({
      id: uid(),
      templateId: tpl[0].id,
      kind,
      userId: session?.user?.id ?? null,
      ipHash: hashIp(req),
    });
  } catch (err) {
    console.error("event insert failed", err);
  }
  return new NextResponse(null, { status: 204 });
}
