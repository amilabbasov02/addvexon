import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { getSession } from "@/lib/session";

function uid() {
  return `pv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const PATH_RE = /^\/[\w\-./]*$/;

/**
 * Fire-and-forget pageview ping. The client component sends a single POST
 * per mount; we attach the signed-in user id if there is one + the visitor
 * id (anonymous device uuid) so the admin can later compute unique
 * visitors without tracking IP / browser fingerprints.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    path?: string;
    visitorId?: string;
    referrer?: string;
    country?: string;
  };
  const path = (body.path ?? "").slice(0, 200);
  const visitorId = (body.visitorId ?? "").slice(0, 64);
  if (!visitorId || !PATH_RE.test(path)) {
    return new NextResponse(null, { status: 204 });
  }
  const session = await getSession();
  try {
    await db.insert(pageViews).values({
      id: uid(),
      path,
      visitorId,
      userId: session?.user?.id ?? null,
      country: (body.country ?? "").slice(0, 4) || null,
      referrer: (body.referrer ?? "").slice(0, 500) || null,
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
    });
  } catch (err) {
    console.error("pageview insert failed", err);
  }
  return new NextResponse(null, { status: 204 });
}
