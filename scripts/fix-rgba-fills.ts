/**
 * Walk every banner-* template's layers and convert any `rgba(r,g,b,a)` fill
 * into solid `#RRGGBB` hex + a matching `opacity`. HTML `<input type="color">`
 * only accepts hex, so layers with rgba fills make the editor's color picker
 * unusable — this normalises them while preserving the visual alpha effect.
 *
 *   { fill: "rgba(255,255,255,0.85)", opacity: 1 }
 *   → { fill: "#ffffff",              opacity: 0.85 }
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql, like } from "drizzle-orm";
import { templates } from "../src/db/schema";

const RGBA_RE = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

function rgbaToHexOpacity(value: string): { hex: string; alpha: number } | null {
  const m = value.match(RGBA_RE);
  if (!m) return null;
  const [, r, g, b, a] = m;
  const hex =
    "#" +
    [r, g, b]
      .map((x) => parseInt(x, 10).toString(16).padStart(2, "0"))
      .join("");
  return { hex, alpha: a !== undefined ? parseFloat(a) : 1 };
}

type Layer = {
  fill?: string;
  opacity?: number;
  [k: string]: unknown;
};

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  try {
    const rows = await db
      .select({ id: templates.id, slug: templates.slug, document: templates.document })
      .from(templates)
      .where(like(templates.slug, "banner-%"));

    let touched = 0;
    let layersFixed = 0;
    for (const row of rows) {
      const doc = row.document as { layers: Layer[]; [k: string]: unknown };
      if (!doc?.layers) continue;
      let changedThisRow = false;
      for (const layer of doc.layers) {
        if (typeof layer.fill !== "string") continue;
        const parsed = rgbaToHexOpacity(layer.fill);
        if (!parsed) continue;
        layer.fill = parsed.hex;
        // Multiply existing opacity by the alpha channel so combined effect
        // matches what the rgba fill produced before.
        const prevOpacity = typeof layer.opacity === "number" ? layer.opacity : 1;
        layer.opacity = Math.max(0, Math.min(1, prevOpacity * parsed.alpha));
        changedThisRow = true;
        layersFixed++;
      }
      if (changedThisRow) {
        await db
          .update(templates)
          .set({ document: doc as never })
          .where(sql`id = ${row.id}`);
        touched++;
      }
    }
    console.log(`· fixed ${layersFixed} rgba fills across ${touched} templates`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
