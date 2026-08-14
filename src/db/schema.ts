/**
 * Addvoxen database schema (PostgreSQL + Drizzle ORM)
 *
 * Tables split into two logical groups:
 *   1. Auth (Better-Auth compatible): users, sessions, accounts, verifications
 *   2. App: workspaces, workspace_members, documents, templates, assets,
 *           subscriptions, ai_jobs, usage_metrics
 *
 * Conventions:
 *   - ids are text (cuid2 / nanoid generated in app code)
 *   - jsonb for structured payloads (brand_kit, layers, canvas_size, …)
 *   - timestamptz everywhere for consistent global timezone handling
 *   - .references( ... onDelete: "cascade" ) wherever child row is meaningless
 *     without the parent (documents tied to workspaces, sessions to users, …)
 */
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
  bigint,
} from "drizzle-orm/pg-core";

// ============================================================
// AUTH (Better-Auth compatible)
// ============================================================

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    // App-specific fields
    plan: text("plan").notNull().default("free"), // free | pro | team | enterprise
    locale: text("locale").notNull().default("en"),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    stripeCustomerIdx: index("users_stripe_customer_idx").on(t.stripeCustomerId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("sessions_token_idx").on(t.token),
    userIdx: index("sessions_user_idx").on(t.userId),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(), // credential | google | github | …
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    providerAccountIdx: uniqueIndex("accounts_provider_account_idx").on(
      t.providerId,
      t.accountId,
    ),
    userIdx: index("accounts_user_idx").on(t.userId),
  }),
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // email address typically
    value: text("value").notNull(), // signed token
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    identifierIdx: index("verifications_identifier_idx").on(t.identifier),
  }),
);

// ============================================================
// APP — workspaces & membership
// ============================================================

export const workspaces = pgTable(
  "workspaces",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    /** Brand kit: { colors: string[], fonts: string[], logoUrl?: string, name?: string } */
    brandKit: jsonb("brand_kit").$type<{
      colors?: string[];
      fonts?: string[];
      logoUrl?: string;
      brandName?: string;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("workspaces_slug_idx").on(t.slug),
    ownerIdx: index("workspaces_owner_idx").on(t.ownerId),
  }),
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("editor"), // owner | admin | editor | viewer
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueIdx: uniqueIndex("workspace_members_unique_idx").on(
      t.workspaceId,
      t.userId,
    ),
    workspaceIdx: index("workspace_members_workspace_idx").on(t.workspaceId),
    userIdx: index("workspace_members_user_idx").on(t.userId),
  }),
);

// ============================================================
// APP — documents & templates
// ============================================================

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull().default("Untitled"),
    /** { width, height } */
    canvasSize: jsonb("canvas_size").notNull().$type<{
      width: number;
      height: number;
    }>(),
    /** EditorDocument["layers"] — array of Layer */
    layers: jsonb("layers").notNull().$type<unknown[]>(),
    background: text("background").notNull().default("#0b1326"),
    thumbnailUrl: text("thumbnail_url"),
    templateId: text("template_id"),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("documents_workspace_idx").on(t.workspaceId),
    createdByIdx: index("documents_created_by_idx").on(t.createdBy),
    templateIdx: index("documents_template_idx").on(t.templateId),
    updatedIdx: index("documents_updated_idx").on(t.updatedAt),
  }),
);

