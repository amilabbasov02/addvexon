/**
 * Bootstrap a dedicated admin account.
 *
 *   npx tsx scripts/admin-create.ts [email]
 *
 * Steps:
 *  1. Generate a strong random password
 *  2. Sign up via Better-Auth so password hashing + workspace creation
 *     follow the standard flow
 *  3. Upgrade the user to plan=enterprise + email_verified=true so all
 *     premium features are unlocked from day one
 *  4. Print the credentials — copy them somewhere safe IMMEDIATELY,
 *     they are not stored anywhere recoverable
 *
 * After running, ADMIN_EMAILS in .env.local must include this address.
 * The script tries to update .env.local automatically (best effort).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { users } from "../src/db/schema";

function genPassword(length = 16) {
  // Mix of letters + digits + a few symbols — easy to copy, hard to guess.
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%^&*-_=+?";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function main() {
  const email = (process.argv[2] ?? "admin@addvoxen.io").toLowerCase();
  const password = genPassword(16);
  const name = "Addvoxen Admin";

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3210";
  console.log(`\n→ Creating admin via ${baseUrl}/api/auth/sign-up/email`);
  console.log(`  email: ${email}`);

  const resp = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Better-Auth requires Origin to match BASE_URL / trustedOrigins
      Origin: baseUrl,
    },
    body: JSON.stringify({ email, password, name }),
  });
  const data = (await resp.json()) as
    | { user: { id: string }; token?: string }
    | { error?: { message?: string } };
  if (!resp.ok || !("user" in data)) {
    console.error("✗ Sign-up failed:", data);
    process.exit(1);
  }
  const userId = data.user.id;
  console.log(`✓ User created (id: ${userId})`);

  // Upgrade plan + verify email
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { users } });
  await db
    .update(users)
    .set({
      plan: "enterprise",
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  await pool.end();
  console.log("✓ Plan upgraded to enterprise + email marked verified");

  // Best-effort: update ADMIN_EMAILS in .env.local
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    let envText = await readFile(envPath, "utf8");
    const match = envText.match(/^ADMIN_EMAILS=["']?([^"'\n]*)["']?$/m);
    if (match) {
      const existing = match[1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (!existing.includes(email)) {
        existing.push(email);
        envText = envText.replace(
          /^ADMIN_EMAILS=.*$/m,
          `ADMIN_EMAILS="${existing.join(",")}"`,
        );
        await writeFile(envPath, envText, "utf8");
        console.log(`✓ Added ${email} to ADMIN_EMAILS in .env.local`);
      } else {
        console.log(`· ${email} already in ADMIN_EMAILS`);
      }
    } else {
      envText += `\nADMIN_EMAILS="${email}"\n`;
      await writeFile(envPath, envText, "utf8");
      console.log(`✓ Added ADMIN_EMAILS="${email}" to .env.local`);
    }
  } catch (err) {
    console.warn(
      `! Could not auto-update .env.local. Add manually:  ADMIN_EMAILS="${email}"`,
      err,
    );
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  CREDENTIALS  — copy NOW, this is the only time shown");
  console.log("──────────────────────────────────────────────────────────");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("══════════════════════════════════════════════════════════\n");
  console.log(
    "Next: restart the server so .env.local takes effect, then sign in at /signin.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
