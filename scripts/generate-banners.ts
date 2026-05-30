/**
 * Generate 40 production-quality banner templates with REAL design variety.
 *
 *   8 content packs × 5 standard ad sizes = 40 banners
 *   5 distinct DESIGN STYLES, rotated so no two banners in the same pack
 *   share a style — and every size column across packs gets the full mix too.
 *
 * Each banner is a stack of editable Konva layers (image, rect, text). The
 * PNG thumbnail is rendered from the same spec via Puppeteer, so what the
 * marketplace card shows matches what opens in the editor.
 *
 * Design styles (each adapts to all 5 shapes):
 *   A) Editorial Hero  — photo bg, vignette, big serif headline bottom-aligned
 *   B) Solid Split     — half accent panel + half photo, text on panel
 *   C) Top Photo Card  — photo top, solid dark card bottom with text + CTA
 *   D) Mega Type       — solid accent bg + huge type + small framed photo
 *   E) Diagonal Stripe — photo bg + diagonal accent stripe holding text
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { like } from "drizzle-orm";
import puppeteer from "puppeteer";
import { templates } from "../src/db/schema";

const ROOT = process.cwd();
const PREVIEW_DIR = resolve(ROOT, "public", "banner-previews");
const THUMB_DIR = resolve(ROOT, "public", "banner-thumbnails");

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
function lid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 7)}`;
}

// ===========================================================================
//  Content packs
// ===========================================================================
type Pack = {
  key: string;
  category: string;
  brand: string;
  headline: string;
  sub: string;
  cta: string;
  accent: string;
  accentText: string;
  photos: string[];
};

const PACKS: Pack[] = [
  {
    key: "ai-saas",
    category: "AI & SaaS",
    brand: "Aurora AI",
    headline: "AI that ships.",
    sub: "Build smarter products, 10× faster.",
    cta: "Start free",
    accent: "#6366f1",
    accentText: "#ffffff",
    photos: ["1620712943543-bcc4688e7485", "1518770660439-4636190af475", "1535378917042-10a22c95931a", "1551434678-e076c223a692", "1573164574572-cb89e39749b4"],
  },
  {
    key: "fintech",
    category: "Fintech",
    brand: "Lumen Capital",
    headline: "Your money,\noptimized.",
    sub: "Modern banking for ambitious founders.",
    cta: "Open account",
    accent: "#10b981",
    accentText: "#052e1a",
    photos: ["1611974789855-9c2a0a7236a3", "1554224155-6726b3ff858f", "1559526324-4b87b5e36e44", "1579621970590-9d624316904b", "1543286386-2e659306cd6c"],
  },
  {
    key: "travel",
    category: "Lifestyle",
    brand: "Drift Travel",
    headline: "Wander beyond.",
    sub: "Curated escapes. Zero stress.",
    cta: "Plan a trip",
    accent: "#0ea5e9",
    accentText: "#ffffff",
    photos: ["1530789253388-582c481c54b0", "1488646953014-85cb44e25828", "1507525428034-b723cf961d3e", "1502920917128-1aa500764cbd", "1469854523086-cc02fe5d8800"],
  },
  {
    key: "fashion",
    category: "Retail",
    brand: "Maison No.7",
    headline: "New season,\nnew you.",
    sub: "Up to 40% off this week only.",
    cta: "Shop edit",
    accent: "#fb7185",
    accentText: "#ffffff",
    photos: ["1485518882345-15568b007407", "1539109136881-3be0616acf4b", "1490481651871-ab68de25d43d", "1469334031218-e382a71b716b", "1483985988355-763728e1935b"],
  },
  {
    key: "food",
    category: "Lifestyle",
    brand: "Spoonbird",
    headline: "Hungry?\nWe deliver.",
    sub: "Hot meals, 25-minute door drop.",
    cta: "Order now",
    accent: "#f59e0b",
    accentText: "#3b2400",
    photos: ["1565299624946-b28f40a0ae38", "1567620905732-2d1ec7ab7445", "1546069901-ba9599a7e63c", "1551782450-a2132b4ba21d", "1504674900247-0877df9cc836"],
  },
  {
    key: "fitness",
    category: "Lifestyle",
    brand: "Pulse Club",
    headline: "Stronger\nevery day.",
    sub: "Train smarter with AI coaching.",
    cta: "Join now",
    accent: "#ef4444",
    accentText: "#ffffff",
    photos: ["1571019613454-1cb2f99b2d8b", "1538805060514-97d9cc17730c", "1517836357463-d25dfeac3438", "1534438327276-14e5300c3a48", "1581009146145-b5ef050c2e1e"],
  },
  {
    key: "real-estate",
    category: "Retail",
    brand: "Atlas Homes",
    headline: "Find home.",
    sub: "Modern listings, curated daily.",
    cta: "Browse",
    accent: "#0f172a",
    accentText: "#ffffff",
    photos: ["1564013799919-ab600027ffc6", "1600596542815-ffad4c1539a9", "1512917774080-9991f1c4c750", "1568605114967-8130f3a36994", "1613490493576-7fde63acd811"],
  },
  {
    key: "crypto",
    category: "Fintech",
    brand: "Coinflux",
    headline: "The future\nof finance.",
    sub: "Trade, stake & earn — one platform.",
    cta: "Get started",
    accent: "#facc15",
    accentText: "#1a1206",
    photos: ["1518546305927-5a555bb7020d", "1639762681485-074b7f938ba0", "1640340434855-6084b1f4901c", "1621761191319-c6fb62004040", "1622630998477-20aa696ecb05"],
  },
];

// ===========================================================================
//  Sizes
// ===========================================================================
const SIZES = [
  { w: 300, h: 250, label: "Medium Rectangle" },
  { w: 728, h: 90, label: "Leaderboard" },
  { w: 1200, h: 628, label: "Facebook Feed" },
  { w: 1080, h: 1080, label: "Instagram Square" },
  { w: 1080, h: 1920, label: "Story" },
] as const;

function photoUrl(id: string, w: number, h: number) {
  return `https://images.unsplash.com/photo-${id}?w=${w * 2}&h=${h * 2}&fit=crop&q=85&auto=format`;
}

// ===========================================================================
//  Spec types
// ===========================================================================
type ImageSpec = { kind: "image"; x: number; y: number; w: number; h: number; src: string };
type RectSpec = { kind: "rect"; x: number; y: number; w: number; h: number; fill: string; opacity?: number; radius?: number; rotation?: number };
type TextSpec = {
  kind: "text";
  x: number; y: number;
  text: string;
  fontSize: number;
  fill: string;
  /** Layer alpha — keep `fill` as solid hex so the editor's color picker
   *  works, and drop subtlety here. */
  opacity?: number;
  weight: "400" | "500" | "600" | "700" | "900";
  family: "Inter" | "Playfair Display";
  width?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  align?: "left" | "center" | "right";
  italic?: boolean;
};
type SpecLayer = ImageSpec | RectSpec | TextSpec;
type Spec = { name: string; layer: SpecLayer }[];

