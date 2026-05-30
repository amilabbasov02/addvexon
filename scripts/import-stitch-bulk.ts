/**
 * Bulk-import the 44 Stitch banners listed in
 * `stitch-batches/single/screens-index.json` into Addvoxen as official
 * templates. For each banner:
 *
 *   1. Read title → parse "Banner N: NAME (WxH)"
 *   2. Download the HTML from the Stitch downloadUrl
 *   3. Save to `stitch-batches/single/banner-XX-name.html`
 *   4. Render with headless Chrome at WxH viewport, screenshot to PNG
 *   5. Insert image-only template row pointing at the PNG
 *
 * One Chromium instance is reused across all banners to keep this fast.
 *
 * Usage:  npx tsx scripts/import-stitch-bulk.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { like } from "drizzle-orm";
import puppeteer from "puppeteer";
import { templates } from "../src/db/schema";

const PROJECT_ROOT = process.cwd();
const INDEX_PATH = resolve(PROJECT_ROOT, "stitch-batches", "single", "screens-index.json");
const HTML_DIR = resolve(PROJECT_ROOT, "stitch-batches", "single");
const PREVIEW_DIR = resolve(PROJECT_ROOT, "public", "banner-previews");
const THUMB_DIR = resolve(PROJECT_ROOT, "public", "banner-thumbnails");

type Screen = { title: string; htmlUrl: string };

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

// Map "Banner N: Theme (WxH)" → { num, themeName, w, h }
function parseTitle(title: string) {
  const m = title.match(/Banner\s+(\d+):\s*(.+?)\s*\((\d+)\s*[xX×]\s*(\d+)\)/i);
  if (!m) throw new Error(`Cannot parse title: ${title}`);
  return {
    num: parseInt(m[1]),
    themeName: m[2].trim(),
    w: parseInt(m[3]),
    h: parseInt(m[4]),
  };
}

// Crude theme → marketplace category mapping
function categoryFor(theme: string): string {
  const t = theme.toLowerCase();
  if (/(ai|saas|automation|prediction|code|intel|data|smart home|cyber|vpn)/.test(t)) return "AI & SaaS";
  if (/(fintech|crypto)/.test(t)) return "Fintech";
  if (/(fashion|essentials|luxury|furniture)/.test(t)) return "Retail";
  if (/(gaming|adrenaline)/.test(t)) return "Gaming";
  if (/(streaming|news|event|course|education)/.test(t)) return "Media & Edu";
  if (/(travel|car rental|real estate|spa|coffee|food|pet|fitness|healthcare)/.test(t))
    return "Lifestyle";
  return "Editorial";
}

async function fetchText(url: string): Promise<string> {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`);
  return await r.text();
}

async function main() {
  const raw = await readFile(INDEX_PATH, "utf8");
  const screens: Screen[] = JSON.parse(raw);
  console.log(`\n• importing ${screens.length} banners\n`);

  await mkdir(PREVIEW_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });

  // Nuke prior individually-imported banner-N rows + files so we restart
  // from a clean slate every run.
  console.log("· clearing prior banner-* templates");
  await db.delete(templates).where(like(templates.slug, "banner-%"));

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  let ok = 0;
  let failed = 0;
  try {
    for (const s of screens) {
      try {
        const { num, themeName, w, h } = parseTitle(s.title);
        const stem = `banner-${String(num).padStart(2, "0")}-${slugify(themeName)}`;
        const slug = stem;
        const niceName = `Banner ${num} · ${themeName}`;
        const category = categoryFor(themeName);
        console.log(`→ ${niceName}  ${w}×${h}  (${category})`);

        // Download HTML
        const html = await fetchText(s.htmlUrl);
        const htmlPath = resolve(HTML_DIR, `${stem}.html`);
        await writeFile(htmlPath, html, "utf8");

        // Copy into public/ so the iframe fallback works too
        const previewPath = resolve(PREVIEW_DIR, `${slug}.html`);
        await writeFile(previewPath, html, "utf8");

        // Render → PNG
        const thumbPath = resolve(THUMB_DIR, `${slug}.png`);
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
        await page.goto(pathToFileURL(previewPath).href, {
          waitUntil: ["load", "networkidle0"],
          timeout: 90_000,
        });
        // Wait for Tailwind CDN runtime to inject styles (it adds a
        // <style id="tailwind-globals"> in the head). Also wait for fonts
        // and every image to fully load — otherwise the screenshot grabs
        // the dark base background before the artwork drops in.
        await page.evaluate(async () => {
          await new Promise<void>((res) => {
            const ready = () =>
              !!document.querySelector("style[id*=tailwind]") ||
              !!document.querySelector("style[data-vite],style[data-tw]") ||
              document.styleSheets.length > 1;
            if (ready()) return res();
            const t0 = Date.now();
            const iv = setInterval(() => {
              if (ready() || Date.now() - t0 > 8000) {
                clearInterval(iv);
                res();
              }
            }, 100);
          });
          // @ts-expect-error fonts is widely supported
          if (document.fonts?.ready) await document.fonts.ready;
          const imgs = Array.from(document.images);
          await Promise.all(
            imgs.map(
              (img) =>
                new Promise<void>((res) => {
                  if (img.complete && img.naturalWidth > 0) return res();
                  const done = () => res();
                  img.addEventListener("load", done, { once: true });
                  img.addEventListener("error", done, { once: true });
                  // Hard cap so a broken image doesn't stall the import
                  setTimeout(done, 6000);
                }),
            ),
          );
          // Two RAFs for layout + paint to settle
          await new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r(null))),
          );
        });
        // Final settle for Tailwind layout pass + animation start frames
        await new Promise((r) => setTimeout(r, 2500));
        await page.screenshot({
          path: thumbPath as `${string}.png`,
          type: "png",
          clip: { x: 0, y: 0, width: w, height: h },
        });

        // Insert DB row
        await db.insert(templates).values({
          id: uid("tpl"),
          slug,
          name: niceName + ` · ${w}×${h}`,
          category,
          tagline: `${w}×${h} ${themeName} banner`,
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
        console.log(`   ✓ imported as "${slug}"`);
        ok++;
      } catch (err) {
        failed++;
        console.error(`   ✗ failed:`, (err as Error).message);
      }
    }
  } finally {
    await browser.close();
    await pool.end();
  }

  console.log(`\n• done: ${ok} imported, ${failed} failed (of ${screens.length})\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