export const templates = pgTable(
  "templates",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    tagline: text("tagline"),
    /** Complete EditorDocument: { canvasSize, background, layers } */
    document: jsonb("document").notNull().$type<{
      canvasSize: { width: number; height: number };
      background: string;
      layers: unknown[];
    }>(),
    tier: text("tier").notNull().default("free"), // free | pro
    thumbnailUrl: text("thumbnail_url"),
    downloads: integer("downloads").notNull().default(0),
    /** null = system / curated template */
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    published: boolean("published").notNull().default(true),
    /** Marketplace pricing — 0 = free, otherwise the creator-set price. */
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    /**
     * Lifecycle for user-submitted listings:
     *   - "draft"    creator is still preparing it (not visible)
     *   - "pending"  awaiting admin review
     *   - "approved" live on the marketplace
     *   - "rejected" admin sent it back
     */
    listingStatus: text("listing_status").notNull().default("approved"),
    /** What did the creator earn over the lifetime of this listing? */
    salesCount: integer("sales_count").notNull().default(0),
    revenueCents: integer("revenue_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("templates_slug_idx").on(t.slug),
    categoryIdx: index("templates_category_idx").on(t.category),
    tierIdx: index("templates_tier_idx").on(t.tier),
    createdByIdx: index("templates_created_by_idx").on(t.createdBy),
    listingIdx: index("templates_listing_idx").on(t.listingStatus),
  }),
);

/** A purchase of a marketplace template. Once bought, the buyer can open
 *  the template in the editor without re-paying. */
export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    creatorId: text("creator_id").references(() => users.id, {
      onDelete: "set null",
    }),
    paidCents: integer("paid_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    /** Platform commission in cents (we take 30% by default). */
    platformFeeCents: integer("platform_fee_cents").notNull().default(0),
    creatorPayoutCents: integer("creator_payout_cents").notNull().default(0),
    status: text("status").notNull().default("completed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueBuyTemplate: uniqueIndex("purchases_buyer_template_idx").on(
      t.buyerId,
      t.templateId,
    ),
    buyerIdx: index("purchases_buyer_idx").on(t.buyerId),
    creatorIdx: index("purchases_creator_idx").on(t.creatorId),
    createdIdx: index("purchases_created_idx").on(t.createdAt),
  }),
);

/** Ad campaign request. The user picks a document + platform(s) + budget;
 *  we accept the brief, the Addvoxen team launches it under our managed
 *  Business Manager hosts, then analytics flow back into ad_analytics. */
export const adCampaigns = pgTable(
  "ad_campaigns",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** "meta" | "google" | "tiktok" | "linkedin" | "twitter" | "pinterest" | "snapchat" */
    platform: text("platform").notNull(),
    objective: text("objective").notNull().default("traffic"), // traffic | conversions | awareness | engagement
    /** Daily budget in cents (USD). */
    dailyBudgetCents: integer("daily_budget_cents").notNull(),
    /** Optional total spend cap. */
    totalBudgetCents: integer("total_budget_cents"),
    landingUrl: text("landing_url").notNull(),
    audience: jsonb("audience").$type<{
      countries?: string[];
      ages?: { min: number; max: number };
      genders?: string[];
      interests?: string[];
    }>(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    /**
     * Lifecycle:
     *   - "draft"     user is composing
     *   - "pending"   submitted, Addvoxen team to action
     *   - "live"      running on the ad platform
     *   - "paused"    user paused
     *   - "completed" finished its run / spent the budget
     *   - "rejected"  platform or our team rejected the creative
     */
    status: text("status").notNull().default("pending"),
    /** Foreign campaign id assigned by Meta / Google / TikTok once launched. */
    externalCampaignId: text("external_campaign_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("ad_campaigns_user_idx").on(t.userId),
    statusIdx: index("ad_campaigns_status_idx").on(t.status),
    platformIdx: index("ad_campaigns_platform_idx").on(t.platform),
    createdIdx: index("ad_campaigns_created_idx").on(t.createdAt),
  }),
);

/** Daily performance numbers per campaign. Populated by the platform-sync
 *  job (admin script today, real Marketing API webhooks once integrated). */
export const adAnalytics = pgTable(
  "ad_analytics",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => adCampaigns.id, { onDelete: "cascade" }),
    /** YYYY-MM-DD — one row per day */
    date: text("date").notNull(),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    conversions: integer("conversions").notNull().default(0),
    spendCents: integer("spend_cents").notNull().default(0),
    /** Click-through rate, stored as ppm (parts per million) to keep integer math */
    ctrPpm: integer("ctr_ppm").notNull().default(0),
    /** Cost per click, in cents */
    cpcCents: integer("cpc_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueCampaignDay: uniqueIndex("ad_analytics_campaign_date_idx").on(
      t.campaignId,
      t.date,
    ),
    campaignIdx: index("ad_analytics_campaign_idx").on(t.campaignId),
  }),
);

