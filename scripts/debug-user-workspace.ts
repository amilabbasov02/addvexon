import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON = process.argv[2] ?? process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
if (!NEON) { console.error("provide neon URL"); process.exit(1); }

async function main() {
  const pool = new Pool({ connectionString: NEON });
  try {
    const r = await pool.query(`
      SELECT u.id, u.email, u.name, u.plan,
        (SELECT COUNT(*) FROM workspace_members wm WHERE wm.user_id = u.id)::int AS ws_count,
        (SELECT COUNT(*) FROM documents d
          JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
          WHERE wm.user_id = u.id)::int AS docs
      FROM users u
      ORDER BY u.created_at
    `);
    console.log("Users + workspaces in Neon:");
    console.table(r.rows);
  } finally { await pool.end(); }
}
main();
