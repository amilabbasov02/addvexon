import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query(
      "SELECT id, email, name, plan FROM users WHERE email = $1",
      ["admin@addvoxen.com"],
    );
    console.log(r.rows);
  } finally { await pool.end(); }
}
main();