// ============================================================
// APP — uploaded assets
// ============================================================

export const assets = pgTable(
  "assets",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    url: text("url").notNull(),
    type: text("type").notNull(), // image/png, image/jpeg, …
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("assets_workspace_idx").on(t.workspaceId),
    uploadedIdx: index("assets_uploaded_idx").on(t.createdAt),
  }),
);

// ============================================================
// APP — subscriptions & AI usage
// ============================================================

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    stripePriceId: text("stripe_price_id"),
    plan: text("plan").notNull(), // pro | team | enterprise
    status: text("status").notNull(), // active | trialing | past_due | canceled
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stripeSubIdx: uniqueIndex("subscriptions_stripe_sub_idx").on(
      t.stripeSubscriptionId,
    ),
    userIdx: index("subscriptions_user_idx").on(t.userId),
  }),
);

export const aiJobs = pgTable(
  "ai_jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // text_gen | image_gen | bg_remove | upscale | variants
    prompt: text("prompt"),
    result: jsonb("result"),
    status: text("status").notNull().default("pending"), // pending | done | failed
    tokensUsed: integer("tokens_used").notNull().default(0),
    costCents: integer("cost_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("ai_jobs_user_idx").on(t.userId),
    createdIdx: index("ai_jobs_created_idx").on(t.createdAt),
  }),
);

/** Pre-launch waitlist: email + which plan they want. Replaces Stripe
 *  checkout until our own billing system is live. We manually upgrade
 *  users from this list via `scripts/admin-upgrade-user.ts`. */
export const waitlist = pgTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    plan: text("plan").notNull().default("pro"), // pro | team | enterprise
    company: text("company"),
    teamSize: text("team_size"),
    notes: text("notes"),
    locale: text("locale"),
    /** Set when an admin has reached out (manual upgrade). */
    contactedAt: timestamp("contacted_at", { withTimezone: true }),
    /** Set when the user has been upgraded successfully. */
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("waitlist_email_plan_idx").on(t.email, t.plan),
    planIdx: index("waitlist_plan_idx").on(t.plan),
    createdIdx: index("waitlist_created_idx").on(t.createdAt),
  }),
);

export const usageMetrics = pgTable(
  "usage_metrics",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // YYYY-MM
    aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
    exportsCount: integer("exports_count").notNull().default(0),
    storageBytes: bigint("storage_bytes", { mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userPeriodIdx: uniqueIndex("usage_user_period_idx").on(
      t.userId,
      t.period,
    ),
  }),
);

// ============================================================
//  Site analytics — page views (visitor counts)
// ============================================================

export const pageViews = pgTable(
  "page_views",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    /** Random UUID stored client-side in localStorage — anonymous device
     *  fingerprint so we can compute "unique visitors" without tracking
     *  IP / browser fingerprints. */
    visitorId: text("visitor_id").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    country: text("country"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pathIdx: index("page_views_path_idx").on(t.path),
    visitorIdx: index("page_views_visitor_idx").on(t.visitorId),
    createdIdx: index("page_views_created_idx").on(t.createdAt),
    userIdx: index("page_views_user_idx").on(t.userId),
  }),
);

// ============================================================
//  Payments — upgrade intents (manual + future gateway)
// ============================================================

export const paymentIntents = pgTable(
  "payment_intents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan").notNull(),
    billing: text("billing").notNull(), // monthly | yearly
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    country: text("country").notNull(),
    /** bank_transfer_az | card | pulpal | lemon | stripe | crypto | … */
    provider: text("provider").notNull(),
    status: text("status").notNull().default("pending"),
    reference: text("reference").notNull(),
    externalId: text("external_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referenceIdx: uniqueIndex("payment_intents_reference_idx").on(t.reference),
    userIdx: index("payment_intents_user_idx").on(t.userId),
    statusIdx: index("payment_intents_status_idx").on(t.status),
    createdIdx: index("payment_intents_created_idx").on(t.createdAt),
  }),
);

