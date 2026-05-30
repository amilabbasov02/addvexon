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
