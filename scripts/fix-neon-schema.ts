/**
 * One-off patches to the Neon schema for columns we missed in the initial
 * migrate-to-neon.ts run. Run again whenever the local schema drifts.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON =
  process.argv[2] ??
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "";

if (!NEON) {
  console.error("Usage: npx tsx scripts/fix-neon-schema.ts '<neon url>'");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: NEON });
  const patches = [
    // documents.template_id — needed by the editor save path
    `ALTER TABLE documents ADD COLUMN IF NOT EXISTS template_id text REFERENCES templates(id) ON DELETE SET NULL`,
    `CREATE INDEX IF NOT EXISTS documents_template_idx ON documents(template_id)`,
    // Also check anything else commonly missed
    `ALTER TABLE templates ADD COLUMN IF NOT EXISTS listing_status text`,
    `ALTER TABLE templates ADD COLUMN IF NOT EXISTS revenue_cents integer NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text`,
  ];
  try {
    for (const sql of patches) {
      console.log(`· ${sql.split(" ").slice(0, 6).join(" ")}…`);
      await pool.query(sql);
    }
    console.log("\n✓ Neon schema patched.");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