// ============================================================
//  Support inbox — contact form submissions
// ============================================================

export const supportRequests = pgTable(
  "support_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    country: text("country"),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("support_requests_status_idx").on(t.status),
    createdIdx: index("support_requests_created_idx").on(t.createdAt),
  }),
);

// ============================================================
//  Analytics — banner events (view / click / export / CTA)
// ============================================================

export const bannerEvents = pgTable(
  "banner_events",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    /** view | click | export | cta */
    kind: text("kind").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Truncated SHA-256 of (ip + secret) — for rate-limit, never raw IP. */
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tplIdx: index("banner_events_tpl_idx").on(t.templateId),
    kindIdx: index("banner_events_kind_idx").on(t.kind),
    createdIdx: index("banner_events_created_idx").on(t.createdAt),
    tplKindIdx: index("banner_events_tpl_kind_idx").on(t.templateId, t.kind),
  }),
);

// ============================================================
//  Social — template likes & comments
// ============================================================

/** A "heart" on a marketplace template. One row per (user, template) pair. */
export const templateLikes = pgTable(
  "template_likes",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqUserTpl: uniqueIndex("template_likes_user_tpl_idx").on(t.userId, t.templateId),
    tplIdx: index("template_likes_tpl_idx").on(t.templateId),
  }),
);

/** Top-level comment on a template detail page. Replies are out of scope —
 *  banner conversation is usually flat. */
export const templateComments = pgTable(
  "template_comments",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tplIdx: index("template_comments_tpl_idx").on(t.templateId),
    createdIdx: index("template_comments_created_idx").on(t.createdAt),
  }),
);

// ============================================================
//  User profile bio
// ============================================================

/** Soft profile extension to users — bio + handle that's safe to expose
 *  publicly under /u/[handle]. The base users table stays auth-shaped. */
export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    handle: text("handle"),
    bio: text("bio"),
    website: text("website"),
    twitter: text("twitter"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    handleIdx: uniqueIndex("user_profiles_handle_idx").on(t.handle),
  }),
);

// ============================================================
//  SAYT PLATFORMASI — hazır saytlar marketi + managed hosting
//  (Faza 1 — banner məhsulunu əvəz edən yeni model)
//
//  Memarlıq: hər müştəri saytı = 1 tenant. Bir kod bazası, host-based
//  routing ilə tenant müəyyən olunur (subdomen / custom domen). Məzmun
//  tenant-a bağlı JSONB + strukturlu sahələrdə saxlanır ki, həm hosted
//  instance, həm də export bundle (zip + SQL) verilə bilsin.
// ============================================================

/** Satılan hazır sayt şablonları — marketplace kataloqu.
 *  Köhnə banner `templates` cədvəlini funksional olaraq əvəz edir;
 *  buradakı qeydlər Konva sənədi yox, render olunan sayt şablonudur. */
export const siteTemplates = pgTable(
  "site_templates",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    /** "landing" | "multipage" */
    type: text("type").notNull().default("landing"),
    category: text("category").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    /** Canlı demo subdomeni — ziyarətçi önizləməsi (məs. "demo-klinika"). */
    previewSubdomain: text("preview_subdomain"),
    /** Qiymətlər qəpiklə (AZN). 100 AZN = 10000. */
    priceSetupAzn: integer("price_setup_azn").notNull().default(10000), // 100 AZN giriş
    priceMonthlyAzn: integer("price_monthly_azn").notNull().default(5000), // 50 AZN/ay
    /** Export (self-host) bir dəfəlik qiymət — 1000 AZN. */
    priceExportAzn: integer("price_export_azn").notNull().default(100000),
    supportsExport: boolean("supports_export").notNull().default(true),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("site_templates_slug_idx").on(t.slug),
    typeIdx: index("site_templates_type_idx").on(t.type),
    categoryIdx: index("site_templates_category_idx").on(t.category),
    publishedIdx: index("site_templates_published_idx").on(t.published),
  }),
);

