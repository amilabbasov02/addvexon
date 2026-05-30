/**
 * Manually upgrade a user's plan. Use this until our own billing/banking
 * integration is in place.
 *
 *   npx tsx scripts/admin-upgrade-user.ts <email> <plan>
 *
 * <plan> is one of: free | pro | team | enterprise
 *
 * Updates users.plan and marks any matching waitlist row as converted.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { users, waitlist } from "../src/db/schema";

const VALID = new Set(["free", "pro", "team", "enterprise"]);

async function main() {
  const [, , email, plan = "pro"] = process.argv;
  if (!email) {
    console.error(
      "usage: npx tsx scripts/admin-upgrade-user.ts <email> [free|pro|team|enterprise]",
    );
    process.exit(1);
  }
  if (!VALID.has(plan)) {
    console.error(`✗ invalid plan: ${plan}. Allowed: ${[...VALID].join(", ")}`);
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { users, waitlist } });

  try {
    const found = await db
      .select({ id: users.id, email: users.email, plan: users.plan })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (found.length === 0) {
      console.error(`✗ user not found: ${email}`);
      console.error(
        "  They need to sign up first (then run this command again).",
      );
      process.exit(1);
    }
    const u = found[0];
    if (u.plan === plan) {
      console.log(`· ${email} already on plan "${plan}" — nothing to do.`);
      return;
    }

    await db
      .update(users)
      .set({ plan, updatedAt: new Date() })
      .where(eq(users.id, u.id));

    // Mark waitlist row(s) as converted, if any.
    await db
      .update(waitlist)
      .set({ convertedAt: new Date() })
      .where(eq(waitlist.email, email));

    console.log(`✓ ${email}: "${u.plan}" → "${plan}"`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
