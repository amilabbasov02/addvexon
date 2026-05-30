/**
 * Switch all banner-* templates from PNG <img> thumbnails to HTML iframe
 * thumbnails — DocumentThumbnail uses iframe for any URL ending in `.html`.
 *
 * Uses the new dynamic `/api/preview/{slug}.html` route so changes don't
 * require a Next.js rebuild after generation.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { templates } from "../src/db/schema";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  try {
    const r = await db.execute(sql`
      UPDATE templates
      SET thumbnail_url = '/api/preview/' || slug || '.html'
      WHERE slug LIKE 'banner-%'
    `);
    console.log(`· updated ${r.rowCount} template rows to iframe-style thumbs`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