/** Müştəri sayt instansiyası. Bir alış → bir tenant. Hosted halda
 *  subdomain/customDomain ilə host-based render olunur. */
export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteTemplateId: text("site_template_id")
      .notNull()
      .references(() => siteTemplates.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    /** "*.addvoxen.com" subdomeni — həmişə var, unikaldır. */
    subdomain: text("subdomain").notNull(),
    /** Müştərinin öz domeni (A/CNAME ilə). Vercel-ə əlavə olunur. */
    customDomain: text("custom_domain"),
    /** Vercel Domains API tərəfindən verilən id — auto-SSL idarəsi üçün. */
    vercelDomainId: text("vercel_domain_id"),
    /** none | pending | verified | error */
    domainStatus: text("domain_status").notNull().default("none"),
    /** pending | active | suspended | canceled */
    status: text("status").notNull().default("pending"),
    /** hosted | export */
    deliveryType: text("delivery_type").notNull().default("hosted"),
    /**
     * Set when this tenant is an auto-generated sales demo built for a lead
     * (status = "demo"). Null for every real customer site, so the two never
     * get confused in billing, listings or the customer's own panel.
     */
    leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    subdomainIdx: uniqueIndex("tenants_subdomain_idx").on(t.subdomain),
    customDomainIdx: uniqueIndex("tenants_custom_domain_idx").on(t.customDomain),
    ownerIdx: index("tenants_owner_idx").on(t.ownerId),
    statusIdx: index("tenants_status_idx").on(t.status),
    leadIdx: index("tenants_lead_idx").on(t.leadId),
  }),
);

/** Tenant-a görə redaktə olunan məzmun + tema. Müştəri öz admin panelindən
 *  (B-tipli admin) mətnləri, rəngləri, logonu, bölmələri dəyişir. */
