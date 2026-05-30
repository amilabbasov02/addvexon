import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const NEON =
  process.argv[2] ??
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "";

if (!NEON) {
  console.error(
    "Usage: npx tsx scripts/verify-neon.ts '<connection string>'\n" +
      "  or set NEON_DATABASE_URL in .env.local",
  );
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: NEON });
  try {
    const r = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int            AS users,
        (SELECT COUNT(*) FROM templates)::int        AS templates,
        (SELECT COUNT(*) FROM documents)::int        AS documents,
        (SELECT COUNT(*) FROM payment_intents)::int  AS intents,
        (SELECT COUNT(*) FROM banner_events)::int    AS events,
        (SELECT COUNT(*) FROM page_views)::int       AS page_views,
        (SELECT COUNT(*) FROM user_profiles)::int    AS profiles
    `);
    console.log("\n✓ Neon data count:");
    console.table(r.rows[0]);
    console.log("\nSample template names:");
    const t = await pool.query(`SELECT slug, name FROM templates ORDER BY name LIMIT 5`);
    for (const row of t.rows) console.log(`  ${row.slug.padEnd(35)} ${row.name}`);
  } finally {
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
