import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON = process.argv[2] ?? process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

async function main() {
  const pool = new Pool({ connectionString: NEON });
  try {
    // Anyone who signed in on production without workspace?
    const r = await pool.query(`
      SELECT u.id, u.email, u.created_at,
        (SELECT COUNT(*) FROM workspace_members wm WHERE wm.user_id = u.id)::int AS ws_count,
        (SELECT MAX(created_at) FROM sessions s WHERE s.user_id = u.id) AS last_session
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 15
    `);
    console.log("Recent users + workspace status:");
    console.table(r.rows);

    // Total counts
    const c = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS users,
        (SELECT COUNT(*) FROM workspaces)::int AS workspaces,
        (SELECT COUNT(*) FROM workspace_members)::int AS members,
        (SELECT COUNT(*) FROM documents)::int AS documents
    `);
    console.log("\nTotal counts:");
    console.table(c.rows[0]);
  } finally { await pool.end(); }
}
main();
