import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON =
  process.argv[2] ??
  "postgresql://neondb_owner:npg_3oE9IVOTHzZf@ep-lively-snow-apnrcrbi-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
