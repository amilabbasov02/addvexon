/**
 * Add a single Stitch banner to the Addvoxen marketplace.
 *
 *   npx tsx scripts/add-single-banner.ts <html-path> [name] [category]
 *
 * Steps:
 *   1. Read the HTML file
 *   2. Detect canvas size from "<!-- WxH ... -->" comment (or default 300x250)
 *   3. Render with headless Chrome at that viewport, screenshot to PNG
 *   4. Insert template row pointing at the new PNG (image-only document)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFile, mkdir, copyFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import puppeteer from "puppeteer";
import { templates } from "../src/db/schema";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
function lid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 7)}`;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const PREVIEW_DIR = resolve(process.cwd(), "public", "banner-previews");
const THUMB_DIR = resolve(process.cwd(), "public", "banner-thumbnails");

async function main() {
  const [, , htmlPath, nameArg, categoryArg] = process.argv;
  if (!htmlPath) {
    console.error("usage: npx tsx scripts/add-single-banner.ts <html-path> [name] [category]");
    process.exit(1);
  }
  const absHtml = resolve(htmlPath);
  const html = await readFile(absHtml, "utf8");

  // Detect canvas size from a comment like "<!-- 300x250 Medium Rectangle -->"
  const sizeMatch = html.match(/<!--\s*(\d+)\s*[xX×]\s*(\d+)\b/);
  const w = sizeMatch ? parseInt(sizeMatch[1]) : 300;
  const h = sizeMatch ? parseInt(sizeMatch[2]) : 250;

  // Friendly name: arg → filename stem
  const stem = basename(absHtml, ".html");
  const name = nameArg ?? stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const category = categoryArg ?? "Editorial";
  const slug = `${slugify(stem)}-${Math.random().toString(36).slice(2, 6)}`;

  console.log(`\n→ Importing "${name}"  ${w}×${h}  (${category})`);

  await mkdir(PREVIEW_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });

  // Copy the standalone HTML so puppeteer can render it from a local file://
  const previewPath = resolve(PREVIEW_DIR, `${slug}.html`);
  await copyFile(absHtml, previewPath);

  // Render → PNG
  const thumbPath = resolve(THUMB_DIR, `${slug}.png`);
  console.log("  · launching headless Chrome");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(previewPath).href, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });
    // Give Tailwind CDN + fonts a beat to settle
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: thumbPath as `${string}.png`,
      type: "png",
      clip: { x: 0, y: 0, width: w, height: h },
    });
    console.log(`  · screenshot saved → /banner-thumbnails/${slug}.png`);
  } finally {
    await browser.close();
  }

  // Insert DB row
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  try {
    await db.insert(templates).values({
      id: uid("tpl"),
      slug,
      name: `${name} · ${w}×${h}`,
      category,
      tagline: `${w}×${h} banner`,
      document: {
        canvasSize: { width: w, height: h },
        background: "#0e0e0e",
        layers: [
          {
            id: lid("artwork"),
            type: "image",
            name: "Banner artwork",
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            src: `/banner-thumbnails/${slug}.png`,
            width: w,
            height: h,
          },
        ],
      },
      tier: w * h > 200_000 ? "pro" : "free",
      published: true,
      listingStatus: "approved",
      priceCents: 0,
      downloads: 0,
      thumbnailUrl: `/banner-thumbnails/${slug}.png`,
    });
    console.log(`  ✓ inserted as official template "${slug}"`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
