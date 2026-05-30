import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { templates } from "../src/db/schema";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });
  const rows = await db
    .select()
    .from(templates)
    .where(eq(templates.slug, "banner-fashion-1080x1080"));
  const doc = rows[0].document as {
    canvasSize: { width: number; height: number };
    layers: Array<{ type: string; name: string; text?: string; src?: string }>;
  };
  console.log(`canvas: ${doc.canvasSize.width}x${doc.canvasSize.height}`);
  console.log(`layers: ${doc.layers.length}`);
  for (const l of doc.layers) {
    const detail = l.type === "text" ? `"${l.text?.substring(0, 40)}"` : l.type === "image" ? `[${l.src}]` : "";
    console.log(`  ${l.type.padEnd(6)} ${l.name.padEnd(20)} ${detail}`);
  }
  await pool.end();
}
main();
