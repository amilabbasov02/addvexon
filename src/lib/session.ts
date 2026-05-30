/**
 * Server-side session helpers. Use these in Route Handlers / Server
 * Components / Server Actions to get the current user.
 */
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workspaces, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: string;
};

/** Get the current session, or null if unauthenticated. */
export async function getSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}

/** Throws a Response(401) if there's no session. Otherwise returns the user. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const u = session.user as unknown as SessionUser;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    image: u.image ?? null,
    plan: (u as { plan?: string }).plan ?? "free",
  };
}

/** Returns the user's first workspace (the personal workspace created on signup). */
export async function getUserDefaultWorkspace(userId: string) {
  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      ownerId: workspaces.ownerId,
      brandKit: workspaces.brandKit,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** Verify a user has access to a workspace. Throws 403 otherwise. */
export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string,
) {
  const member = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  if (member.length === 0) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return member[0];
}
