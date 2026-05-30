/**
 * Create the new social + profile tables in-place.
 *
 *   template_likes      — heart on a template
 *   template_comments   — flat comments on a template
 *   user_profiles       — public-facing user bio / handle / links
 *
 * Idempotent: uses CREATE TABLE IF NOT EXISTS.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = `
    CREATE TABLE IF NOT EXISTS template_likes (
      id          TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS template_likes_user_tpl_idx ON template_likes(user_id, template_id);
    CREATE INDEX IF NOT EXISTS template_likes_tpl_idx ON template_likes(template_id);

    CREATE TABLE IF NOT EXISTS template_comments (
      id          TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS template_comments_tpl_idx ON template_comments(template_id);
    CREATE INDEX IF NOT EXISTS template_comments_created_idx ON template_comments(created_at);

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      handle     TEXT,
      bio        TEXT,
      website    TEXT,
      twitter    TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_handle_idx ON user_profiles(handle);
  `;
  try {
    await pool.query(sql);
    console.log("· created template_likes, template_comments, user_profiles");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
