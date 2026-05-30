/**
 * Import 110 banners from the "Omni-Scale Banner Design Library" Stitch
 * project into Addvoxen as official templates.
 *
 * Each batch HTML in stitch-batches/ contains 10-15 banners wrapped in
 * <div class="w-[Wpx] h-[Hpx] ...">. We extract each one, infer name +
 * category from surrounding section heading + text content, and reproduce
 * the visible elements (headline / sub / CTA) as a fresh EditorDocument.
 *
 *   npx tsx scripts/import-stitch-batches.ts
 *
 * SAFETY: also DELETEs existing official templates (created_by IS NULL)
 * first, so a re-run replaces — not duplicates — the catalog.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFile, readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse, HTMLElement } from "node-html-parser";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { isNull, sql } from "drizzle-orm";
import puppeteer, { Browser } from "puppeteer";
import { templates } from "../src/db/schema";

// ─────────────────────────────────────────────────────────────
// Theme tokens lifted from the Stitch project's design system
const COLORS: Record<string, string> = {
  surface: "#131313",
  "surface-container": "#201f1f",
  "surface-container-low": "#1c1b1b",
  "surface-container-high": "#2a2a2a",
  "surface-container-highest": "#353534",
  "surface-bright": "#3a3939",
  "on-surface": "#e5e2e1",
  "on-surface-variant": "#b9cacb",
  primary: "#dbfcff",
  "primary-container": "#00f0ff",
  "primary-fixed": "#7df4ff",
  "primary-fixed-dim": "#00dbe9",
  "on-primary": "#00363a",
  "on-primary-container": "#006970",
  secondary: "#ffb2b8",
  "secondary-container": "#ff506e",
  "on-secondary": "#67001d",
  tertiary: "#fff5e1",
  "tertiary-container": "#fdd55a",
  "tertiary-fixed": "#ffe088",
  "on-tertiary": "#3c2f00",
  outline: "#849495",
  white: "#ffffff",
  black: "#000000",
};

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

/** Resolve a Tailwind colour class (e.g. "bg-tertiary-container/80",
 *  "bg-[#f9f9f9]", "bg-white") to a hex string. */
