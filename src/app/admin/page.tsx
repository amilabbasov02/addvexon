import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

async function getCounts() {
  const [listings, campaigns, waitlist, users] = await Promise.all([
    db.execute(sql`
      SELECT
        SUM(CASE WHEN listing_status = 'pending' THEN 1 ELSE 0 END)::int AS pending,
        SUM(CASE WHEN listing_status = 'approved' AND created_by IS NOT NULL THEN 1 ELSE 0 END)::int AS approved,
        SUM(CASE WHEN created_by IS NULL THEN 1 ELSE 0 END)::int AS official
      FROM templates
    `),
    db.execute(sql`
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending,
        SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END)::int AS live,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS completed
      FROM ad_campaigns
    `),
    db.execute(sql`
      SELECT
        SUM(CASE WHEN contacted_at IS NULL THEN 1 ELSE 0 END)::int AS pending,
        COUNT(*)::int AS total
      FROM waitlist
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN plan != 'free' THEN 1 ELSE 0 END)::int AS paid
      FROM users
    `),
  ]);
  return {
    listings: listings.rows[0] as { pending: number; approved: number; official: number },
    campaigns: campaigns.rows[0] as { pending: number; live: number; completed: number },
    waitlist: waitlist.rows[0] as { pending: number; total: number },
    users: users.rows[0] as { total: number; paid: number },
  };
}

export default async function AdminOverviewPage() {
  const counts = await getCounts();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tile
          href="/admin/listings"
          icon="storefront"
          label="Listings"
          primary={counts.listings.pending}
          primaryLabel="pending"
          secondary={`${counts.listings.approved} community · ${counts.listings.official} official`}
          accent="primary"
        />
        <Tile
          href="/admin/campaigns"
          icon="campaign"
          label="Campaigns"
          primary={counts.campaigns.pending}
          primaryLabel="awaiting launch"
          secondary={`${counts.campaigns.live} live · ${counts.campaigns.completed} done`}
          accent="tertiary"
        />
        <Tile
          href="/admin/waitlist"
          icon="groups"
          label="Waitlist"
          primary={counts.waitlist.pending}
          primaryLabel="uncontacted"
          secondary={`${counts.waitlist.total} total signups`}
          accent="warn"
        />
        <Tile
          href="/admin/users"
          icon="person"
          label="Users"
          primary={counts.users.total}
          primaryLabel="total"
          secondary={`${counts.users.paid} paid`}
          accent="success"
        />
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
          Quick actions
        </h2>
        <p className="text-on-surface-variant text-body-md font-body-md mb-5">
          What needs your attention right now.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            href="/admin/listings?status=pending"
            icon="rate_review"
            title={`Review ${counts.listings.pending} listing${counts.listings.pending === 1 ? "" : "s"}`}
            body="Creator-submitted templates awaiting your approval."
            visible={counts.listings.pending > 0}
          />
          <ActionCard
            href="/admin/campaigns?status=pending"
            icon="rocket_launch"
            title={`Launch ${counts.campaigns.pending} campaign${counts.campaigns.pending === 1 ? "" : "s"}`}
            body="Marketers waiting for you to publish their creative."
            visible={counts.campaigns.pending > 0}
          />
          <ActionCard
            href="/admin/waitlist?filter=pending"
            icon="forward_to_inbox"
            title={`Reach out to ${counts.waitlist.pending} on the waitlist`}
            body="Open a conversation, send onboarding email + invoice."
            visible={counts.waitlist.pending > 0}
          />
          {counts.listings.pending +
            counts.campaigns.pending +
            counts.waitlist.pending ===
            0 && (
            <p className="col-span-2 text-center text-on-surface-variant py-8">
              All caught up.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function Tile({
  href,
  icon,
  label,
  primary,
  primaryLabel,
  secondary,
  accent,
}: {
  href: string;
  icon: string;
  label: string;
  primary: number;
  primaryLabel: string;
  secondary: string;
  accent: "primary" | "tertiary" | "warn" | "success";
}) {
  const accentMap = {
    primary: "from-primary to-primary-container text-on-primary",
    tertiary: "from-tertiary to-tertiary-container text-on-tertiary",
    warn: "from-amber-400 to-rose-500 text-white",
    success: "from-emerald-400 to-teal-600 text-white",
  };
  return (
    <Link
      href={href}
      className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(208,188,255,0.12)] flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          arrow_forward
        </span>
      </div>
      <div>
        <p className="text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
          {label}
        </p>
        <p className="text-on-surface font-display-sm text-display-sm font-bold leading-none mt-1">
          {primary}
        </p>
        <p className="text-on-surface-variant text-label-sm font-label-sm mt-1">
          {primaryLabel} · {secondary}
        </p>
      </div>
    </Link>
  );
}

function ActionCard({
  href,
  icon,
  title,
  body,
  visible,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl p-4 bg-surface-container-high/40 hover:bg-surface-container-high border border-white/10 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-label-md text-label-md">{title}</p>
        <p className="text-on-surface-variant text-label-sm font-label-sm">
          {body}
        </p>
      </div>
      <span className="material-symbols-outlined text-on-surface-variant">
        chevron_right
      </span>
    </Link>
  );
}