export const tenantContent = pgTable(
  "tenant_content",
  {
    tenantId: text("tenant_id")
      .primaryKey()
      .references(() => tenants.id, { onDelete: "cascade" }),
    /** Bölmələr, mətnlər, şəkil URL-ləri — şablona uyğun struktur. */
    content: jsonb("content").notNull().$type<Record<string, unknown>>(),
    /** Tema: rənglər, şriftlər, logo, favicon. */
    theme: jsonb("theme").notNull().$type<{
      colors?: Record<string, string>;
      fonts?: { heading?: string; body?: string };
      logoUrl?: string;
      faviconUrl?: string;
    }>(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

/** Strukturlu inteqrasiya sahələri. TƏHLÜKƏSİZLİK: müştəri raw <script>
 *  yapışdıra BİLMƏZ — yalnız bu ID-lər. Render zamanı təhlükəsiz şəkildə
 *  GTM/GA/Pixel snippet-lərinə çevrilir. */
export const tenantIntegrations = pgTable(
  "tenant_integrations",
  {
    tenantId: text("tenant_id")
      .primaryKey()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ga4Id: text("ga4_id"), // G-XXXXXXX
    metaPixelId: text("meta_pixel_id"),
    gtmContainerId: text("gtm_container_id"), // GTM-XXXXXX
    googleVerification: text("google_verification"),
    metaVerification: text("meta_verification"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

/** Alış sifarişi + təsdiq axını.
 *  template seç → order (pending_payment) → ödəniş → paid →
 *  super-admin bildiriş → /admin/orders təsdiq → approved →
 *  (hosted: tenant aktiv | export: bundle hazırlanır). */
export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteTemplateId: text("site_template_id")
      .notNull()
      .references(() => siteTemplates.id, { onDelete: "restrict" }),
    /** Təsdiqdən sonra (hosted) provision olunan tenant. */
    tenantId: text("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    /** hosted | export */
    deliveryType: text("delivery_type").notNull().default("hosted"),
    setupAmountAzn: integer("setup_amount_azn").notNull().default(0),
    monthlyAmountAzn: integer("monthly_amount_azn").notNull().default(0),
    /**
     * pending_payment | paid | awaiting_approval | approved | rejected | refunded
     */
    status: text("status").notNull().default("pending_payment"),
    /** payment_intents.reference ilə əlaqə. */
    paymentRef: text("payment_ref"),
    approvedBy: text("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    buyerIdx: index("orders_buyer_idx").on(t.buyerId),
    statusIdx: index("orders_status_idx").on(t.status),
    tenantIdx: index("orders_tenant_idx").on(t.tenantId),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  }),
);

/** Aylıq abunə vəziyyəti (AZN, lokal recurring — Stripe-dan asılı deyil).
 *  Hər aktiv hosted tenant üçün bir qeyd. */
export const tenantSubscriptions = pgTable(
  "tenant_subscriptions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    /** active | past_due | canceled */
    status: text("status").notNull().default("active"),
    priceMonthlyAzn: integer("price_monthly_azn").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    lastPaymentAt: timestamp("last_payment_at", { withTimezone: true }),
    nextDueAt: timestamp("next_due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tenantIdx: index("tenant_subscriptions_tenant_idx").on(t.tenantId),
    statusIdx: index("tenant_subscriptions_status_idx").on(t.status),
  }),
);

/** Export (self-host) paketi. Export sifarişi təsdiqlənəndə yaranır:
 *  frontend+admin zip + tenant data SQL dump + install README. */
export const exportBundles = pgTable(
  "export_bundles",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    zipUrl: text("zip_url"),
    sqlDumpUrl: text("sql_dump_url"),
    /** building | ready | error */
    status: text("status").notNull().default("building"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    downloadCount: integer("download_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orderIdx: index("export_bundles_order_idx").on(t.orderId),
  }),
);

// ============================================================
//  Type helpers
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;

// Sayt platforması tipləri
export type SiteTemplate = typeof siteTemplates.$inferSelect;
export type NewSiteTemplate = typeof siteTemplates.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type TenantContent = typeof tenantContent.$inferSelect;
export type NewTenantContent = typeof tenantContent.$inferInsert;
export type TenantIntegrations = typeof tenantIntegrations.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type ExportBundle = typeof exportBundles.$inferSelect;

// ============================================================
// LEAD FINDER — business discovery, scoring, demos, outreach
// ============================================================

/**
 * Generic background job queue.
 *
 * Deliberately a database table rather than an external queue: the workload is
 * a handful of long-running searches per day, and a table gives us durable
 * state, progress reporting and crash recovery without another vendor. A cron
 * endpoint claims due jobs with SELECT … FOR UPDATE SKIP LOCKED, so several
 * concurrent cron invocations never pick up the same job.
 */
export const backgroundJobs = pgTable(
  "background_jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** lead_search | website_analysis | demo_build | outreach_send | imap_poll */
    type: text("type").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    /** queued | running | completed | failed | cancelled */
    status: text("status").notNull().default("queued"),
    /** 0–100, surfaced to the user as a progress bar. */
    progress: integer("progress").notNull().default(0),
    /** Human-readable current stage, e.g. "Analyzing websites". */
    step: text("step"),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),
    /** Lets a retry back off instead of hammering a failing source. */
    runAfter: timestamp("run_after", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** Set when a worker claims the job; used to reap stuck jobs. */
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    claimIdx: index("background_jobs_claim_idx").on(t.status, t.runAfter),
    userIdx: index("background_jobs_user_idx").on(t.userId),
    workspaceIdx: index("background_jobs_workspace_idx").on(t.workspaceId),
  }),
);

/** One "Start Lead Search" run: the filters, and the roll-up of what it found. */
export const leadSearches = pgTable(
  "lead_searches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    jobId: text("job_id").references(() => backgroundJobs.id, {
      onDelete: "set null",
    }),
    /** ISO-3166 alpha-2, e.g. "AZ". */
    country: text("country").notNull(),
    city: text("city").notNull(),
    /** Our internal niche key, e.g. "beauty_salon" — maps to a template category. */
    category: text("category").notNull(),
    maxLeads: integer("max_leads").notNull().default(100),
    /** Free-form extra filters so the UI can grow without a migration. */
    filters: jsonb("filters").$type<Record<string, unknown>>(),
    /** queued | running | completed | failed | cancelled */
    status: text("status").notNull().default("queued"),
    totalFound: integer("total_found").notNull().default(0),
    highCount: integer("high_count").notNull().default(0),
    mediumCount: integer("medium_count").notNull().default(0),
    lowCount: integer("low_count").notNull().default(0),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("lead_searches_user_idx").on(t.userId),
    workspaceIdx: index("lead_searches_workspace_idx").on(t.workspaceId),
    createdIdx: index("lead_searches_created_idx").on(t.createdAt),
  }),
);

