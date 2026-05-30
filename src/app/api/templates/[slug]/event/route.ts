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

/** SHA-256(ip + BETTER_AUTH_SECRET), first 16 hex chars. Never store raw IP
 *  — this is enough for short-term rate-limiting + de-dup without leaking
 *  the actual address. */
function hashIp(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = process.env.BETTER_AUTH_SECRET ?? "addvoxen-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 16);
}

/**
 * POST /api/templates/[slug]/event   { kind: "view"|"click"|"export"|"cta" }
 *
 * Fire-and-forget telemetry — never blocks the user. Returns 204 on success
 * so the client can ignore the response.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { kind?: string } | null;
  const kind = body?.kind;
  if (!kind || !VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
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
