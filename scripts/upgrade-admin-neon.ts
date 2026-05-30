import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON =
  process.argv[2] ??
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "";

if (!NEON) {
  console.error("Usage: npx tsx scripts/upgrade-admin-neon.ts '<connection string>'");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: NEON });
  try {
    const r = await pool.query(
      "UPDATE users SET plan = 'enterprise' WHERE email = $1 RETURNING email, plan",
      ["admin@addvoxen.com"],
    );
    console.log("Admin upgraded:", r.rows);
  } finally {
    await pool.end();
  }
}
main();
