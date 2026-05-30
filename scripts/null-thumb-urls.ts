/**
 * NULL out thumbnail_url on all banner-* templates so the marketplace card
 * falls through to DocumentThumbnail's inline-SVG layer rendering — no /public
 * files, no API routes, no Next.js rebuild required.
 *
 * Each banner already has a full editable layer document (image + rects +
 * text) — the SVG renderer in LayerThumb composes it on the fly.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { templates } from "../src/db/schema";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  try {
    const r = await db.execute(sql`
      UPDATE templates
      SET thumbnail_url = NULL
      WHERE slug LIKE 'banner-%'
    `);
    console.log(`· nulled thumbnail_url on ${r.rowCount} banner-* templates`);
    console.log(`  marketplace now renders them as inline SVG from layers`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
