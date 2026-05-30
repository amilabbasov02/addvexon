import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query(
      `SELECT u.id, u.email, u.name, u.plan,
              (SELECT COUNT(*) FROM templates t WHERE t.created_by = u.id AND t.published = TRUE)::int AS tpl_count
       FROM users u
       ORDER BY u.created_at DESC
       LIMIT 12`,
    );
    console.log("\nUser profile URLs to test:\n");
    for (const u of r.rows) {
      console.log(`  /u/${u.id}`);
      console.log(`    ${u.email}  (${u.name ?? "no name"})`);
      console.log(`    plan=${u.plan}  published_templates=${u.tpl_count}\n`);
    }
  } finally { await pool.end(); }
}
main();
