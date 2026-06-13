/**
 * Bütün demo saytlardan screenshot çəkib şablon thumbnail-i kimi saxlayır.
 * Dev server 3000-də olmalı. AZ dilində çəkilir. Run: npx tsx scripts/shoot-demos.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import puppeteer from "puppeteer";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { siteTemplates } from "../src/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { siteTemplates } });
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const SHOTS = [
  { sub: "demo", slug: "klinika-landing" },
  { sub: "demo-restoran", slug: "restoran-multipage" },
  { sub: "demo-biznes", slug: "biznes-multipage" },
  { sub: "demo-magaza", slug: "magaza-landing" },
  { sub: "demo-salon", slug: "salon-landing" },
  { sub: "demo-studiya", slug: "studiya-landing" },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true, executablePath: EDGE, args: ["--no-sandbox"] });
  for (const s of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.setExtraHTTPHeaders({ Cookie: "site_locale=az" });
    await page.goto(`http://${s.sub}.localhost:3000`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1800));
    await page.screenshot({ path: `public/templates/${s.slug}.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });
    await db.update(siteTemplates).set({ thumbnailUrl: `/templates/${s.slug}.png` }).where(eq(siteTemplates.slug, s.slug));
    console.log("OK", s.slug);
    await page.close();
  }
  await browser.close();
  await pool.end();
}
main().catch((e) => { console.error("XETA:", e.message); process.exit(2); });
