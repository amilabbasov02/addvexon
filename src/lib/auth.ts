/**
 * Better-Auth server-side configuration.
 *
 * Why Better-Auth: self-hosted, open-source, type-safe, plays nicely with
 * Next.js App Router. Drizzle adapter writes directly into our schema
 * (`users` / `sessions` / `accounts` / `verifications`).
 *
 * Auth methods enabled out of the gate:
 *   - Email + password (most users)
 *   - Magic link via Resend  (passwordless, low-friction)
 *   - Google OAuth          (one-tap signup, lifted later)
 *
 * Side-effect on signup: a personal workspace is created automatically so
 * the user can save documents immediately.
 */
import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db";
import {
  users,
  sessions,
  accounts,
  verifications,
  workspaces,
  workspaceMembers,
} from "@/db/schema";
import { sendEmail } from "@/lib/email";

const BASE_URL =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3210";

/**
 * Trust localhost + the configured BASE_URL + Vercel preview/production URLs
 * + any additional origins listed in PUBLIC_TUNNEL_URL (Cloudflare quick
 * tunnel for demos).
 *
 * Vercel sets VERCEL_URL automatically on every deployment so previews
 * (addvexon-abc123.vercel.app) and production (addvexon.vercel.app) can
 * sign in without us hard-coding each one.
 */
const VERCEL_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;
const VERCEL_BRANCH_URL = process.env.VERCEL_BRANCH_URL
  ? `https://${process.env.VERCEL_BRANCH_URL}`
  : null;
const VERCEL_PROJECT_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : null;

const TRUSTED_ORIGINS = Array.from(
  new Set(
    [
      "http://localhost:3210",
      "http://localhost:3000",
      BASE_URL,
      VERCEL_URL,
      VERCEL_BRANCH_URL,
      VERCEL_PROJECT_URL,
      // Custom domains alongside the vercel.app one
      "https://addvoxen.com",
      "https://www.addvoxen.com",
      "https://addvexon.vercel.app",
      "https://addvoxen.vercel.app",
      ...(process.env.PUBLIC_TUNNEL_URL ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ].filter((s): s is string => !!s),
  ),
);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36).slice(-4)}`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export const auth = betterAuth({
  baseURL: BASE_URL,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "fallback_dev_secret_do_not_use_in_production",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { users, sessions, accounts, verifications },
    // Our tables are plural ("users", "sessions", …) while Better-Auth defaults
    // to singular ("user", "session"). This flag maps between the two.
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Addvoxen password",
        text: `Click here to reset your password: ${url}\n\nIf you didn't request this, ignore this email.`,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Addvoxen email",
        text: `Welcome to Addvoxen! Verify your email: ${url}`,
      });
    },
    sendOnSignUp: false, // do not block initial signup — non-verified can still sign in
    autoSignInAfterVerification: true,
  },

  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
      }
    : undefined,

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Your Addvoxen sign-in link",
          text: `Click to sign in: ${url}\nThis link expires in 5 minutes.`,
        });
      },
    }),
  ],

  /**
   * On first signup: create the user's default workspace + membership row.
   * Better-Auth fires this hook AFTER the user row is written.
   */
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const workspaceId = uid("ws");
            const baseSlug =
              slugify(user.name ?? user.email.split("@")[0] ?? "workspace") ||
              "workspace";
            const slug = `${baseSlug}-${workspaceId.slice(-6)}`;
            await db.insert(workspaces).values({
              id: workspaceId,
              ownerId: user.id,
              name: `${user.name ?? user.email.split("@")[0]}'s Workspace`,
              slug,
            });
            await db.insert(workspaceMembers).values({
              id: uid("wm"),
              workspaceId,
              userId: user.id,
              role: "owner",
            });
          } catch (err) {
            // Don't block signup if workspace creation fails — log and continue.
            // Production: report to Sentry.
            console.error("Failed to create default workspace:", err);
          }
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh after 1 day of activity
  },

  advanced: {
    cookiePrefix: "addvoxen",
    // Demo via Cloudflare quick tunnel runs over HTTPS — cookies must be
    // SameSite=None + Secure to survive the cross-origin auth round-trip.
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      secure: BASE_URL.startsWith("https"),
      sameSite: BASE_URL.startsWith("https") ? "none" : "lax",
    },
  },

  trustedOrigins: TRUSTED_ORIGINS,
});

export type Auth = typeof auth;
