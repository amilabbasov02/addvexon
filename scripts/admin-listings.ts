/**
 * Marketplace listing moderation.
 *
 *   npx tsx scripts/admin-listings.ts                 → pending listings
 *   npx tsx scripts/admin-listings.ts approve <slug>  → publish
 *   npx tsx scripts/admin-listings.ts reject  <slug>  → reject
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc } from "drizzle-orm";
import { templates } from "../src/db/schema";

async function main() {
  const [, , cmd, slug] = process.argv;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { templates } });

  try {
    if (!cmd || cmd === "list") {
      const rows = await db
        .select({
          slug: templates.slug,
          name: templates.name,
          category: templates.category,
          priceCents: templates.priceCents,
          listingStatus: templates.listingStatus,
          createdBy: templates.createdBy,
          createdAt: templates.createdAt,
        })
        .from(templates)
        .where(eq(templates.listingStatus, "pending"))
        .orderBy(desc(templates.createdAt));
      if (rows.length === 0) {
        console.log("No pending listings.");
        return;
      }
      console.log(`\n${rows.length} pending listing(s):\n`);
      for (const r of rows) {
        console.log(
          `  ${r.slug}  $${(r.priceCents / 100).toFixed(2)}  ${r.name}  (${r.category})  by ${r.createdBy ?? "—"}  @ ${r.createdAt.toISOString().slice(0, 10)}`,
        );
      }
      console.log("\nApprove with:  npx tsx scripts/admin-listings.ts approve <slug>");
      return;
    }

    if (cmd === "approve" || cmd === "reject") {
      if (!slug) {
        console.error("usage: ... " + cmd + " <slug>");
        process.exit(1);
      }
      const status = cmd === "approve" ? "approved" : "rejected";
      const r = await db
        .update(templates)
        .set({ listingStatus: status, updatedAt: new Date() })
        .where(eq(templates.slug, slug))
        .returning({ slug: templates.slug, status: templates.listingStatus });
      if (r.length === 0) {
        console.error(`✗ no listing with slug "${slug}"`);
        process.exit(1);
      }
      console.log(`✓ ${slug}: ${status}`);
      return;
    }

    console.error("Unknown command. Try: list | approve <slug> | reject <slug>");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
