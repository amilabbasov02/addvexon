import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { documents, workspaceMembers, templates, users } from "@/db/schema";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { TemplateCard } from "@/components/dashboard/TemplateCard";

export const dynamic = "force-dynamic";

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
    // Default sign-in flow already lands on /dashboard, so we skip the
    // redundant `?next=/dashboard` param that would otherwise show up in
    // the address bar.
    redirect("/signin");
  }
  const user = session.user;
  // Better-Auth's session.user doesn't always carry our custom `plan` field
  // (depends on the additionalFields config + when the session was minted).
  // Read it directly from the users row so the upgrade prompts respect the
  // current plan in DB — e.g. an admin flipped to enterprise shouldn't see
  // "Unlock Pro" prompts anymore.
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
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
              Welcome back
            </p>
            <h1 className="font-display-sm text-display-sm font-bold text-on-surface">
              {user.name ?? user.email?.split("@")[0] ?? "Designer"}
            </h1>
            <p className="text-on-surface-variant text-body-md font-body-md mt-2">
              {docs.length === 0
                ? "Let's create your first banner."
                : `You have ${docs.length} design${docs.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/marketplace"
              className="glass-panel px-5 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
              Browse templates
            </Link>
            <Link
              href="/editor?new=1"
              className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New design
            </Link>
          </div>
        </div>

        {plan === "free" && (
          <Link
            href="/pricing"
            className="block mb-10 glass-panel rounded-2xl p-5 border border-primary/30 hover:border-primary/60 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl ai-gradient flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary">
                  bolt
                </span>
              </div>
              <div className="flex-1">
                <p className="text-on-surface font-label-md text-label-md">
                  Unlock the full Addvoxen AI engine with Pro
                </p>
                <p className="text-on-surface-variant text-label-sm font-label-sm">
                  Premium templates, AI text & image, no watermark — $12/mo.
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        )}

        <section className="mb-12">
          <div className="flex justify-between items-end mb-5">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              My designs
            </h2>
            {docs.length > 0 && (
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                {docs.length} of 24 shown
              </span>
            )}
          </div>

          {docs.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  draw
                </span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
                No designs yet
              </h3>
              <p className="text-on-surface-variant text-body-md font-body-md mb-6 max-w-md mx-auto">
                Start from a template or open a blank canvas — your work
                autosaves to the cloud.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/editor?new=1"
                  className="ai-gradient text-on-primary px-6 py-3 rounded-full text-label-md font-label-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  New design
                </Link>
                <Link
                  href="/marketplace"
                  className="glass-panel px-6 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-2"
                >
                  Browse templates
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {docs.map((d) => (
                <DocumentCard key={d.id} doc={d} />
              ))}
            </div>
          )}
        </section>

        {featured.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-5">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Trending templates
              </h2>
              <Link
                href="/marketplace"
                className="text-primary text-label-md font-label-md hover:gap-3 transition-all flex items-center gap-2"
              >
                See all
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={{
                    id: t.id,
                    slug: t.slug,
                    name: t.name,
                    category: t.category,
                    tagline: t.tagline ?? null,
                    tier: t.tier,
                    thumbnailUrl: t.thumbnailUrl,
                    document: t.document as TemplateCardDoc,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

type TemplateCardDoc = {
  canvasSize: { width: number; height: number };
  background: string;
  layers: unknown[];
};
