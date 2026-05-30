"use client";

/**
 * Client-side helpers for Better-Auth. Use anywhere you need the current
 * session in a React component:
 *
 *   const { data: session } = authClient.useSession();
 *   await authClient.signIn.email({ email, password });
 *   await authClient.signOut();
 *
 * NOTE: we deliberately do NOT pass `baseURL` here. Better-Auth's client
 * defaults to `window.location.origin`, which means the same compiled bundle
 * works equally well on localhost, the Cloudflare tunnel, or a future custom
 * domain — no rebuild required when the public URL changes. Hard-coding the
 * URL would trap us behind the build-time value baked into the JS chunk.
 */
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
