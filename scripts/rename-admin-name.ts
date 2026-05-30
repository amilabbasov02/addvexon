import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query(
      "UPDATE users SET name = 'Addvoxen Admin' WHERE email = 'admin@addvoxen.com' RETURNING id, email, name",
    );
    console.log("updated:", r.rows);
  } finally {
    await pool.end();
  }
}
main();
