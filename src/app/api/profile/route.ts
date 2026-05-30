import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      name: users.name,
      handle: userProfiles.handle,
      bio: userProfiles.bio,
      website: userProfiles.website,
      twitter: userProfiles.twitter,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1);
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    handle?: string;
    bio?: string;
    website?: string;
    twitter?: string;
  };

  const handle = body.handle?.trim().toLowerCase() || null;
  if (handle && !HANDLE_RE.test(handle)) {
    return NextResponse.json(
      { error: "Handle must be 3–20 chars, a-z 0-9 _ only" },
      { status: 400 },
    );
  }

  // Handle uniqueness (other users only)
  if (handle) {
    const clash = await db
      .select({ id: userProfiles.userId })
      .from(userProfiles)
      .where(
        and(
          eq(userProfiles.handle, handle),
          ne(userProfiles.userId, session.user.id),
        ),
      )
      .limit(1);
    if (clash.length > 0) {
      return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
    }
  }

  const name = body.name?.trim().slice(0, 80);
  if (name) {
    await db.update(users).set({ name }).where(eq(users.id, session.user.id));
  }

  const profilePatch = {
    handle,
    bio: body.bio?.trim().slice(0, 280) ?? null,
    website: body.website?.trim().slice(0, 120) ?? null,
    twitter: body.twitter?.trim().replace(/^@/, "").slice(0, 30) ?? null,
    updatedAt: new Date(),
  };
  // Upsert profile row
  await db
    .insert(userProfiles)
    .values({ userId: session.user.id, ...profilePatch })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: profilePatch,
    });

  return NextResponse.json({ ok: true });
}
