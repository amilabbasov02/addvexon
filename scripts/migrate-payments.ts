/**
 * Payment intents — single row per "I want to upgrade" event. The cleanest
 * way to support both manual bank-transfer flows (Azerbaijan reality today)
 * AND future Lemon Squeezy / Pulpal integrations behind one model.
 *
 *   status: pending  → admin / webhook hasn't confirmed
 *           paid     → user got upgraded (subscriptions row written too)
 *           failed   → declined / abandoned
 *           cancelled
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = `
    CREATE TABLE IF NOT EXISTS payment_intents (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan          TEXT NOT NULL,
      billing       TEXT NOT NULL,
      amount_cents  INTEGER NOT NULL,
      currency      TEXT NOT NULL,
      country       TEXT NOT NULL,
      provider      TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      reference     TEXT NOT NULL,
      external_id   TEXT,
      paid_at       TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS payment_intents_reference_idx ON payment_intents(reference);
    CREATE INDEX IF NOT EXISTS payment_intents_user_idx ON payment_intents(user_id);
    CREATE INDEX IF NOT EXISTS payment_intents_status_idx ON payment_intents(status);
    CREATE INDEX IF NOT EXISTS payment_intents_created_idx ON payment_intents(created_at);
  `;
  try {
    await pool.query(sql);
    console.log("· payment_intents table ready");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