function resolveColor(cls: string | undefined, fallback = "#131313"): string {
  if (!cls) return fallback;
  // bg-[#xxxxxx]
  const arb = cls.match(/bg-\[(#[0-9a-fA-F]{3,8})\]/);
  if (arb) return arb[1];
  // bg-<token>(/opacity)
  const m = cls.match(/bg-([a-z-]+)(?:\/\d+)?(?:\s|$)/);
  if (m) {
    const token = m[1];
    if (COLORS[token]) return COLORS[token];
  }
  return fallback;
}

function classNames(el: HTMLElement | null): string {
  if (!el) return "";
  return (el.getAttribute("class") ?? "") as string;
}

function visibleText(el: HTMLElement | null): string {
  if (!el) return "";
  return el.text.replace(/\s+/g, " ").trim();
}

type Layer = {
  id: string;
  type: "rect" | "circle" | "text" | "image";
  name: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────
// Standalone preview page wrapper — Tailwind CDN + Stitch tokens + fonts
// so each iframe renders the banner exactly like the original Stitch HTML.
function wrapAsStandaloneHtml(
  bannerHtml: string,
  width: number,
  height: number,
): string {
  return `<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Anybody:wght@700;900&family=Hanken+Grotesk:wght@400;600&family=Bodoni+Moda:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<style>
  html, body { margin:0; padding:0; background:#131313; overflow:hidden; }
  body { width:${width}px; height:${height}px; }
  .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border:1px solid rgba(255,255,255,0.08); }
  .neon-glow { box-shadow: 0 0 24px rgba(0,240,255,0.5); }
  .brutal-shadow { box-shadow: 6px 6px 0 0 rgba(0,0,0,0.9); }
  .safe-zone { padding: 24px; }
  .luxury-gradient { background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%); }
  .font-display-xl, .text-display-xl { font-family: 'Anybody', sans-serif; font-weight: 900; font-size: 80px; line-height: 80px; letter-spacing: -0.04em; }
  .font-display-xl-mobile, .text-display-xl-mobile { font-family: 'Anybody', sans-serif; font-weight: 900; font-size: 48px; line-height: 48px; letter-spacing: -0.02em; }
  .font-headline-lg, .text-headline-lg { font-family: 'Anybody', sans-serif; font-weight: 700; font-size: 48px; line-height: 52px; letter-spacing: -0.02em; }
  .font-headline-lg-mobile, .text-headline-lg-mobile { font-family: 'Anybody', sans-serif; font-weight: 700; font-size: 32px; line-height: 36px; }
  .font-headline-md, .text-headline-md { font-family: 'Hanken Grotesk', sans-serif; font-weight: 600; font-size: 32px; line-height: 40px; }
  .font-body-lg, .text-body-lg { font-family: 'Hanken Grotesk', sans-serif; font-weight: 400; font-size: 18px; line-height: 28px; }
  .font-body-sm, .text-body-sm { font-family: 'Hanken Grotesk', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; }
  .font-label-caps, .text-label-caps { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; line-height: 16px; letter-spacing: 0.1em; }
  .font-serif-display, .text-serif-display { font-family: 'Bodoni Moda', serif; font-weight: 400; font-size: 56px; line-height: 60px; letter-spacing: -0.01em; }
  body, html { font-family: 'Hanken Grotesk', sans-serif; color: #e5e2e1; }
</style>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: { extend: {
      colors: {
        surface:"#131313","surface-dim":"#131313","surface-bright":"#3a3939",
        "surface-container-lowest":"#0e0e0e","surface-container-low":"#1c1b1b",
        "surface-container":"#201f1f","surface-container-high":"#2a2a2a",
        "surface-container-highest":"#353534","surface-variant":"#353534",
        "on-surface":"#e5e2e1","on-surface-variant":"#b9cacb",
        primary:"#dbfcff","primary-container":"#00f0ff","primary-fixed":"#7df4ff",
        "primary-fixed-dim":"#00dbe9","on-primary":"#00363a","on-primary-container":"#006970",
        secondary:"#ffb2b8","secondary-container":"#ff506e","on-secondary":"#67001d",
        tertiary:"#fff5e1","tertiary-container":"#fdd55a","tertiary-fixed":"#ffe088",
        "tertiary-fixed-dim":"#e9c349","on-tertiary":"#3c2f00",
        outline:"#849495","outline-variant":"#3b494b",
        error:"#ffb4ab","error-container":"#93000a","on-error":"#690005",
        background:"#131313","on-background":"#e5e2e1",
      },
      spacing: { "grid-unit":"4px","gutter-sm":"8px","gutter-md":"16px","margin-edge":"24px","bento-gap":"12px" },
      borderRadius: { sm:"0.25rem", DEFAULT:"0.5rem", md:"0.75rem", lg:"1rem", xl:"1.5rem", full:"9999px" },
    }},
  };
</script>
</head><body>
${bannerHtml}
</body></html>`;
}

// ─────────────────────────────────────────────────────────────
// Per-banner extraction
type ExtractedBanner = {
  name: string;
  category: string;
  tagline: string;
  /** Slot-level Stitch HTML for the banner, including its outermost wrapper.
   *  Wrapped into a stand-alone preview page on disk for iframe rendering. */
  previewHtml: string;
  document: {
    canvasSize: { width: number; height: number };
    background: string;
    layers: Layer[];
  };
};

function extractBanner(
  banner: HTMLElement,
  width: number,
  height: number,
  sectionName: string,
  batchCategory: string,
): ExtractedBanner {
  const cls = classNames(banner);
  const background = resolveColor(cls, "#131313");

  // Pull visible text fragments. Strip script/style.
  banner
    .querySelectorAll("script,style")
    .forEach((n: HTMLElement) => n.remove());

  // Eyebrow / kicker — usually a span with .font-label-caps
  const eyebrowEl = banner.querySelector(
    "[class*=label-caps], [class*=text-label-caps]",
  ) as HTMLElement | null;
  const headlineEl = banner.querySelector("h1, h2, h3") as HTMLElement | null;
  const subEl = banner.querySelector("p") as HTMLElement | null;
  const ctaEl = banner.querySelector("button, a[class*=btn]") as HTMLElement | null;

  const eyebrowText = visibleText(eyebrowEl).slice(0, 60);
  const headlineText = visibleText(headlineEl).slice(0, 200);
  const subText = visibleText(subEl).slice(0, 200);
  const ctaText = visibleText(ctaEl).slice(0, 40);

  // Layer geometry — generous padding, stack vertically
  const PAD_X = Math.max(12, Math.min(width * 0.06, 48));
  const PAD_Y = Math.max(12, Math.min(height * 0.08, 56));
  const ASPECT = width / height;

  // Adaptive font sizes — smaller for tiny banners, bigger for hero
  const isMicro = width < 350 || height < 200;
  const isWideThin = ASPECT > 4; // leaderboard-ish
  const isPortrait = ASPECT < 0.6;
  const headlineSize = isMicro
    ? Math.max(16, Math.round(Math.min(width, height) * 0.12))
    : isWideThin
      ? Math.max(20, Math.round(height * 0.32))
      : isPortrait
        ? Math.max(24, Math.round(width * 0.1))
        : Math.max(28, Math.round(Math.min(width, height) * 0.085));
  const subSize = Math.max(11, Math.round(headlineSize * 0.35));
  const eyebrowSize = Math.max(9, Math.round(headlineSize * 0.22));

  const layers: Layer[] = [];

  // Background full-bleed rect (so editor users can recolor easily)
  layers.push({
    id: lid("bg"),
    type: "rect",
    name: "Background",
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: background,
    cornerRadius: 0,
  });

  // Decorative glow orb when there's room
  if (!isMicro && width >= 400 && height >= 200) {
    layers.push({
      id: lid("orb"),
      type: "circle",
      name: "Accent glow",
      x: width * 0.82,
      y: height * 0.25,
      radius: Math.min(width, height) * 0.35,
      rotation: 0,
      opacity: 0.35,
      visible: true,
      locked: false,
      fill: "#00f0ff",
    });
  }

  let cursorY = PAD_Y;

  if (eyebrowText) {
    layers.push({
      id: lid("eb"),
      type: "text",
      name: "Eyebrow",
      x: PAD_X,
      y: cursorY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: eyebrowText.toUpperCase(),
      fontSize: eyebrowSize,
      fontFamily: "JetBrains Mono",
      fontStyle: "normal",
      fontWeight: "700",
      align: "left",
      fill: "#00f0ff",
      width: width - PAD_X * 2,
    });
    cursorY += eyebrowSize * 1.6;
  }

  if (headlineText) {
    layers.push({
      id: lid("h"),
      type: "text",
      name: "Headline",
      x: PAD_X,
      y: cursorY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: headlineText,
      fontSize: headlineSize,
      fontFamily: "Anybody",
      fontStyle: "normal",
      fontWeight: "900",
      align: "left",
      fill: "#ffffff",
      width: width - PAD_X * 2,
    });
    cursorY += headlineSize * 1.4;
  }

  if (subText && !isMicro && !isWideThin) {
    layers.push({
      id: lid("s"),
      type: "text",
      name: "Subhead",
      x: PAD_X,
      y: cursorY,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: subText,
      fontSize: subSize,
      fontFamily: "Hanken Grotesk",
      fontStyle: "normal",
      fontWeight: "400",
      align: "left",
      fill: "#b9cacb",
      width: width - PAD_X * 2,
    });
    cursorY += subSize * 1.5;
  }

  if (ctaText) {
    const ctaH = Math.max(28, Math.min(height * 0.18, 60));
    const ctaW = Math.min(width - PAD_X * 2, isWideThin ? width * 0.25 : width * 0.55);
    const ctaX = isWideThin ? width - ctaW - PAD_X : PAD_X;
    const ctaY = isWideThin
      ? height / 2 - ctaH / 2
      : Math.min(cursorY + 8, height - ctaH - PAD_Y);
    const ctaRadius = ctaH / 2;

    layers.push({
      id: lid("cta-bg"),
      type: "rect",
      name: "CTA pill",
      x: ctaX,
      y: ctaY,
      width: ctaW,
      height: ctaH,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fill: "#00f0ff",
      cornerRadius: ctaRadius,
    });

    const ctaFontSize = Math.max(10, Math.round(ctaH * 0.4));
    layers.push({
      id: lid("cta-tx"),
      type: "text",
      name: "CTA text",
      x: ctaX,
      y: ctaY + (ctaH - ctaFontSize) / 2,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: ctaText,
      fontSize: ctaFontSize,
      fontFamily: "Anybody",
      fontStyle: "normal",
      fontWeight: "900",
      align: "center",
      fill: "#00363a",
      width: ctaW,
    });
  }

  // Derive a readable name. Prefer the headline; fall back to "{Section} ad"
  const headlinePart = headlineText
    ? headlineText.split(/[.!?\n]/)[0].slice(0, 60).trim()
    : `${batchCategory} Banner`;
  const name = `${headlinePart} · ${width}×${height}`;
  const tagline = `${sectionName} — ${width}×${height}`;

  // Preserve the banner's Stitch markup so the marketplace can render the
  // original design verbatim in an iframe — keeping the imagery / gradients
  // / glass effects intact instead of the simplified layer reproduction.
  const previewHtml = banner.outerHTML;

  return {
    name,
    category: batchCategory,
    tagline,
    previewHtml,
    document: { canvasSize: { width, height }, background, layers },
  };
}

// ─────────────────────────────────────────────────────────────
// Per-batch parser
function parseBatch(html: string, batchCategory: string) {
  const root = parse(html);
  // The HTML in this Stitch project alternates between three patterns:
  //   1. <section>…<h2>Section name</h2>…<div class="w-[300px] h-[250px]">banner</div>…
  //   2. <section class="w-[300px] h-[250px]" title="…">banner directly</section>
  //   3. <main>…<div class="w-[300px] h-[250px]">banner</div>… (no <section>)
  // Catch them all by scanning every element whose class declares an explicit
  // pixel width AND height, then de-duplicating nested matches.
  const out: ReturnType<typeof extractBanner>[] = [];
  const candidates = root.querySelectorAll('[class*="w-["]');

  for (const c of candidates) {
    const cls = c.getAttribute("class") ?? "";
    const wm = cls.match(/w-\[(\d+)px\]/);
    const hm = cls.match(/h-\[(\d+)px\]/);
    if (!wm || !hm) continue;
    const w = parseInt(wm[1]);
    const h = parseInt(hm[1]);
    if (!w || !h || w < 80 || h < 50) continue;
    if (c.text.trim().length < 4) continue;

    // Skip if this element is nested INSIDE another sized banner
    let parent = c.parentNode as HTMLElement | null;
    let nestedInsideBanner = false;
    while (parent) {
      const pc = parent.getAttribute?.("class") ?? "";
      if (
        /\bw-\[\d+px\]/.test(pc) &&
        /\bh-\[\d+px\]/.test(pc)
      ) {
        nestedInsideBanner = true;
        break;
      }
      parent = parent.parentNode as HTMLElement | null;
    }
    if (nestedInsideBanner) continue;

    // Section heading lookup — closest enclosing <section><h2>
    let sectionTitle = "";
    let walker = c.parentNode as HTMLElement | null;
    while (walker) {
      if (walker.tagName === "SECTION") {
        const h2 = walker.querySelector("h2");
        if (h2) {
          sectionTitle = h2.text.replace(/\s+/g, " ").trim();
        }
        break;
      }
      walker = walker.parentNode as HTMLElement | null;
    }
    // Some patterns store the size + style hint in a `title` attribute on
    // the banner itself: title="1080x1080 Bento Crypto"
    if (!sectionTitle) {
      const t = c.getAttribute("title");
      if (t) sectionTitle = t.replace(/\s+/g, " ").trim();
    }
    if (!sectionTitle) sectionTitle = `${batchCategory} banner`;

    out.push(extractBanner(c, w, h, sectionTitle, batchCategory));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Map filename → category label shown in marketplace
const BATCH_CATEGORY: Record<string, string> = {
  "ai-saas-1-10": "AI & SaaS",
  "fintech-11-20": "Fintech",
  "ecommerce-21-35": "E-commerce",
  "gaming-36-50": "Gaming",
  "education-51-65": "Education & Healthcare",
  "realestate-66-80": "Real Estate & Auto",
  "luxury-81-95": "Luxury & Lifestyle",
  "crypto-96-110": "Crypto & Travel",
};

async function main() {
  const dir = resolve(process.cwd(), "stitch-batches");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".html"));
  if (files.length === 0) {
    console.error("No HTML batches found in stitch-batches/");
    process.exit(1);
  }

  const all: ReturnType<typeof extractBanner>[] = [];
  for (const f of files) {
    const key = f.replace(/\.html$/, "");
    const category = BATCH_CATEGORY[key] ?? "Editorial";
    const html = await readFile(resolve(dir, f), "utf8");
    const banners = parseBatch(html, category);
    console.log(`  ${f.padEnd(28)} → ${banners.length} banner(s)`);
    all.push(...banners);
  }

  console.log(`\nTotal extracted: ${all.length} banners`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });

  // 1. Delete current official templates (created_by IS NULL)
  const del = await db.delete(templates).where(isNull(templates.createdBy)).returning({ id: templates.id });
  console.log(`\n✓ Deleted ${del.length} existing official template(s)`);

  // Clean up previous standalone preview pages + screenshots
  const previewDir = resolve(process.cwd(), "public", "banner-previews");
  const thumbDir = resolve(process.cwd(), "public", "banner-thumbnails");
  for (const dir of [previewDir, thumbDir]) {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    await mkdir(dir, { recursive: true });
  }

  // Boot a single headless Chrome instance — re-using one browser for all
  // 95 banners is dramatically faster than spinning up per-banner.
  console.log("\nLaunching headless Chrome…");
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 2. Insert fresh batch + render each banner to PNG
  let inserted = 0;
  let idx = 0;
  for (const b of all) {
    idx++;
    const w = b.document.canvasSize.width;
    const h = b.document.canvasSize.height;
    try {
      const slug = `${slugify(b.name).slice(0, 50)}-${Math.random().toString(36).slice(2, 6)}`;

      // (a) Write standalone preview HTML
      const standalone = wrapAsStandaloneHtml(b.previewHtml, w, h);
      const previewPath = resolve(previewDir, `${slug}.html`);
      await writeFile(previewPath, standalone, "utf8");

      // (b) Render with headless Chrome → PNG screenshot
      const thumbPath = resolve(thumbDir, `${slug}.png`);
      const page = await browser.newPage();
      try {
        await page.setViewport({
          width: w,
          height: h,
          deviceScaleFactor: 2, // retina-quality
        });
        await page.goto(pathToFileURL(previewPath).href, {
          waitUntil: "networkidle2",
          timeout: 30_000,
        });
        // Give Tailwind CDN a beat to apply utility classes
        await new Promise((r) => setTimeout(r, 700));
        await page.screenshot({
          path: thumbPath as `${string}.png`,
          type: "png",
          fullPage: false,
          clip: { x: 0, y: 0, width: w, height: h },
          omitBackground: false,
        });
        console.log(
          `  (${idx}/${all.length}) ${slug.padEnd(40)} ${w}×${h}  ✓`,
        );
      } finally {
        await page.close();
      }

      // (c) Document = a single full-bleed image layer with the Stitch
      //     screenshot. No extracted overlays — those produced visual
      //     duplicates of the text already baked into the PNG. The buyer
      //     opens the template, sees the original banner verbatim, and
      //     adds their own text / logo / shapes on top using the toolbar.
      const documentWithImage: typeof b.document = {
        ...b.document,
        layers: [
          {
            id: lid("bg-img"),
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
      };

      await db.insert(templates).values({
        id: uid("tpl"),
        slug,
        name: b.name,
        category: b.category,
        tagline: b.tagline,
        document: documentWithImage,
        tier: w * h > 200_000 ? "pro" : "free",
        published: true,
        listingStatus: "approved",
        priceCents: 0,
        downloads: 0,
        // Marketplace card prefers the static PNG (smaller + cached + no
        // iframe load) over the live HTML preview.
        thumbnailUrl: `/banner-thumbnails/${slug}.png`,
      });
      inserted++;
    } catch (err) {
      console.error(`✗ Failed for "${b.name}" (${w}×${h}):`, err);
    }
  }

  await browser.close();

  console.log(`\n✓ Inserted ${inserted}/${all.length} new official templates.`);

  // Show post-import counts
  const counts = await db.execute(sql`
    SELECT
      SUM(CASE WHEN created_by IS NULL THEN 1 ELSE 0 END)::int AS official,
      SUM(CASE WHEN created_by IS NOT NULL AND listing_status = 'approved' THEN 1 ELSE 0 END)::int AS community
    FROM templates
  `);
  console.log("\nMarketplace totals:");
  console.log(counts.rows[0]);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
