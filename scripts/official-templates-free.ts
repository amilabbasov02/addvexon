/**
 * Make every Addvoxen-curated (official) template free, regardless of tier:
 *   - priceCents = 0
 *   - tier       = "free"
 *
 * Community templates (created_by IS NOT NULL) keep their pricing — those
 * are still sold by their creators.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query(`
      UPDATE templates
      SET price_cents = 0, tier = 'free'
      WHERE created_by IS NULL
      RETURNING slug
    `);
    console.log(`· ${r.rowCount} official templates now free`);
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
