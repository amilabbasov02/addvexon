/**
 * Catch-all auth endpoint. Better-Auth handles every sub-route
 * (/api/auth/sign-in, /api/auth/sign-up, /api/auth/callback/google, …)
 * through this single handler.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