type ShapeKind = "tiny" | "leaderboard" | "wide" | "square" | "tall";
function pickShape(w: number, h: number): ShapeKind {
  const a = w / h;
  if (w <= 360 && h <= 360) return "tiny";
  if (a > 3) return "leaderboard";
  if (a < 0.7) return "tall";
  if (a > 1.4) return "wide";
  return "square";
}

// Lighten/darken helpers — we cheat with rgba for opacity, no real color math
function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ===========================================================================
//  STYLE A — Editorial Hero (photo bg + bottom-aligned serif headline)
// ===========================================================================
function styleEditorialHero(p: Pack, w: number, h: number, src: string): Spec {
  const shape = pickShape(w, h);
  const brand = p.brand.toUpperCase();
  switch (shape) {
    case "tiny":
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Bottom shade", layer: { kind: "rect", x: 0, y: 120, w, h: 130, fill: "#000000", opacity: 0.55 } },
        { name: "Brand label", layer: { kind: "text", x: 14, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 1.5, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 14, y: 150, text: p.headline.replace(/\n/g, " "), fontSize: 26, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 28 } },
        { name: "CTA button", layer: { kind: "rect", x: 14, y: 215, w: 110, h: 26, fill: p.accent, radius: 13 } },
        { name: "CTA text", layer: { kind: "text", x: 14, y: 221, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: p.accentText, width: 110, align: "center" } },
      ];
    case "leaderboard":
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Full shade", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.50 } },
        { name: "Brand label", layer: { kind: "text", x: 22, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 1.8, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 22, y: 34, text: p.headline.replace(/\n/g, " "), fontSize: 24, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 200 } },
        { name: "CTA button", layer: { kind: "rect", x: w - 140, y: (h - 32) / 2, w: 120, h: 32, fill: p.accent, radius: 16 } },
        { name: "CTA text", layer: { kind: "text", x: w - 140, y: (h - 32) / 2 + 8, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: p.accentText, width: 120, align: "center" } },
      ];
    case "wide":
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Left shade", layer: { kind: "rect", x: 0, y: 0, w: Math.round(w * 0.62), h, fill: "#0b0d12", opacity: 0.78 } },
        { name: "Edge shade", layer: { kind: "rect", x: Math.round(w * 0.55), y: 0, w: Math.round(w * 0.20), h, fill: "#0b0d12", opacity: 0.30 } },
        { name: "Brand label", layer: { kind: "text", x: 64, y: 96, text: brand, fontSize: 16, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 2.5, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 64, y: 140, text: p.headline, fontSize: 78, weight: "900", family: "Playfair Display", fill: "#ffffff", width: Math.round(w * 0.55) } },
        { name: "Subhead", layer: { kind: "text", x: 64, y: 360, text: p.sub, fontSize: 22, weight: "400", family: "Inter", fill: "#e5e7eb", width: Math.round(w * 0.50) } },
        { name: "CTA button", layer: { kind: "rect", x: 64, y: 460, w: 220, h: 62, fill: p.accent, radius: 31 } },
        { name: "CTA text", layer: { kind: "text", x: 64, y: 480, text: `${p.cta}  →`, fontSize: 18, weight: "600", family: "Inter", fill: p.accentText, width: 220, align: "center" } },
      ];
    case "square":
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Bottom shade", layer: { kind: "rect", x: 0, y: 540, w, h: 540, fill: "#000000", opacity: 0.55 } },
        { name: "Brand label", layer: { kind: "text", x: 60, y: 60, text: brand, fontSize: 18, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 3, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 60, y: 660, text: p.headline, fontSize: 96, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 120 } },
        { name: "Subhead", layer: { kind: "text", x: 60, y: 880, text: p.sub, fontSize: 26, weight: "400", family: "Inter", fill: "#e5e7eb", width: w - 120 } },
        { name: "CTA button", layer: { kind: "rect", x: 60, y: 950, w: 280, h: 70, fill: p.accent, radius: 35 } },
        { name: "CTA text", layer: { kind: "text", x: 60, y: 974, text: `${p.cta}  →`, fontSize: 22, weight: "600", family: "Inter", fill: p.accentText, width: 280, align: "center" } },
      ];
    case "tall":
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Top shade", layer: { kind: "rect", x: 0, y: 0, w, h: 220, fill: "#000000", opacity: 0.45 } },
        { name: "Bottom shade", layer: { kind: "rect", x: 0, y: 1100, w, h: 820, fill: "#000000", opacity: 0.62 } },
        { name: "Brand label", layer: { kind: "text", x: 72, y: 110, text: brand, fontSize: 26, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 72, y: 1300, text: p.headline, fontSize: 132, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 144 } },
        { name: "Subhead", layer: { kind: "text", x: 72, y: 1620, text: p.sub, fontSize: 34, weight: "400", family: "Inter", fill: "#e5e7eb", width: w - 144 } },
        { name: "CTA button", layer: { kind: "rect", x: 72, y: 1740, w: 360, h: 88, fill: p.accent, radius: 44 } },
        { name: "CTA text", layer: { kind: "text", x: 72, y: 1768, text: `${p.cta}  →`, fontSize: 28, weight: "600", family: "Inter", fill: p.accentText, width: 360, align: "center" } },
      ];
  }
}

