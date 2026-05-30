import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = `
    CREATE TABLE IF NOT EXISTS support_requests (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      subject     TEXT NOT NULL,
      body        TEXT NOT NULL,
      country     TEXT,
      status      TEXT NOT NULL DEFAULT 'open',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS support_requests_status_idx ON support_requests(status);
    CREATE INDEX IF NOT EXISTS support_requests_created_idx ON support_requests(created_at);
  `;
  try {
    await pool.query(sql);
    console.log("· support_requests table ready");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
