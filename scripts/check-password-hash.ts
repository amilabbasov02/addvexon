import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query(
      `SELECT u.email, LEFT(a.password, 50) AS hash_prefix, LENGTH(a.password) AS hash_len
       FROM accounts a JOIN users u ON u.id = a.user_id
       WHERE a.provider_id = 'credential'
       LIMIT 5`,
    );
    console.log("Password storage check:");
    for (const row of r.rows) {
      console.log(`  ${row.email}`);
      console.log(`    hash:  ${row.hash_prefix}…  (${row.hash_len} chars)`);
    }
  } finally { await pool.end(); }
}
main();
