import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  userProfiles,
  templates,
  templateLikes,
  templateComments,
  purchases,
} from "@/db/schema";
import { getSession } from "@/lib/session";
import { TemplateCard } from "@/components/dashboard/TemplateCard";

export const dynamic = "force-dynamic";

async function loadProfile(idOrHandle: string) {
  // Try by user id first, then by handle
  let rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      plan: users.plan,
      createdAt: users.createdAt,
      handle: userProfiles.handle,
      bio: userProfiles.bio,
      website: userProfiles.website,
      twitter: userProfiles.twitter,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, idOrHandle))
    .limit(1);
  if (rows.length === 0) {
    rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        plan: users.plan,
        createdAt: users.createdAt,
        handle: userProfiles.handle,
        bio: userProfiles.bio,
        website: userProfiles.website,
        twitter: userProfiles.twitter,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(userProfiles.handle, idOrHandle))
      .limit(1);
  }
  if (rows.length === 0) return null;
  return rows[0];
}

async function loadStats(userId: string) {
  const [tplCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(templates)
    .where(
      and(eq(templates.createdBy, userId), eq(templates.published, true)),
    );
  const [likeCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(templateLikes)
    .innerJoin(templates, eq(templates.id, templateLikes.templateId))
    .where(eq(templates.createdBy, userId));
  const [commentCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(templateComments)
    .where(eq(templateComments.userId, userId));
  const [salesCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(purchases)
    .where(eq(purchases.creatorId, userId));
  return {
    templates: tplCount?.n ?? 0,
    likes: likeCount?.n ?? 0,
    comments: commentCount?.n ?? 0,
    sales: salesCount?.n ?? 0,
  };
}

async function loadUserTemplates(userId: string) {
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
      priceCents: templates.priceCents,
      currency: templates.currency,
      salesCount: templates.salesCount,
    })
    .from(templates)
    .where(
      and(
        eq(templates.createdBy, userId),
        eq(templates.published, true),
        eq(templates.listingStatus, "approved"),
      ),
    )
    .orderBy(desc(templates.salesCount), desc(templates.createdAt))
    .limit(48);
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await loadProfile(id);
  if (!profile) notFound();
  const session = await getSession();
  const isMe = session?.user?.id === profile.id;
  const [stats, myTemplates] = await Promise.all([
    loadStats(profile.id),
    loadUserTemplates(profile.id),
  ]);

  const displayName = profile.name ?? profile.handle ?? "Designer";
  const joined =
    profile.createdAt instanceof Date
      ? profile.createdAt
      : new Date(profile.createdAt);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex items-start gap-5">
            {profile.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.image}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl ai-gradient flex items-center justify-center text-on-primary text-display-sm font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-1">
                {profile.plan === "pro" || profile.plan === "team"
                  ? `${profile.plan.toUpperCase()} member`
                  : "Designer"}
              </p>
              <h1 className="font-display-sm text-display-sm font-bold text-on-surface truncate">
                {displayName}
              </h1>
              {profile.handle && (
                <p className="text-on-surface-variant text-label-md font-label-md">
                  @{profile.handle}
                </p>
              )}
              {profile.bio && (
                <p className="text-on-surface-variant text-body-md font-body-md mt-2 max-w-xl">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-label-sm font-label-sm text-on-surface-variant">
                <span>Joined {joined.toLocaleDateString()}</span>
                {profile.website && (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-on-surface flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-on-surface"
                  >
                    @{profile.twitter.replace(/^@/, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
          {isMe && (
            <Link
              href="/settings/profile"
              className="glass-panel px-5 py-3 rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 self-start"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit profile
            </Link>
          )}
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Templates", value: stats.templates },
            { label: "Likes", value: stats.likes },
            { label: "Comments", value: stats.comments },
            { label: "Sales", value: stats.sales },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-4">
              <p className="text-on-surface text-headline-lg font-headline-lg">
                {s.value}
              </p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5">
            Templates by {displayName}
          </h2>
          {myTemplates.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <p className="text-on-surface-variant text-body-md font-body-md">
                {isMe
                  ? "Publish your first banner to see it here."
                  : "No published templates yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {myTemplates.map((t) => (
                <div key={t.id} className="relative">
                  <TemplateCard
                    template={{
                      id: t.id,
                      slug: t.slug,
                      name: t.name,
                      category: t.category,
                      tagline: t.tagline ?? null,
                      tier: t.tier,
                      priceCents: t.priceCents ?? 0,
                      currency: t.currency ?? "USD",
                      salesCount: t.salesCount ?? 0,
                      source: "community",
                      creatorName: displayName,
                      creatorImage: profile.image,
                      thumbnailUrl: t.thumbnailUrl,
                      document: t.document as {
                        canvasSize: { width: number; height: number };
                        background: string;
                        layers: unknown[];
                      },
                    }}
                    signedIn={!!session?.user}
                  />
                  {/* Owner-only quick edit: opens the document in the editor
                   *  with the same layers, so the creator can iterate on the
                   *  listing in-place. */}
                  {isMe && (
                    <Link
                      href={`/editor?template=${t.slug}`}
                      className="absolute top-2 right-2 z-10 glass-panel rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
