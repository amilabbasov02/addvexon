import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON =
  process.argv[2] ??
  "postgresql://neondb_owner:npg_3oE9IVOTHzZf@ep-lively-snow-apnrcrbi-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const pool = new Pool({ connectionString: NEON });
  const patches = [
    // documents.is_public — Drizzle schema declares it but the initial Neon
    // migration missed it. Causes INSERT INTO documents to 500 on Vercel.
    `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false`,
    // Same defensive pass for any other potentially-missing flags
    `ALTER TABLE documents ALTER COLUMN created_by SET NOT NULL`,
  ];
  try {
    for (const sql of patches) {
      console.log(`· ${sql.split(" ").slice(0, 6).join(" ")}…`);
      try {
        await pool.query(sql);
      } catch (e) {
        // SET NOT NULL fails if there are existing rows with NULL — log + continue
        console.log(`  (skip: ${(e as { message?: string }).message?.split("\n")[0]})`);
      }
    }
    console.log("\n✓ documents table patched.");
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
