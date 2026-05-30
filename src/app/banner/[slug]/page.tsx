import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  templates,
  templateLikes,
  templateComments,
  users,
  userProfiles,
} from "@/db/schema";
import { getSession } from "@/lib/session";
import { DocumentThumbnail } from "@/components/dashboard/DocumentThumbnail";
import { BannerSocial } from "./BannerSocial";
import {
  BannerBreadcrumb,
  BannerCreatorLabel,
  BannerCreatorRoleLabel,
  BannerStatLabel,
  BannerUseCta,
} from "./BannerLabels";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rows = await db
    .select({
      name: templates.name,
      tagline: templates.tagline,
      thumbnailUrl: templates.thumbnailUrl,
    })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  const t = rows[0];
  if (!t) return { title: "Banner not found" };
  const desc = t.tagline ?? `${t.name} — banner template ready to remix in Addvoxen.`;
  const og = t.thumbnailUrl
    ? `${SITE_URL}${t.thumbnailUrl}`
    : `${SITE_URL}/og-cover.png`;
  return {
    title: t.name,
    description: desc,
    alternates: { canonical: `${SITE_URL}/banner/${slug}` },
    openGraph: {
      title: t.name,
      description: desc,
      type: "article",
      url: `${SITE_URL}/banner/${slug}`,
      images: [{ url: og, width: 1200, height: 630, alt: t.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.name,
      description: desc,
      images: [og],
    },
  };
}

async function loadTemplate(slug: string, viewerId?: string) {
  const rows = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      category: templates.category,
      tagline: templates.tagline,
      tier: templates.tier,
      document: templates.document,
      thumbnailUrl: templates.thumbnailUrl,
      downloads: templates.downloads,
      salesCount: templates.salesCount,
      priceCents: templates.priceCents,
      currency: templates.currency,
      createdBy: templates.createdBy,
      createdAt: templates.createdAt,
      creatorName: users.name,
      creatorImage: users.image,
      creatorEmail: users.email,
      creatorHandle: userProfiles.handle,
    })
    .from(templates)
    .leftJoin(users, eq(users.id, templates.createdBy))
    .leftJoin(userProfiles, eq(userProfiles.userId, templates.createdBy))
    .where(eq(templates.slug, slug))
    .limit(1);
  if (rows.length === 0) return null;
  const tpl = rows[0];

  const [likeCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(templateLikes)
    .where(eq(templateLikes.templateId, tpl.id));

  let liked = false;
  if (viewerId) {
    const mine = await db
      .select({ id: templateLikes.id })
      .from(templateLikes)
      .where(
        sql`${templateLikes.templateId} = ${tpl.id} AND ${templateLikes.userId} = ${viewerId}`,
      )
      .limit(1);
    liked = mine.length > 0;
  }

  const comments = await db
    .select({
      id: templateComments.id,
      body: templateComments.body,
      createdAt: templateComments.createdAt,
      userId: templateComments.userId,
      userName: users.name,
      userImage: users.image,
      userHandle: userProfiles.handle,
    })
    .from(templateComments)
    .leftJoin(users, eq(users.id, templateComments.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, templateComments.userId))
    .where(eq(templateComments.templateId, tpl.id))
    .orderBy(desc(templateComments.createdAt))
    .limit(50);

  return { tpl, likeCount: likeCount?.n ?? 0, liked, comments };
}

export default async function BannerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const data = await loadTemplate(slug, session?.user?.id);
  if (!data) notFound();
  const { tpl, likeCount, liked, comments } = data;
  const doc = tpl.document as {
    canvasSize: { width: number; height: number };
    background: string;
    layers: unknown[];
  };
  const isOfficial = !tpl.createdBy;
  const creatorInitial = isOfficial
    ? "A"
    : (tpl.creatorName ?? "C").charAt(0);
  const creatorHref = isOfficial
    ? "/marketplace?source=official"
    : `/u/${tpl.creatorHandle ?? tpl.createdBy}`;
  const priceLabel =
    tpl.priceCents && tpl.priceCents > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: tpl.currency ?? "USD",
          maximumFractionDigits: 0,
        }).format(tpl.priceCents / 100)
      : "Free";

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-7xl mx-auto">
        <nav className="mb-6 text-label-sm font-label-sm text-on-surface-variant flex items-center gap-2">
          <BannerBreadcrumb />
          <span>›</span>
          <span className="text-on-surface truncate">{tpl.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* Preview */}
          <div>
            <div
              className="glass-panel rounded-3xl overflow-hidden relative"
              style={{
                aspectRatio: `${doc.canvasSize.width} / ${doc.canvasSize.height}`,
              }}
            >
              <DocumentThumbnail
                background={doc.background}
                canvasSize={doc.canvasSize}
                layers={doc.layers}
                thumbnailUrl={tpl.thumbnailUrl}
              />
            </div>
            <p className="mt-3 text-on-surface-variant text-label-sm font-label-sm">
              {doc.canvasSize.width}×{doc.canvasSize.height}px
            </p>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-wider text-tertiary-fixed-dim mb-2">
                {tpl.category}
              </p>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {tpl.name}
              </h1>
              {tpl.tagline && (
                <p className="text-on-surface-variant text-body-md font-body-md mt-3">
                  {tpl.tagline}
                </p>
              )}
            </div>

            <Link
              href={creatorHref}
              className="flex items-center gap-3 glass-panel rounded-2xl p-3 hover:bg-white/5 transition-colors"
            >
              {tpl.creatorImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tpl.creatorImage}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full ai-gradient flex items-center justify-center text-on-primary font-label-md">
                  {creatorInitial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-label-md font-label-md truncate">
                  <BannerCreatorLabel
                    isOfficial={isOfficial}
                    creatorName={tpl.creatorName ?? null}
                  />
                </p>
                <p className="text-on-surface-variant text-label-sm font-label-sm">
                  <BannerCreatorRoleLabel isOfficial={isOfficial} />
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-2">
              <div className="glass-panel rounded-xl p-3">
                <p className="text-on-surface text-label-md font-label-md">
                  {likeCount}
                </p>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
                  <BannerStatLabel kind="likes" />
                </p>
              </div>
              <div className="glass-panel rounded-xl p-3">
                <p className="text-on-surface text-label-md font-label-md">
                  {comments.length}
                </p>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
                  <BannerStatLabel kind="comments" />
                </p>
              </div>
              <div className="glass-panel rounded-xl p-3">
                <p className="text-on-surface text-label-md font-label-md">
                  {tpl.salesCount ?? tpl.downloads ?? 0}
                </p>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
                  <BannerStatLabel kind="uses" />
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <BannerUseCta slug={tpl.slug} price={priceLabel} />
              <BannerSocial
                slug={tpl.slug}
                initialLiked={liked}
                initialLikeCount={likeCount}
                signedIn={!!session?.user}
                comments={comments.map((c) => ({
                  id: c.id,
                  body: c.body,
                  createdAt: c.createdAt instanceof Date
                    ? c.createdAt.toISOString()
                    : String(c.createdAt),
                  userId: c.userId,
                  userName: c.userName,
                  userImage: c.userImage,
                  userHandle: c.userHandle ?? null,
                }))}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
