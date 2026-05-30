/**
 * Wipe all `banner-*` templates and their associated HTML/PNG files.
 * Used to clean slate before regenerating templates from scratch.
 *
 *   npx tsx scripts/wipe-banners.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { like } from "drizzle-orm";
import { templates } from "../src/db/schema";

const ROOT = process.cwd();
const PREVIEW_DIR = resolve(ROOT, "public", "banner-previews");
const THUMB_DIR = resolve(ROOT, "public", "banner-thumbnails");
const BATCH_DIR = resolve(ROOT, "stitch-batches", "single");

async function wipeDir(dir: string, predicate: (f: string) => boolean) {
  try {
    const files = await readdir(dir);
    let n = 0;
    for (const f of files) {
      if (!predicate(f)) continue;
      await rm(resolve(dir, f), { force: true });
      n++;
    }
    console.log(`· removed ${n} files from ${dir}`);
  } catch {
    /* dir absent — fine */
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  try {
    const deleted = await db
      .delete(templates)
      .where(like(templates.slug, "banner-%"))
      .returning({ slug: templates.slug });
    console.log(`· deleted ${deleted.length} template rows`);
  } finally {
    await pool.end();
  }

  await wipeDir(PREVIEW_DIR, (f) => f.startsWith("banner-"));
  await wipeDir(THUMB_DIR, (f) => f.startsWith("banner-"));
  await wipeDir(BATCH_DIR, (f) => f.startsWith("banner-"));
  console.log("\n• clean slate.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