/**
 * A discovered business.
 *
 * Scoped to a workspace, never to a search: the same business found by two
 * searches is one lead with one contact history. `dedupeKey` is what makes
 * that true — see lib/leads/dedupe.ts for how it is derived.
 */
export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** The search that first surfaced this business. */
    searchId: text("search_id").references(() => leadSearches.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),
    category: text("category"),
    country: text("country"),
    city: text("city"),
    address: text("address"),
    /** Stored ×1e6 as integers — no float drift, and cheap to index. */
    lat: integer("lat"),
    lng: integer("lng"),

    phone: text("phone"),
    email: text("email"),
    websiteUrl: text("website_url"),
    socials: jsonb("socials").$type<{
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      other?: string[];
    }>(),

    /** Which provider produced this row, and its id there (for re-fetch). */
    source: text("source").notNull(),
    sourceId: text("source_id"),
    /** Attribution string the provider's licence requires us to display. */
    sourceAttribution: text("source_attribution"),

    /** Normalised fingerprint; unique per workspace. */
    dedupeKey: text("dedupe_key").notNull(),

    score: integer("score").notNull().default(0),
    /** high | medium | low */
    band: text("band").notNull().default("low"),
    /** Why this scored what it did — shown verbatim in the UI. */
    scoreReasons: jsonb("score_reasons").$type<
      { rule: string; points: number; label: string }[]
    >(),

    /** new | contacted | replied | interested | not_interested | converted | archived | excluded */
    status: text("status").notNull().default("new"),
    contactedAt: timestamp("contacted_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    dedupeIdx: uniqueIndex("leads_workspace_dedupe_idx").on(
      t.workspaceId,
      t.dedupeKey,
    ),
    workspaceIdx: index("leads_workspace_idx").on(t.workspaceId),
    searchIdx: index("leads_search_idx").on(t.searchId),
    scoreIdx: index("leads_score_idx").on(t.workspaceId, t.score),
    statusIdx: index("leads_status_idx").on(t.workspaceId, t.status),
  }),
);

/** Result of fetching and inspecting a lead's website. One row per lead. */
export const leadAnalyses = pgTable("lead_analyses", {
  leadId: text("lead_id")
    .primaryKey()
    .references(() => leads.id, { onDelete: "cascade" }),
  hasWebsite: boolean("has_website").notNull().default(false),
  /** Did it actually respond? A dead domain is a strong buying signal. */
  reachable: boolean("reachable").notNull().default(false),
  httpStatus: integer("http_status"),
  /** Milliseconds to first byte — slow sites are an easy pitch. */
  responseMs: integer("response_ms"),
  isHttps: boolean("is_https"),
  hasViewportMeta: boolean("has_viewport_meta"),
  hasTitle: boolean("has_title"),
  hasDescription: boolean("has_description"),
  /** Rough page weight in bytes. */
  htmlBytes: integer("html_bytes"),
  /** Plain-language problems, ready to show the user. */
  issues: jsonb("issues").$type<string[]>(),
  screenshotUrl: text("screenshot_url"),
  error: text("error"),
  analyzedAt: timestamp("analyzed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Append-only audit of everything that happened to a lead. */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    /** discovered | analyzed | scored | demo_created | message_drafted |
     *  email_sent | email_failed | reply_received | status_changed | note */
    type: text("type").notNull(),
    /** Null when the system did it rather than a person. */
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    leadIdx: index("lead_events_lead_idx").on(t.leadId, t.createdAt),
  }),
);

