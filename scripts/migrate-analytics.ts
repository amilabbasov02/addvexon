/**
 * Banner analytics — single events table that captures both views and
 * clicks for marketplace templates. Aggregated on read in the analytics
 * page rather than materialised, which keeps writes cheap and makes adding
 * new event types painless.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = `
    CREATE TABLE IF NOT EXISTS banner_events (
      id          TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      kind        TEXT NOT NULL,   -- 'view' | 'click' | 'export' | 'cta'
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      ip_hash     TEXT,            -- truncated SHA-256 for rate-control, never raw IP
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS banner_events_tpl_idx ON banner_events(template_id);
    CREATE INDEX IF NOT EXISTS banner_events_kind_idx ON banner_events(kind);
    CREATE INDEX IF NOT EXISTS banner_events_created_idx ON banner_events(created_at);
    CREATE INDEX IF NOT EXISTS banner_events_tpl_kind_idx ON banner_events(template_id, kind);
  `;
  try {
    await pool.query(sql);
    console.log("· banner_events table ready");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
