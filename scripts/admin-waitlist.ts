/**
 * List waitlist signups, optionally filtered.
 *
 *   npx tsx scripts/admin-waitlist.ts                  → all entries
 *   npx tsx scripts/admin-waitlist.ts --plan=team
 *   npx tsx scripts/admin-waitlist.ts --pending        → not yet contacted
 *   npx tsx scripts/admin-waitlist.ts --converted      → already upgraded
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { and, eq, isNull, isNotNull, desc, type SQL } from "drizzle-orm";
import { waitlist } from "../src/db/schema";

async function main() {
  const argv = process.argv.slice(2);
  const planArg = argv.find((a) => a.startsWith("--plan="))?.split("=")[1];
  const pending = argv.includes("--pending");
  const converted = argv.includes("--converted");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { waitlist } });

  const conds: SQL[] = [];
  if (planArg) conds.push(eq(waitlist.plan, planArg));
  if (pending) conds.push(isNull(waitlist.contactedAt));
  if (converted) conds.push(isNotNull(waitlist.convertedAt));

  const rows = await db
    .select()
    .from(waitlist)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(waitlist.createdAt))
    .limit(200);

  if (rows.length === 0) {
    console.log("(no waitlist entries)");
    await pool.end();
    return;
  }

  console.log(
    `\nWaitlist (${rows.length} ${rows.length === 1 ? "entry" : "entries"}):\n`,
  );
  for (const r of rows) {
    const status = r.convertedAt
      ? "✓ converted"
      : r.contactedAt
        ? "→ contacted"
        : "• pending";
    console.log(`${status}  ${r.email}  [${r.plan}]`);
    if (r.name || r.company) {
      console.log(`            ${[r.name, r.company].filter(Boolean).join(" · ")}`);
    }
    if (r.notes) {
      console.log(`            note: ${r.notes.slice(0, 100)}`);
    }
    console.log(
      `            joined ${r.createdAt.toISOString().slice(0, 10)}`,
    );
    console.log("");
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