// ===========================================================================
//  STYLE B — Solid Split (half accent panel + half photo)
// ===========================================================================
function styleSolidSplit(p: Pack, w: number, h: number, src: string): Spec {
  const shape = pickShape(w, h);
  const brand = p.brand.toUpperCase();
  switch (shape) {
    case "tiny": {
      // Top half photo, bottom half accent panel
      const split = Math.round(h * 0.50);
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: split, src } },
        { name: "Accent panel", layer: { kind: "rect", x: 0, y: split, w, h: h - split, fill: p.accent } },
        { name: "Brand label", layer: { kind: "text", x: 12, y: split + 10, text: brand, fontSize: 9, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 1.3, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 12, y: split + 26, text: p.headline.replace(/\n/g, " "), fontSize: 18, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 24 } },
        { name: "CTA text", layer: { kind: "text", x: 12, y: h - 24, text: `${p.cta}  →`, fontSize: 11, weight: "700", family: "Inter", fill: p.accentText, letterSpacing: 0.8 } },
      ];
    }
    case "leaderboard": {
      const split = Math.round(w * 0.55);
      return [
        { name: "Accent panel", layer: { kind: "rect", x: 0, y: 0, w: split, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: split, y: 0, w: w - split, h, src } },
        { name: "Brand label", layer: { kind: "text", x: 22, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 1.6, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 22, y: 34, text: p.headline.replace(/\n/g, " "), fontSize: 22, weight: "900", family: "Playfair Display", fill: p.accentText, width: split - 44 } },
        { name: "CTA button", layer: { kind: "rect", x: w - 140, y: (h - 32) / 2, w: 120, h: 32, fill: "#ffffff", radius: 16 } },
        { name: "CTA text", layer: { kind: "text", x: w - 140, y: (h - 32) / 2 + 8, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: "#0b0d12", width: 120, align: "center" } },
      ];
    }
    case "wide": {
      const split = Math.round(w * 0.48);
      return [
        { name: "Accent panel", layer: { kind: "rect", x: 0, y: 0, w: split, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: split, y: 0, w: w - split, h, src } },
        { name: "Brand label", layer: { kind: "text", x: 64, y: 96, text: brand, fontSize: 18, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 3, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 64, y: 150, text: p.headline, fontSize: 76, weight: "900", family: "Playfair Display", fill: p.accentText, width: split - 128 } },
        { name: "Subhead", layer: { kind: "text", x: 64, y: 380, text: p.sub, fontSize: 22, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.85, width: split - 128 } },
        { name: "CTA button", layer: { kind: "rect", x: 64, y: 470, w: 220, h: 62, fill: "#ffffff", radius: 31 } },
        { name: "CTA text", layer: { kind: "text", x: 64, y: 490, text: `${p.cta}  →`, fontSize: 18, weight: "600", family: "Inter", fill: "#0b0d12", width: 220, align: "center" } },
      ];
    }
    case "square": {
      const split = Math.round(h * 0.55);
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: split, src } },
        { name: "Accent panel", layer: { kind: "rect", x: 0, y: split, w, h: h - split, fill: p.accent } },
        { name: "Brand label", layer: { kind: "text", x: 60, y: split + 50, text: brand, fontSize: 20, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 3.5, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 60, y: split + 90, text: p.headline, fontSize: 92, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 120 } },
        { name: "Subhead", layer: { kind: "text", x: 60, y: split + 290, text: p.sub, fontSize: 24, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.80, width: w - 120 } },
        { name: "CTA button", layer: { kind: "rect", x: 60, y: split + 360, w: 280, h: 70, fill: "#ffffff", radius: 35 } },
        { name: "CTA text", layer: { kind: "text", x: 60, y: split + 384, text: `${p.cta}  →`, fontSize: 22, weight: "600", family: "Inter", fill: "#0b0d12", width: 280, align: "center" } },
      ];
    }
    case "tall": {
      const split = Math.round(h * 0.55);
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: split, src } },
        { name: "Accent panel", layer: { kind: "rect", x: 0, y: split, w, h: h - split, fill: p.accent } },
        { name: "Brand label", layer: { kind: "text", x: 72, y: split + 80, text: brand, fontSize: 26, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 72, y: split + 130, text: p.headline, fontSize: 124, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 144 } },
        { name: "Subhead", layer: { kind: "text", x: 72, y: split + 460, text: p.sub, fontSize: 32, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.85, width: w - 144 } },
        { name: "CTA button", layer: { kind: "rect", x: 72, y: split + 580, w: 360, h: 88, fill: "#ffffff", radius: 44 } },
        { name: "CTA text", layer: { kind: "text", x: 72, y: split + 608, text: `${p.cta}  →`, fontSize: 28, weight: "600", family: "Inter", fill: "#0b0d12", width: 360, align: "center" } },
      ];
    }
  }
}

