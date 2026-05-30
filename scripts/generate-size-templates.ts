/**
 * Generate one starter template per ad format defined in ad-formats.ts and
 * seed them into the database. Each template uses the Addvoxen "Precision
 * Luxury" theme tokens and is sized exactly for its placement (Meta Story,
 * Google Leaderboard, A4 print, etc).
 *
 *   npx tsx scripts/generate-size-templates.ts
 *
 * Re-runs are idempotent — existing slugs are skipped.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { templates } from "../src/db/schema";
import { AD_FORMATS, type AdFormat } from "../src/lib/ad-formats";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
function lid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
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

const PRIMARY = "#d0bcff";
const ON_PRIMARY = "#3c0091";
const TERTIARY = "#00dbe7";
const ACCENT_DEEP = "#6d3bd7";
const TEXT_HI = "#dae2fd";
const TEXT_LO = "#cbc3d7";
const SURFACE = "#0b1326";
const SURFACE_DEEP = "#060e20";

/**
 * Produce a sensible starter template for any canvas size. The layout
 * adapts to the aspect ratio:
 *   - tall (story): centred headline + CTA stacked
 *   - landscape banner: brand left, headline middle, CTA right
 *   - wide square: hero text + CTA bottom-left, glow top-right
 *   - small display banner: brand + 1-liner + tiny CTA
 */
function generateLayersForFormat(f: AdFormat): { background: string; layers: Layer[] } {
  const { width: W, height: H } = f;
  const ar = W / H;
  const isSmall = W <= 400 || H <= 200;
  const isTall = ar < 0.75;
  const isWide = ar > 2.5;

  const layers: Layer[] = [];

  // Background glow accent
  if (!isSmall) {
    layers.push({
      id: lid("glow"),
      type: "circle",
      name: "Glow accent",
      x: isTall ? W / 2 : W * 0.85,
      y: isTall ? H * 0.18 : H * 0.5,
      radius: Math.min(W, H) * 0.45,
      rotation: 0,
      opacity: 0.4,
      visible: true,
      locked: false,
      fill: ACCENT_DEEP,
    });
  }

  // Brand
  const brandSize = Math.max(14, Math.round(Math.min(W, H) * (isSmall ? 0.14 : 0.07)));
  layers.push({
    id: lid("brand"),
    type: "text",
    name: "Brand",
    x: Math.max(16, W * 0.04),
    y: Math.max(16, H * 0.06),
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    text: "Addvoxen",
    fontSize: brandSize,
    fontFamily: "Geist",
    fontStyle: "normal",
    fontWeight: "700",
    align: "left",
    fill: PRIMARY,
  });

  // Headline
  const headlineSize = Math.max(
    18,
    Math.round(Math.min(W, H) * (isSmall ? 0.18 : isTall ? 0.11 : isWide ? 0.18 : 0.09)),
  );
  const headlineY = isTall
    ? H * 0.42
    : isSmall
      ? H * 0.45
      : H * 0.4;
  layers.push({
    id: lid("h1"),
    type: "text",
    name: "Headline",
    x: Math.max(16, W * 0.04),
    y: headlineY,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    text: isSmall
      ? "Generate Ads in Seconds"
      : isTall
        ? "High-Conversion\nAd Banners.\nInstantly."
        : "Generate High-Conversion\nAd Banners.",
    fontSize: headlineSize,
    fontFamily: "Geist",
    fontStyle: "normal",
    fontWeight: "700",
    align: "left",
    fill: TEXT_HI,
    width: W * 0.92,
  });

  // Sub-headline (skip on very small banners)
  if (!isSmall) {
    const subSize = Math.max(12, Math.round(Math.min(W, H) * (isTall ? 0.035 : 0.028)));
    layers.push({
      id: lid("sub"),
      type: "text",
      name: "Subhead",
      x: Math.max(16, W * 0.04),
      y: headlineY + headlineSize * (isTall ? 3.6 : 2.2),
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      text: "Powered by the Addvoxen AI Engine v3.0",
      fontSize: subSize,
      fontFamily: "Inter",
      fontStyle: "normal",
      fontWeight: "400",
      align: "left",
      fill: TEXT_LO,
      width: W * 0.85,
    });
  }

  // CTA pill
  const ctaW = Math.min(W * (isSmall ? 0.35 : 0.32), 360);
  const ctaH = Math.max(28, Math.min(H * 0.16, 84));
  const ctaR = ctaH / 2;
  const ctaX = isWide ? W - ctaW - W * 0.04 : Math.max(16, W * 0.04);
  const ctaY = isWide ? H / 2 - ctaH / 2 : H - ctaH - Math.max(16, H * 0.06);
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
    fill: PRIMARY,
    cornerRadius: ctaR,
  });
  const ctaFontSize = Math.max(11, Math.round(ctaH * 0.42));
  layers.push({
    id: lid("cta-tx"),
    type: "text",
    name: "CTA text",
    x: ctaX,
    y: ctaY + ctaH / 2 - ctaFontSize * 0.55,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    text: isSmall ? "Try Free" : "Start Creating  →",
    fontSize: ctaFontSize,
    fontFamily: "Geist",
    fontStyle: "normal",
    fontWeight: "700",
    align: "center",
    fill: ON_PRIMARY,
    width: ctaW,
  });

  // Accent dot for small banners
  if (isSmall) {
    layers.push({
      id: lid("dot"),
      type: "circle",
      name: "Accent dot",
      x: W - 12,
      y: 12,
      radius: 6,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fill: TERTIARY,
    });
  }

  // Background: pick a different deep tone for print
  const background = f.platform === "print" ? SURFACE_DEEP : SURFACE;
  return { background, layers };
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });

  let inserted = 0;
  let skipped = 0;

  for (const f of AD_FORMATS) {
    const slug = `${f.id}-starter`;
    const existing = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.slug, slug))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const { background, layers } = generateLayersForFormat(f);
    const tier =
      f.platform === "print" || f.id.includes("topview") || f.id.includes("billboard")
        ? "pro"
        : "free";

    // Map Addvoxen platform to a marketplace category
    const category =
      f.platform === "meta" || f.platform === "tiktok" || f.platform === "snapchat" || f.platform === "pinterest"
        ? "Social"
        : f.platform === "google"
          ? "Web Banner"
          : f.platform === "youtube"
            ? "Video"
            : f.platform === "linkedin" || f.platform === "twitter"
              ? "Business"
              : f.platform === "print"
                ? "Print"
                : "Editorial";

    await db.insert(templates).values({
      id: uid("tpl"),
      slug,
      name: `${f.name} Starter`,
      category,
      tagline: `${f.placement} · ${f.width}×${f.height}`,
      document: {
        canvasSize: { width: f.width, height: f.height },
        background,
        layers,
      },
      tier,
      published: true,
      downloads: 0,
    });
    inserted++;
    console.log(`✓ ${f.name.padEnd(28)} ${f.width}×${f.height}  (${tier})`);
  }

  console.log(`\nDone. Inserted: ${inserted}, skipped: ${skipped}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
