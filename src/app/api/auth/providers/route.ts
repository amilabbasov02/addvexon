/**
 * Returns which social providers are configured server-side. The client uses
 * this to conditionally render OAuth buttons — no point showing "Continue
 * with Google" if GOOGLE_CLIENT_ID isn't set, the click would just error.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