// ===========================================================================
//  STYLE C — Top Photo Card (photo on top, solid dark card with text below)
// ===========================================================================
function styleTopCard(p: Pack, w: number, h: number, src: string): Spec {
  const shape = pickShape(w, h);
  const brand = p.brand.toUpperCase();
  const cardBg = "#0b0d12";
  switch (shape) {
    case "tiny": {
      const photoH = Math.round(h * 0.55);
      return [
        { name: "Card background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: cardBg } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: photoH, src } },
        { name: "Accent dot", layer: { kind: "rect", x: 14, y: photoH + 12, w: 6, h: 6, fill: p.accent, radius: 3 } },
        { name: "Brand label", layer: { kind: "text", x: 26, y: photoH + 10, text: brand, fontSize: 9, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 1.4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 14, y: photoH + 28, text: p.headline.replace(/\n/g, " "), fontSize: 18, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 28 } },
        { name: "CTA text", layer: { kind: "text", x: 14, y: h - 22, text: `${p.cta}  →`, fontSize: 11, weight: "700", family: "Inter", fill: p.accent, letterSpacing: 0.8 } },
      ];
    }
    case "leaderboard": {
      const photoW = Math.round(w * 0.30);
      return [
        { name: "Card background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: cardBg } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w: photoW, h, src } },
        { name: "Brand label", layer: { kind: "text", x: photoW + 18, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 1.8, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: photoW + 18, y: 32, text: p.headline.replace(/\n/g, " "), fontSize: 22, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - photoW - 180 } },
        { name: "CTA button", layer: { kind: "rect", x: w - 140, y: (h - 32) / 2, w: 120, h: 32, fill: p.accent, radius: 16 } },
        { name: "CTA text", layer: { kind: "text", x: w - 140, y: (h - 32) / 2 + 8, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: p.accentText, width: 120, align: "center" } },
      ];
    }
    case "wide": {
      const photoH = Math.round(h * 0.55);
      return [
        { name: "Card background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: cardBg } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: photoH, src } },
        { name: "Accent strip", layer: { kind: "rect", x: 64, y: photoH + 28, w: 56, h: 4, fill: p.accent, radius: 2 } },
        { name: "Brand label", layer: { kind: "text", x: 64, y: photoH + 44, text: brand, fontSize: 14, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 2.2, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 64, y: photoH + 70, text: p.headline.replace(/\n/g, " "), fontSize: 56, weight: "900", family: "Playfair Display", fill: "#ffffff", width: Math.round(w * 0.65) } },
        { name: "CTA button", layer: { kind: "rect", x: w - 280, y: photoH + 90, w: 220, h: 60, fill: p.accent, radius: 30 } },
        { name: "CTA text", layer: { kind: "text", x: w - 280, y: photoH + 108, text: `${p.cta}  →`, fontSize: 18, weight: "600", family: "Inter", fill: p.accentText, width: 220, align: "center" } },
      ];
    }
    case "square": {
      const photoH = Math.round(h * 0.58);
      return [
        { name: "Card background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: cardBg } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: photoH, src } },
        { name: "Accent strip", layer: { kind: "rect", x: 60, y: photoH + 40, w: 64, h: 5, fill: p.accent, radius: 3 } },
        { name: "Brand label", layer: { kind: "text", x: 60, y: photoH + 60, text: brand, fontSize: 16, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 2.8, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 60, y: photoH + 92, text: p.headline, fontSize: 78, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 120 } },
        { name: "Subhead", layer: { kind: "text", x: 60, y: photoH + 280, text: p.sub, fontSize: 22, weight: "400", family: "Inter", fill: "#cbd5e1", width: w - 120 } },
        { name: "CTA button", layer: { kind: "rect", x: 60, y: h - 110, w: 260, h: 64, fill: p.accent, radius: 32 } },
        { name: "CTA text", layer: { kind: "text", x: 60, y: h - 90, text: `${p.cta}  →`, fontSize: 20, weight: "600", family: "Inter", fill: p.accentText, width: 260, align: "center" } },
      ];
    }
    case "tall": {
      const photoH = Math.round(h * 0.55);
      return [
        { name: "Card background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: cardBg } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h: photoH, src } },
        { name: "Accent strip", layer: { kind: "rect", x: 72, y: photoH + 70, w: 80, h: 6, fill: p.accent, radius: 3 } },
        { name: "Brand label", layer: { kind: "text", x: 72, y: photoH + 100, text: brand, fontSize: 24, weight: "600", family: "Inter", fill: p.accent, letterSpacing: 3.6, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 72, y: photoH + 150, text: p.headline, fontSize: 116, weight: "900", family: "Playfair Display", fill: "#ffffff", width: w - 144 } },
        { name: "Subhead", layer: { kind: "text", x: 72, y: photoH + 470, text: p.sub, fontSize: 30, weight: "400", family: "Inter", fill: "#cbd5e1", width: w - 144 } },
        { name: "CTA button", layer: { kind: "rect", x: 72, y: h - 200, w: 360, h: 88, fill: p.accent, radius: 44 } },
        { name: "CTA text", layer: { kind: "text", x: 72, y: h - 172, text: `${p.cta}  →`, fontSize: 28, weight: "600", family: "Inter", fill: p.accentText, width: 360, align: "center" } },
      ];
    }
  }
}

// ===========================================================================
//  STYLE D — Mega Type (solid accent bg, huge headline, framed photo inset)
// ===========================================================================
function styleMegaType(p: Pack, w: number, h: number, src: string): Spec {
  const shape = pickShape(w, h);
  const brand = p.brand.toUpperCase();
  switch (shape) {
    case "tiny": {
      // Accent bg, photo strip on right, headline left
      const photoW = Math.round(w * 0.40);
      return [
        { name: "Accent background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: w - photoW, y: 0, w: photoW, h, src } },
        { name: "Brand label", layer: { kind: "text", x: 14, y: 14, text: brand, fontSize: 9, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 1.4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 14, y: 40, text: p.headline.replace(/\n/g, " "), fontSize: 30, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - photoW - 28 } },
        { name: "CTA text", layer: { kind: "text", x: 14, y: h - 24, text: `${p.cta}  →`, fontSize: 11, weight: "700", family: "Inter", fill: p.accentText, letterSpacing: 0.8 } },
      ];
    }
    case "leaderboard": {
      const photoW = 90;
      return [
        { name: "Accent background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: w - photoW, y: 0, w: photoW, h, src } },
        { name: "Brand label", layer: { kind: "text", x: 22, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 1.8, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 22, y: 30, text: p.headline.replace(/\n/g, " "), fontSize: 28, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - photoW - 200 } },
        { name: "CTA button", layer: { kind: "rect", x: w - photoW - 130, y: (h - 32) / 2, w: 120, h: 32, fill: "#0b0d12", radius: 16 } },
        { name: "CTA text", layer: { kind: "text", x: w - photoW - 130, y: (h - 32) / 2 + 8, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: "#ffffff", width: 120, align: "center" } },
      ];
    }
    case "wide": {
      const photoSize = Math.round(h * 0.65);
      return [
        { name: "Accent background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: p.accent } },
        { name: "Photo frame", layer: { kind: "rect", x: w - photoSize - 60, y: (h - photoSize) / 2, w: photoSize, h: photoSize, fill: "#000000", opacity: 1, radius: 14 } },
        { name: "Background photo", layer: { kind: "image", x: w - photoSize - 60, y: (h - photoSize) / 2, w: photoSize, h: photoSize, src } },
        { name: "Brand label", layer: { kind: "text", x: 64, y: 96, text: brand, fontSize: 16, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 2.5, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 64, y: 140, text: p.headline, fontSize: 96, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - photoSize - 160 } },
        { name: "Subhead", layer: { kind: "text", x: 64, y: 380, text: p.sub, fontSize: 22, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.85, width: w - photoSize - 160 } },
        { name: "CTA button", layer: { kind: "rect", x: 64, y: 470, w: 220, h: 62, fill: "#0b0d12", radius: 31 } },
        { name: "CTA text", layer: { kind: "text", x: 64, y: 490, text: `${p.cta}  →`, fontSize: 18, weight: "600", family: "Inter", fill: "#ffffff", width: 220, align: "center" } },
      ];
    }
    case "square": {
      // Accent bg, top brand, massive headline, framed photo bottom-right corner
      const photoSize = Math.round(w * 0.42);
      return [
        { name: "Accent background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: w - photoSize - 60, y: h - photoSize - 60, w: photoSize, h: photoSize, src } },
        { name: "Brand label", layer: { kind: "text", x: 60, y: 60, text: brand, fontSize: 18, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 3, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 60, y: 140, text: p.headline, fontSize: 156, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 120 } },
        { name: "Subhead", layer: { kind: "text", x: 60, y: h - photoSize - 30, text: p.sub, fontSize: 24, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.85, width: w - photoSize - 140 } },
        { name: "CTA button", layer: { kind: "rect", x: 60, y: h - 100, w: 280, h: 70, fill: "#0b0d12", radius: 35 } },
        { name: "CTA text", layer: { kind: "text", x: 60, y: h - 76, text: `${p.cta}  →`, fontSize: 22, weight: "600", family: "Inter", fill: "#ffffff", width: 280, align: "center" } },
      ];
    }
    case "tall": {
      // Photo in middle band, big type above and CTA below
      const photoH = Math.round(h * 0.40);
      const photoY = Math.round(h * 0.42);
      return [
        { name: "Accent background", layer: { kind: "rect", x: 0, y: 0, w, h, fill: p.accent } },
        { name: "Background photo", layer: { kind: "image", x: 0, y: photoY, w, h: photoH, src } },
        { name: "Brand label", layer: { kind: "text", x: 72, y: 120, text: brand, fontSize: 26, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 72, y: 180, text: p.headline, fontSize: 154, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 144 } },
        { name: "Subhead", layer: { kind: "text", x: 72, y: photoY + photoH + 60, text: p.sub, fontSize: 32, weight: "400", family: "Inter", fill: p.accentText, opacity: 0.85, width: w - 144 } },
        { name: "CTA button", layer: { kind: "rect", x: 72, y: h - 200, w: 360, h: 88, fill: "#0b0d12", radius: 44 } },
        { name: "CTA text", layer: { kind: "text", x: 72, y: h - 172, text: `${p.cta}  →`, fontSize: 28, weight: "600", family: "Inter", fill: "#ffffff", width: 360, align: "center" } },
      ];
    }
  }
}

// ===========================================================================
//  STYLE E — Diagonal Stripe (photo bg + diagonal accent stripe holding text)
// ===========================================================================
function styleDiagonal(p: Pack, w: number, h: number, src: string): Spec {
  const shape = pickShape(w, h);
  const brand = p.brand.toUpperCase();
  // Diagonal achieved by rotating a wide rect — exact text overlay sits on top
  switch (shape) {
    case "tiny": {
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Shade overlay", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.35 } },
        { name: "Diagonal stripe", layer: { kind: "rect", x: -50, y: 90, w: w + 100, h: 90, fill: p.accent, rotation: -8 } },
        { name: "Brand label", layer: { kind: "text", x: 14, y: 14, text: brand, fontSize: 10, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 1.4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 18, y: 112, text: p.headline.replace(/\n/g, " "), fontSize: 20, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 36 } },
        { name: "CTA text", layer: { kind: "text", x: 14, y: h - 24, text: `${p.cta}  →`, fontSize: 11, weight: "700", family: "Inter", fill: "#ffffff", letterSpacing: 0.8 } },
      ];
    }
    case "leaderboard": {
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Shade overlay", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.45 } },
        { name: "Diagonal stripe", layer: { kind: "rect", x: -40, y: 18, w: Math.round(w * 0.55), h: 60, fill: p.accent, rotation: -4 } },
        { name: "Brand label", layer: { kind: "text", x: 22, y: 14, text: brand, fontSize: 9, weight: "600", family: "Inter", fill: p.accentText, opacity: 0.85, letterSpacing: 1.6, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 22, y: 32, text: p.headline.replace(/\n/g, " "), fontSize: 22, weight: "900", family: "Playfair Display", fill: p.accentText, width: Math.round(w * 0.50) } },
        { name: "CTA button", layer: { kind: "rect", x: w - 140, y: (h - 32) / 2, w: 120, h: 32, fill: "#ffffff", radius: 16 } },
        { name: "CTA text", layer: { kind: "text", x: w - 140, y: (h - 32) / 2 + 8, text: `${p.cta}  →`, fontSize: 12, weight: "600", family: "Inter", fill: "#0b0d12", width: 120, align: "center" } },
      ];
    }
    case "wide": {
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Shade overlay", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.40 } },
        { name: "Diagonal stripe", layer: { kind: "rect", x: -80, y: 200, w: Math.round(w * 0.75), h: 260, fill: p.accent, rotation: -7 } },
        { name: "Brand label", layer: { kind: "text", x: 64, y: 64, text: brand, fontSize: 16, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 2.5, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 64, y: 240, text: p.headline, fontSize: 78, weight: "900", family: "Playfair Display", fill: p.accentText, width: Math.round(w * 0.62) } },
        { name: "Subhead", layer: { kind: "text", x: 64, y: 460, text: p.sub, fontSize: 22, weight: "400", family: "Inter", fill: "#ffffff", width: Math.round(w * 0.55) } },
        { name: "CTA button", layer: { kind: "rect", x: w - 280, y: h - 110, w: 220, h: 62, fill: "#ffffff", radius: 31 } },
        { name: "CTA text", layer: { kind: "text", x: w - 280, y: h - 90, text: `${p.cta}  →`, fontSize: 18, weight: "600", family: "Inter", fill: "#0b0d12", width: 220, align: "center" } },
      ];
    }
    case "square": {
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Shade overlay", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.35 } },
        { name: "Diagonal stripe", layer: { kind: "rect", x: -100, y: 580, w: w + 200, h: 200, fill: p.accent, rotation: -8 } },
        { name: "Brand label", layer: { kind: "text", x: 60, y: 60, text: brand, fontSize: 18, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 3, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 60, y: 620, text: p.headline, fontSize: 88, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 120 } },
        { name: "Subhead", layer: { kind: "text", x: 60, y: 820, text: p.sub, fontSize: 24, weight: "400", family: "Inter", fill: "#ffffff", width: w - 120 } },
        { name: "CTA button", layer: { kind: "rect", x: 60, y: 950, w: 280, h: 70, fill: "#ffffff", radius: 35 } },
        { name: "CTA text", layer: { kind: "text", x: 60, y: 974, text: `${p.cta}  →`, fontSize: 22, weight: "600", family: "Inter", fill: "#0b0d12", width: 280, align: "center" } },
      ];
    }
    case "tall": {
      return [
        { name: "Background photo", layer: { kind: "image", x: 0, y: 0, w, h, src } },
        { name: "Shade overlay", layer: { kind: "rect", x: 0, y: 0, w, h, fill: "#000000", opacity: 0.40 } },
        { name: "Diagonal stripe", layer: { kind: "rect", x: -150, y: 1260, w: w + 300, h: 320, fill: p.accent, rotation: -7 } },
        { name: "Brand label", layer: { kind: "text", x: 72, y: 110, text: brand, fontSize: 26, weight: "600", family: "Inter", fill: "#ffffff", letterSpacing: 4, uppercase: true } },
        { name: "Headline", layer: { kind: "text", x: 72, y: 1320, text: p.headline, fontSize: 124, weight: "900", family: "Playfair Display", fill: p.accentText, width: w - 144 } },
        { name: "Subhead", layer: { kind: "text", x: 72, y: 1620, text: p.sub, fontSize: 32, weight: "400", family: "Inter", fill: "#ffffff", width: w - 144 } },
        { name: "CTA button", layer: { kind: "rect", x: 72, y: 1740, w: 360, h: 88, fill: "#ffffff", radius: 44 } },
        { name: "CTA text", layer: { kind: "text", x: 72, y: 1768, text: `${p.cta}  →`, fontSize: 28, weight: "600", family: "Inter", fill: "#0b0d12", width: 360, align: "center" } },
      ];
    }
  }
}

const STYLES = [
  { key: "editorial-hero", fn: styleEditorialHero },
  { key: "solid-split", fn: styleSolidSplit },
  { key: "top-card", fn: styleTopCard },
  { key: "mega-type", fn: styleMegaType },
  { key: "diagonal", fn: styleDiagonal },
];

// ===========================================================================
//  Spec → Konva layers
// ===========================================================================
function specToLayers(spec: Spec) {
  return spec.map(({ name, layer }) => {
    const common = {
      id: lid(layer.kind),
      name,
      rotation: layer.kind === "rect" ? layer.rotation ?? 0 : 0,
      opacity:
        layer.kind === "rect" || layer.kind === "text"
          ? layer.opacity ?? 1
          : 1,
      visible: true,
      locked: false,
    };
    switch (layer.kind) {
      case "image":
        return { ...common, type: "image" as const, x: layer.x, y: layer.y, width: layer.w, height: layer.h, src: layer.src };
      case "rect":
        return { ...common, type: "rect" as const, x: layer.x, y: layer.y, width: layer.w, height: layer.h, fill: layer.fill, cornerRadius: layer.radius ?? 0 };
      case "text":
        return {
          ...common,
          type: "text" as const,
          x: layer.x,
          y: layer.y,
          text: layer.uppercase ? layer.text.toUpperCase() : layer.text,
          fontSize: layer.fontSize,
          fontFamily: layer.family,
          fontStyle: layer.italic ? "italic" : ("normal" as const),
          fontWeight: layer.weight,
          align: layer.align ?? "left",
          fill: layer.fill,
          width: layer.width,
        };
    }
  });
}

// ===========================================================================
//  Spec → HTML for PNG thumbnail rendering
// ===========================================================================
function specToHtml(spec: Spec, w: number, h: number) {
  const body = spec
    .map(({ layer }) => {
      if (layer.kind === "image") {
        return `<img src="${layer.src}" crossorigin="anonymous" style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;height:${layer.h}px;object-fit:cover">`;
      }
      if (layer.kind === "rect") {
        const transform = layer.rotation ? `transform:rotate(${layer.rotation}deg);transform-origin:top left;` : "";
        return `<div style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;height:${layer.h}px;background:${layer.fill};opacity:${layer.opacity ?? 1};border-radius:${layer.radius ?? 0}px;${transform}"></div>`;
      }
      const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
      const lh = layer.family === "Playfair Display" ? 1.0 : 1.3;
      const style = [
        "position:absolute",
        `left:${layer.x}px`,
        `top:${layer.y}px`,
        layer.width ? `width:${layer.width}px` : "",
        `font-family:'${layer.family}',serif`,
        `font-size:${layer.fontSize}px`,
        `font-weight:${layer.weight}`,
        layer.italic ? "font-style:italic" : "",
        `color:${layer.fill}`,
        layer.opacity !== undefined && layer.opacity !== 1 ? `opacity:${layer.opacity}` : "",
        `line-height:${lh}`,
        `text-align:${layer.align ?? "left"}`,
        layer.letterSpacing ? `letter-spacing:${layer.letterSpacing}px` : "",
        "white-space:pre-line",
        "margin:0",
      ]
        .filter(Boolean)
        .join(";");
      return `<div style="${style}">${escapeHtml(text)}</div>`;
    })
    .join("");
  return `<!doctype html><html><head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden;background:#0e0e0e;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}</style>
</head><body><div style="position:relative;width:${w}px;height:${h}px;overflow:hidden">${body}</div></body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}

// ===========================================================================
//  Main
// ===========================================================================
async function main() {
  await mkdir(PREVIEW_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });

  console.log("· clearing prior banner-* templates");
  await db.delete(templates).where(like(templates.slug, "banner-%"));

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  let ok = 0;
  let failed = 0;
  let idx = 0;
  const total = PACKS.length * SIZES.length;
  try {
    for (let pi = 0; pi < PACKS.length; pi++) {
      const p = PACKS[pi];
      for (let si = 0; si < SIZES.length; si++) {
        const { w, h, label } = SIZES[si];
        idx++;
        // Style assignment: (packIdx + sizeIdx*2) % numStyles — gives a unique
        // style per (pack, size) cell and rotates so packs use every style.
        const styleIdx = (pi + si * 2) % STYLES.length;
        const style = STYLES[styleIdx];
        const photoId = p.photos[(styleIdx + si) % p.photos.length];
        const src = photoUrl(photoId, w, h);
        const slug = `banner-${p.key}-${w}x${h}`;
        console.log(`[${idx}/${total}] ${slug.padEnd(38)} ${style.key.padEnd(16)} (${label})`);

        try {
          const spec = style.fn(p, w, h, src);
          const layers = specToLayers(spec);
          const html = specToHtml(spec, w, h);

          const previewPath = resolve(PREVIEW_DIR, `${slug}.html`);
          await writeFile(previewPath, html, "utf8");

          const thumbPath = resolve(THUMB_DIR, `${slug}.png`);
          await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
          await page.goto(pathToFileURL(previewPath).href, {
            waitUntil: ["load", "networkidle0"],
            timeout: 90_000,
          });
          await page.evaluate(async () => {
            // @ts-expect-error fonts widely supported
            if (document.fonts?.ready) await document.fonts.ready;
            const imgs = Array.from(document.images);
            await Promise.all(
              imgs.map(
                (img) =>
                  new Promise<void>((res) => {
                    if (img.complete && img.naturalWidth > 0) return res();
                    img.addEventListener("load", () => res(), { once: true });
                    img.addEventListener("error", () => res(), { once: true });
                    setTimeout(() => res(), 8000);
                  }),
              ),
            );
            await new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(() => r(null))),
            );
          });
          await new Promise((r) => setTimeout(r, 800));
          await page.screenshot({
            path: thumbPath as `${string}.png`,
            type: "png",
            clip: { x: 0, y: 0, width: w, height: h },
          });

          await db.insert(templates).values({
            id: uid("tpl"),
            slug,
            name: `${p.brand} · ${w}×${h}`,
            category: p.category,
            tagline: `${label} — ${p.headline.replace(/\n/g, " ")}`,
            document: {
              canvasSize: { width: w, height: h },
              background: "#0e0e0e",
              layers,
            },
            tier: w * h > 250_000 ? "pro" : "free",
            published: true,
            listingStatus: "approved",
            priceCents: 0,
            downloads: 0,
            // Leave thumbnailUrl null — DocumentThumbnail's inline-SVG
            // fallback renders the layers directly (image + rect + text).
            // No /public files or API routes involved, so regenerating
            // banners never needs a Next.js rebuild.
            thumbnailUrl: null,
          });
          ok++;
        } catch (err) {
          failed++;
          console.error(`   ✗ failed:`, (err as Error).message);
        }
      }
    }
  } finally {
    await browser.close();
    await pool.end();
  }

  console.log(`\n• done: ${ok} generated, ${failed} failed (of ${total})\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
