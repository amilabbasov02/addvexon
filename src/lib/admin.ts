/**
 * Admin authorization helpers. Until we add a proper `role` column on
 * users, an admin is anyone whose email appears in the comma-separated
 * `ADMIN_EMAILS` env var. Bootstrapping is therefore: edit .env.local,
 * add your address, restart.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession, type SessionUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/** Pull the user's current email from DB by id. Sessions cache the email
 *  at sign-in time, so when the admin row is renamed (e.g. during a brand
 *  cutover) the in-session email becomes stale. Reading from DB removes
 *  that footgun without forcing every admin to log out and back in. */
async function freshEmailFor(userId: string): Promise<string | null> {
  try {
    const rows = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0]?.email ?? null;
  } catch {
    return null;
  }
}

/** Returns the current user if they are an admin, otherwise null. Use in
 *  server components / route handlers. */
export async function getAdminUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user) return null;
  // Allow either the session-cached email OR the current DB email — covers
  // the case where the admin row was renamed since they last signed in.
  let ok = isAdminEmail(session.user.email);
  if (!ok) {
    const live = await freshEmailFor(session.user.id);
    ok = isAdminEmail(live);
  }
  if (!ok) return null;
  const u = session.user as SessionUser;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    image: u.image ?? null,
    plan: (u as { plan?: string }).plan ?? "free",
  };
}

/** API-route variant — throws a Response 401/403 if not admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  let ok = isAdminEmail(session.user.email);
  if (!ok) {
    const live = await freshEmailFor(session.user.id);
    ok = isAdminEmail(live);
  }
  if (!ok) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    plan: (session.user as { plan?: string }).plan ?? "free",
  };
}

/** Standard "Forbidden" response for non-admin API access. */
export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
