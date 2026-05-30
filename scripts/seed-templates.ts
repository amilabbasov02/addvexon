/**
 * Seed the templates table from the curated catalogue in
 * src/components/editor/templates.ts. Idempotent — skips templates that
 * already exist (matched by slug).
 *
 * Run with:  npx tsx scripts/seed-templates.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { templates } from "../src/db/schema";
import { TEMPLATES } from "../src/components/editor/templates";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { templates } });

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

async function main() {
  let inserted = 0;
  let skipped = 0;
  for (const t of TEMPLATES) {
    const existing = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.slug, t.id))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      console.log(`· skipped ${t.id} (already exists)`);
      continue;
    }

    // First catalogue is free; you can mark some pro later via SQL or schema.
    const tier =
      ["cyber-flow", "story-promo", "luxe-matte", "web-leaderboard"].includes(
        t.id,
      )
        ? "pro"
        : "free";

    await db.insert(templates).values({
      id: uid("tpl"),
      slug: t.id,
      name: t.name,
      category: t.category,
      tagline: t.tagline,
      document: t.document,
      tier,
      published: true,
      downloads: 0,
    });
    inserted++;
    console.log(`✓ inserted ${t.id} (${tier})`);
  }
  console.log(`\nDone. Inserted: ${inserted}, skipped: ${skipped}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
