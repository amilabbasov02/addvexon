/**
 * Yalnız YENİ sayt-platforması cədvəllərini Neon-a əlavə edir (IF NOT EXISTS).
 * Mövcud (auth/banner) cədvəllərə TOXUNMUR — drizzle-kit push-un interaktiv
 * column-conflict sualından qaçmaq üçün. Run: npx tsx scripts/neon-add-tables.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS site_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL DEFAULT 'landing',
  category text NOT NULL,
  tagline text,
  description text,
  thumbnail_url text,
  preview_subdomain text,
  price_setup_azn integer NOT NULL DEFAULT 10000,
  price_monthly_azn integer NOT NULL DEFAULT 5000,
  price_export_azn integer NOT NULL DEFAULT 100000,
  supports_export boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS site_templates_slug_idx ON site_templates (slug);
CREATE INDEX IF NOT EXISTS site_templates_type_idx ON site_templates (type);
CREATE INDEX IF NOT EXISTS site_templates_category_idx ON site_templates (category);
CREATE INDEX IF NOT EXISTS site_templates_published_idx ON site_templates (published);

CREATE TABLE IF NOT EXISTS tenants (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_template_id text NOT NULL REFERENCES site_templates(id) ON DELETE RESTRICT,
  name text NOT NULL,
  subdomain text NOT NULL,
  custom_domain text,
  vercel_domain_id text,
  domain_status text NOT NULL DEFAULT 'none',
  status text NOT NULL DEFAULT 'pending',
  delivery_type text NOT NULL DEFAULT 'hosted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_subdomain_idx ON tenants (subdomain);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_custom_domain_idx ON tenants (custom_domain);
CREATE INDEX IF NOT EXISTS tenants_owner_idx ON tenants (owner_id);
CREATE INDEX IF NOT EXISTS tenants_status_idx ON tenants (status);

CREATE TABLE IF NOT EXISTS tenant_content (
  tenant_id text PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  theme jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_integrations (
  tenant_id text PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  ga4_id text,
  meta_pixel_id text,
  gtm_container_id text,
  google_verification text,
  meta_verification text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  buyer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_template_id text NOT NULL REFERENCES site_templates(id) ON DELETE RESTRICT,
  tenant_id text REFERENCES tenants(id) ON DELETE SET NULL,
  delivery_type text NOT NULL DEFAULT 'hosted',
  setup_amount_azn integer NOT NULL DEFAULT 0,
  monthly_amount_azn integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_payment',
  payment_ref text,
  approved_by text REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_tenant_idx ON orders (tenant_id);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  price_monthly_azn integer NOT NULL,
  current_period_end timestamptz,
  last_payment_at timestamptz,
  next_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenant_subscriptions_tenant_idx ON tenant_subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_subscriptions_status_idx ON tenant_subscriptions (status);

CREATE TABLE IF NOT EXISTS export_bundles (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  zip_url text,
  sql_dump_url text,
  status text NOT NULL DEFAULT 'building',
  expires_at timestamptz,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS export_bundles_order_idx ON export_bundles (order_id);
`;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(SQL);
  const r = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN
     ('site_templates','tenants','tenant_content','tenant_integrations','orders','tenant_subscriptions','export_bundles')
     ORDER BY table_name`,
  );
  console.log("✓ Neon-da yeni cədvəllər:", r.rows.map((x) => x.table_name).join(", "));
  await pool.end();
}
main().catch((e) => { console.error("XƏTA:", e.message); process.exit(1); });
