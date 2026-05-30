import { redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { documents, workspaceMembers, templates, users } from "@/db/schema";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

type TemplateCardDoc = {
  canvasSize: { width: number; height: number };
  background: string;
  layers: unknown[];
};

async function getMyDocuments(userId: string) {
  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));
  if (memberships.length === 0) return [];
  const wsIds = memberships.map((m) => m.workspaceId);
  return db
    .select({
      id: documents.id,
      title: documents.title,
      canvasSize: documents.canvasSize,
      thumbnailUrl: documents.thumbnailUrl,
      background: documents.background,
      layers: documents.layers,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(inArray(documents.workspaceId, wsIds))
    .orderBy(desc(documents.updatedAt))
    .limit(24);
}

async function getFeaturedTemplates() {
  return db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      category: templates.category,
      tagline: templates.tagline,
      tier: templates.tier,
      document: templates.document,
      thumbnailUrl: templates.thumbnailUrl,
    })
    .from(templates)
    .where(eq(templates.published, true))
    .orderBy(desc(templates.downloads))
    .limit(8);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin");
  }
  const user = session.user;
  const dbUser = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const plan = dbUser[0]?.plan ?? "free";

  const [docs, featured] = await Promise.all([
    getMyDocuments(user.id),
    getFeaturedTemplates(),
  ]);

  return (
    <DashboardClient
      user={{ name: user.name, email: user.email }}
      plan={plan}
      docs={docs.map((d) => ({
        id: d.id,
        title: d.title,
        canvasSize: d.canvasSize as TemplateCardDoc["canvasSize"],
        thumbnailUrl: d.thumbnailUrl,
        background: d.background,
        layers: d.layers as unknown[],
        updatedAt: d.updatedAt,
      }))}
      featured={featured.map((tpl) => ({
        id: tpl.id,
        slug: tpl.slug,
        name: tpl.name,
        category: tpl.category,
        tagline: tpl.tagline ?? null,
        tier: tpl.tier,
        document: tpl.document as TemplateCardDoc,
        thumbnailUrl: tpl.thumbnailUrl,
      }))}
    />
  );
}
