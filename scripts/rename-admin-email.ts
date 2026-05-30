/**
 * Migrate the admin account email from admin@advexa.io → admin@addvoxen.com.
 *
 * Touches every place better-auth + the app store the email:
 *   - users.email           (primary key for ADMIN_EMAILS lookup)
 *   - accounts.account_id   (credential id for the password provider)
 *
 * Idempotent: re-running with the new email already in place is a no-op.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { Pool } from "pg";

const OLD = "admin@advexa.io";
const NEW = "admin@addvoxen.com";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const u = await c.query(
      "UPDATE users SET email = $1 WHERE email = $2 RETURNING id",
      [NEW, OLD],
    );
    if (u.rowCount === 0) {
      const already = await c.query(
        "SELECT id FROM users WHERE email = $1",
        [NEW],
      );
      if (already.rowCount === 0) {
        throw new Error(`No user found with email ${OLD} or ${NEW}`);
      }
      console.log(`· admin already migrated (${NEW})`);
      await c.query("COMMIT");
      return;
    }
    const adminId = u.rows[0].id as string;
    // Better-Auth's credential account stores the email in account_id for
    // provider_id='credential'. Update that too so password sign-in works.
    const a = await c.query(
      `UPDATE accounts
         SET account_id = $1
       WHERE user_id = $2
         AND provider_id = 'credential'
         AND account_id = $3`,
      [NEW, adminId, OLD],
    );
    console.log(
      `· users.email updated for ${adminId}, ` +
        `${a.rowCount ?? 0} credential account_id(s) updated`,
    );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
