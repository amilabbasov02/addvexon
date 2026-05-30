import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const u = await pool.query(
      "SELECT id, email, name FROM users WHERE email IN ('admin@advexa.io', 'admin@addvoxen.com')",
    );
    console.log("users:", u.rows);
    const adminId = u.rows[0]?.id;
    if (adminId) {
      const a = await pool.query(
        "SELECT provider_id, account_id, scope FROM accounts WHERE user_id = $1",
        [adminId],
      );
      console.log("accounts:", a.rows);
    }
  } finally {
    await pool.end();
  }
}
main();
