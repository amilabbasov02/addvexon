/**
 * Quick connectivity check. Run with: pnpm db:ping
 * Prints the Postgres version + current database name. Fails fast with a
 * helpful message if the env / install / password is wrong.
 */
import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

// Next.js reads .env.local automatically; standalone scripts do not.
loadEnv({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL is not set. Check .env.local");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const versionRes = await pool.query<{ version: string }>(
      "SELECT version() AS version",
    );
    const dbRes = await pool.query<{ db: string }>(
      "SELECT current_database() AS db",
    );
    console.log(`✓ Connected to: ${dbRes.rows[0].db}`);
    console.log(`✓ ${versionRes.rows[0].version.split(",")[0]}`);
    await pool.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✗ Connection failed: ${msg}`);
    console.error("\nCommon fixes:");
    console.error("  · PostgreSQL service running?  (Windows: services.msc → postgresql-x64-17)");
    console.error("  · Password matches DATABASE_URL in .env.local?");
    console.error("  · Database 'addvoxen' exists?  (create it with pgAdmin or scripts/db-init.sql)");
    process.exit(1);
  }
}

main();
