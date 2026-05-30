/**
 * Auto-generate a `handle` for every user that doesn't have one yet.
 *
 *   "Amil Abbasov" → amil-abbasov
 *   collision      → amil-abbasov2, amil-abbasov3, …
 *
 * Rules match the /api/profile validator: 3–20 chars, [a-z0-9_] only.
 * (We use `_` as a separator instead of `-` since the validator expects
 * underscores; URLs with underscores still look clean.)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18) || "user";
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const users = await pool.query<{
      id: string;
      email: string;
      name: string | null;
    }>(
      `SELECT u.id, u.email, u.name
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE p.handle IS NULL`,
    );
    console.log(`Found ${users.rowCount} users without a handle`);

    for (const u of users.rows) {
      const base = slugify(u.name ?? u.email.split("@")[0]);
      let handle = base;
      let n = 2;
      // Guarantee uniqueness — try base, base2, base3 …
      while (true) {
        const clash = await pool.query(
          `SELECT 1 FROM user_profiles WHERE handle = $1 LIMIT 1`,
          [handle],
        );
        if ((clash.rowCount ?? 0) === 0) break;
        handle = `${base}${n}`.slice(0, 20);
        n++;
        if (n > 999) {
          handle = `${base}_${Math.random().toString(36).slice(2, 6)}`.slice(0, 20);
          break;
        }
      }
      // Upsert the profile row
      await pool.query(
        `INSERT INTO user_profiles (user_id, handle, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE
           SET handle = EXCLUDED.handle, updated_at = NOW()`,
        [u.id, handle],
      );
      console.log(`  ${u.email.padEnd(40)} → @${handle}`);
    }
    console.log("\nDone.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