/**
 * Opt-out list. Checked before any outreach is sent, and never deleted from —
 * an unsubscribe has to survive the lead being re-discovered by a later search.
 */
export const suppressionList = pgTable(
  "suppression_list",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** Lower-cased email, or a bare domain to suppress everyone there. */
    value: text("value").notNull(),
    /** email | domain */
    kind: text("kind").notNull().default("email"),
    /** unsubscribed | bounced | complained | manual */
    reason: text("reason").notNull().default("manual"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueIdx: uniqueIndex("suppression_workspace_value_idx").on(
      t.workspaceId,
      t.value,
    ),
  }),
);

/**
 * A drafted outreach message for one lead.
 *
 * Kept separate from the email that carries it: a message can be drafted,
 * edited and approved without ever being sent, and the same message may be
 * retried across several email attempts.
 */
export const outreachMessages = pgTable(
  "outreach_messages",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    leadId: text("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    /** Which of the generated variants this is (1-based), for A/B comparison. */
    variant: integer("variant").notNull().default(1),
    /** az | en | ru */
    locale: text("locale").notNull().default("az"),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    /** The demo link embedded in the body, if one was included. */
    demoUrl: text("demo_url"),
    /** draft | ready | sent | replied | interested | not_interested | converted */
    status: text("status").notNull().default("draft"),
    /** template | ai — how the copy was produced. */
    generator: text("generator").notNull().default("template"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    leadIdx: index("outreach_messages_lead_idx").on(t.leadId),
    workspaceIdx: index("outreach_messages_workspace_idx").on(t.workspaceId),
    statusIdx: index("outreach_messages_status_idx").on(t.workspaceId, t.status),
  }),
);

/**
 * Every email that left or arrived, in both directions.
 *
 * `messageId` is the RFC 5322 Message-ID and is unique — that is what makes
 * inbound polling idempotent, so re-reading the mailbox can never duplicate a
 * reply. `inReplyTo` / `references` are what thread a reply back to the
 * outbound message that provoked it.
 */
export const emailMessages = pgTable(
  "email_messages",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    leadId: text("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    outreachMessageId: text("outreach_message_id").references(
      () => outreachMessages.id,
      { onDelete: "set null" },
    ),
    /** outbound | inbound */
    direction: text("direction").notNull(),
    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address").notNull(),
    subject: text("subject"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    /** RFC Message-ID, including angle brackets. */
    messageId: text("message_id"),
    inReplyTo: text("in_reply_to"),
    references: text("references"),
    /** queued | sent | failed | bounced | received */
    status: text("status").notNull().default("queued"),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    messageIdIdx: uniqueIndex("email_messages_message_id_idx").on(t.messageId),
    leadIdx: index("email_messages_lead_idx").on(t.leadId, t.createdAt),
    workspaceIdx: index("email_messages_workspace_idx").on(t.workspaceId),
    threadIdx: index("email_messages_in_reply_to_idx").on(t.inReplyTo),
  }),
);

// Lead Finder tipləri
export type OutreachMessage = typeof outreachMessages.$inferSelect;
export type NewOutreachMessage = typeof outreachMessages.$inferInsert;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type NewEmailMessage = typeof emailMessages.$inferInsert;
export type BackgroundJob = typeof backgroundJobs.$inferSelect;
export type NewBackgroundJob = typeof backgroundJobs.$inferInsert;
export type LeadSearch = typeof leadSearches.$inferSelect;
export type NewLeadSearch = typeof leadSearches.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadAnalysis = typeof leadAnalyses.$inferSelect;
export type NewLeadAnalysis = typeof leadAnalyses.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type NewLeadEvent = typeof leadEvents.$inferInsert;
export type Suppression = typeof suppressionList.$inferSelect;
