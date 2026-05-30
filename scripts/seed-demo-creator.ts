/**
 * Clone three official templates into "community" templates owned by the
 * Amil Abbasov demo account, so /u/{amilId} has populated content to test
 * the profile page against. Idempotent: re-running just refreshes the same
 * three demo rows.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const DEMO_USER_ID = "Xo0W6ySLWTziz8jI1me44AVJBGwTiyiB"; // Amil Abbasov
const SOURCE_SLUGS = [
  "banner-travel-1080x1080",
  "banner-fashion-1080x1080",
  "banner-fitness-1080x1080",
];

function uid() {
  return `tpl_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    for (const sourceSlug of SOURCE_SLUGS) {
      const src = await pool.query(
        `SELECT name, category, tagline, tier, document, thumbnail_url
         FROM templates WHERE slug = $1`,
        [sourceSlug],
      );
      if (src.rowCount === 0) {
        console.log(`  skip — no source ${sourceSlug}`);
        continue;
      }
      const cloneSlug = `demo-${sourceSlug}-by-amil`;
      const exists = await pool.query(
        `SELECT id FROM templates WHERE slug = $1`,
        [cloneSlug],
      );
      if (exists.rowCount && exists.rowCount > 0) {
        // Refresh document in place (in case the source got regenerated)
        await pool.query(
          `UPDATE templates SET name = $1, document = $2, thumbnail_url = $3
           WHERE slug = $4`,
          [
            `${src.rows[0].name} · Remix by Amil`,
            src.rows[0].document,
            src.rows[0].thumbnail_url,
            cloneSlug,
          ],
        );
        console.log(`  refreshed ${cloneSlug}`);
        continue;
      }
      const id = uid();
      await pool.query(
        `INSERT INTO templates
           (id, slug, name, category, tagline, tier, document, thumbnail_url,
            published, listing_status, price_cents, currency, sales_count,
            downloads, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, 'approved',
                 1500, 'USD', 0, 0, $9)`,
        [
          id,
          cloneSlug,
          `${src.rows[0].name} · Remix by Amil`,
          src.rows[0].category,
          src.rows[0].tagline,
          src.rows[0].tier,
          src.rows[0].document,
          src.rows[0].thumbnail_url,
          DEMO_USER_ID,
        ],
      );
      console.log(`  inserted ${cloneSlug} (community)`);
    }
    console.log(`\nDone — visit /u/${DEMO_USER_ID}`);
  } finally {
    await pool.end();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
