import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = `
    CREATE TABLE IF NOT EXISTS page_views (
      id          TEXT PRIMARY KEY,
      path        TEXT NOT NULL,
      visitor_id  TEXT NOT NULL,        -- anonymous device fingerprint (localStorage uuid)
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      country     TEXT,
      referrer    TEXT,
      user_agent  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path);
    CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views(visitor_id);
    CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS page_views_user_idx ON page_views(user_id);
  `;
  try {
    await pool.query(sql);
    console.log("· page_views table ready");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
