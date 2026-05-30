/**
 * One-shot migration from the local Postgres dump → Neon.
 *
 * Strategy: connect to BOTH databases with `pg`, read schema-less and
 * copy every row over via parameterised inserts. Slow but predictable
 * and works without pg_dump on Windows.
 *
 *   LOCAL_URL  — your old localhost connection string
 *   NEON_URL   — the Neon connection string
 *
 * Tables migrated in dependency order so FKs don't break.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const LOCAL_URL =
  process.env.LOCAL_DATABASE_URL ??
  "postgresql://postgres:advexa_dev_2026@localhost:5432/advexa";
const NEON_URL = process.argv[2] ?? process.env.NEON_DATABASE_URL ?? "";

if (!NEON_URL) {
  console.error("Usage: npx tsx scripts/migrate-to-neon.ts '<neon connection string>'");
  process.exit(1);
}

const TABLES_IN_ORDER = [
  "users",
  "user_profiles",
  "sessions",
  "accounts",
  "verifications",
  "workspaces",
  "workspace_members",
  "documents",
  "templates",
  "template_likes",
  "template_comments",
  "purchases",
  "subscriptions",
  "ad_campaigns",
  "ad_analytics",
  "ai_jobs",
  "assets",
  "usage_metrics",
  "waitlist",
  "banner_events",
  "payment_intents",
  "support_requests",
  "page_views",
];

async function ensureSchema(neon: Pool) {
  // Run all the migrations the app has issued (idempotent CREATE IF NOT EXISTS).
  // We reuse the same SQL the per-feature migrate scripts use.
  const sql = `
    -- Better-Auth core
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      name text,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      plan text NOT NULL DEFAULT 'free',
      locale text NOT NULL DEFAULT 'en',
      stripe_customer_id text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users(stripe_customer_id);

    CREATE TABLE IF NOT EXISTS sessions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token text NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      ip_address text,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS accounts (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id text NOT NULL,
      provider_id text NOT NULL,
      access_token text,
      refresh_token text,
      id_token text,
      access_token_expires_at timestamptz,
      refresh_token_expires_at timestamptz,
      scope text,
      password text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts(user_id);

    CREATE TABLE IF NOT EXISTS verifications (
      id text PRIMARY KEY,
      identifier text NOT NULL,
      value text NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS verifications_identifier_idx ON verifications(identifier);

    -- App tables
    CREATE TABLE IF NOT EXISTS workspaces (
      id text PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      brand_kit jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id text PRIMARY KEY,
      workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role text NOT NULL DEFAULT 'editor',
      created_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE (workspace_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id text PRIMARY KEY,
      workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title text NOT NULL DEFAULT 'Untitled',
      canvas_size jsonb NOT NULL,
      background text NOT NULL DEFAULT '#ffffff',
      layers jsonb NOT NULL DEFAULT '[]'::jsonb,
      thumbnail_url text,
      created_by text REFERENCES users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS templates (
      id text PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      category text NOT NULL,
      tagline text,
      tier text NOT NULL DEFAULT 'free',
      document jsonb NOT NULL,
      thumbnail_url text,
      created_by text REFERENCES users(id) ON DELETE SET NULL,
      published boolean NOT NULL DEFAULT false,
      downloads integer NOT NULL DEFAULT 0,
      listing_status text,
      price_cents integer NOT NULL DEFAULT 0,
      currency text NOT NULL DEFAULT 'USD',
      sales_count integer NOT NULL DEFAULT 0,
      revenue_cents integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS templates_published_idx ON templates(published);
    CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      handle text,
      bio text,
      website text,
      twitter text,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_handle_idx ON user_profiles(handle);

    CREATE TABLE IF NOT EXISTS template_likes (
      id text PRIMARY KEY,
      template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS template_likes_user_tpl_idx ON template_likes(user_id, template_id);

    CREATE TABLE IF NOT EXISTS template_comments (
      id text PRIMARY KEY,
      template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS template_comments_tpl_idx ON template_comments(template_id);

    CREATE TABLE IF NOT EXISTS purchases (
      id text PRIMARY KEY,
      buyer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      creator_id text REFERENCES users(id) ON DELETE SET NULL,
      paid_cents integer NOT NULL DEFAULT 0,
      currency text NOT NULL DEFAULT 'USD',
      platform_fee_cents integer NOT NULL DEFAULT 0,
      creator_payout_cents integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'completed',
      created_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE (buyer_id, template_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id text,
      stripe_customer_id text,
      plan text NOT NULL,
      status text NOT NULL DEFAULT 'active',
      current_period_end timestamptz,
      cancel_at_period_end boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document_id text NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      brief jsonb NOT NULL,
      platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
      total_budget_cents integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ad_analytics (
      id text PRIMARY KEY,
      campaign_id text NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
      platform text NOT NULL,
      day date NOT NULL,
      impressions integer NOT NULL DEFAULT 0,
      clicks integer NOT NULL DEFAULT 0,
      conversions integer NOT NULL DEFAULT 0,
      spend_cents integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_jobs (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'queued',
      cost_credits integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS assets (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url text NOT NULL,
      kind text NOT NULL,
      size_bytes integer NOT NULL DEFAULT 0,
      meta jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS usage_metrics (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period text NOT NULL,
      ai_credits_used integer NOT NULL DEFAULT 0,
      exports_count integer NOT NULL DEFAULT 0,
      storage_bytes bigint NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, period)
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id text PRIMARY KEY,
      email text NOT NULL,
      plan text,
      reason text,
      contacted_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS banner_events (
      id text PRIMARY KEY,
      template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      kind text NOT NULL,
      user_id text REFERENCES users(id) ON DELETE SET NULL,
      ip_hash text,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_intents (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan text NOT NULL,
      billing text NOT NULL,
      amount_cents integer NOT NULL,
      currency text NOT NULL,
      country text NOT NULL,
      provider text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      reference text NOT NULL UNIQUE,
      external_id text,
      paid_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS support_requests (
      id text PRIMARY KEY,
      user_id text REFERENCES users(id) ON DELETE SET NULL,
      name text NOT NULL,
      email text NOT NULL,
      subject text NOT NULL,
      body text NOT NULL,
      country text,
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id text PRIMARY KEY,
      path text NOT NULL,
      visitor_id text NOT NULL,
      user_id text REFERENCES users(id) ON DELETE SET NULL,
      country text,
      referrer text,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path);
    CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views(visitor_id);
    CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views(created_at);
  `;
  await neon.query(sql);
  console.log("· Neon schema ready");
}

async function copyTable(local: Pool, neon: Pool, table: string) {
  // 1. Intersect local + neon columns so a stray legacy column on either
  //    side doesn't blow up the migration.
  const localCols = await local.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table],
  );
  if (localCols.rowCount === 0) {
    console.log(`  - ${table}: not present locally, skip`);
    return;
  }
  const neonCols = await neon.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  const neonSet = new Set(neonCols.rows.map((c) => c.column_name));
  const cols = localCols.rows
    .map((c) => c.column_name)
    .filter((c) => neonSet.has(c));
  if (cols.length === 0) {
    console.log(`  - ${table}: no shared columns, skip`);
    return;
  }
  const rows = await local.query(`SELECT ${cols.map((c) => `"${c}"`).join(", ")} FROM ${table}`);
  if (rows.rowCount === 0) {
    console.log(`  - ${table}: 0 rows`);
    return;
  }

  // 2. Bulk insert into neon, replacing existing rows on conflict so the
  //    script is re-runnable.
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const conflict = await neon.query<{ a: string }>(
    `SELECT pg_get_constraintdef(con.oid) AS def
     FROM pg_constraint con
     JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname = $1 AND con.contype = 'p'`,
    [table],
  );
  const conflictDef = conflict.rows[0]?.def ?? null;
  // primary key column name(s)
  const pk = conflictDef
    ? conflictDef.replace(/^PRIMARY KEY \(/, "").replace(/\)$/, "")
    : null;

  // Find jsonb columns on the Neon side so we can re-stringify them — pg
  // ships objects to text columns as "[object Object]" and JSON-strings to
  // jsonb columns as double-encoded blobs. Round-trip via JSON.stringify
  // when the destination is jsonb / json.
  const jsonColsRes = await neon.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
       AND data_type IN ('jsonb', 'json')`,
    [table],
  );
  const jsonCols = new Set(jsonColsRes.rows.map((r) => r.column_name));

  let inserted = 0;
  let skipped = 0;
  for (const row of rows.rows) {
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = cols.map((c) => {
      const v = row[c];
      if (v != null && jsonCols.has(c) && typeof v === "object") {
        return JSON.stringify(v);
      }
      return v;
    });
    const onConflict = pk
      ? `ON CONFLICT (${pk}) DO UPDATE SET ${cols
          .filter((c) => !pk.includes(c))
          .map((c) => `"${c}" = EXCLUDED."${c}"`)
          .join(", ")}`
      : "";
    try {
      await neon.query(
        `INSERT INTO ${table} (${colList}) VALUES (${placeholders}) ${onConflict}`,
        values,
      );
      inserted++;
    } catch (err) {
      // Skip legacy / orphan rows that violate FK or NOT NULL constraints
      // — these were valid in dev but the production schema is tighter.
      const code = (err as { code?: string }).code;
      if (code === "23502" || code === "23503" || code === "23505") {
        skipped++;
      } else {
        throw err;
      }
    }
  }
  const tail = skipped > 0 ? ` (${skipped} skipped)` : "";
  console.log(`  - ${table}: ${inserted} rows${tail}`);
}

async function main() {
  console.log("→ Connecting…");
  const local = new Pool({ connectionString: LOCAL_URL });
  const neon = new Pool({ connectionString: NEON_URL });
  try {
    await ensureSchema(neon);
    console.log("\n→ Copying data:");
    for (const table of TABLES_IN_ORDER) {
      await copyTable(local, neon, table);
    }
    console.log("\n✓ Migration complete.");
  } finally {
    await local.end();
    await neon.end();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
