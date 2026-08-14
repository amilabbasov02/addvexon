/**
 * Job queue tick.
 *
 *   GET /api/cron/jobs   → claim and run due background jobs
 *
 * Called by Vercel Cron every minute (see vercel.json). Vercel signs cron
 * requests with CRON_SECRET; we also accept the same value as a bearer token so
 * the queue can be advanced manually during development.
 *
 * Runs on the Node runtime because the pipeline uses node:dns and node:net for
 * SSRF checks, which the edge runtime does not provide.
 */
import { NextRequest, NextResponse } from "next/server";
import { drainJobs } from "@/lib/jobs/runner";
import { registerAllJobHandlers } from "@/lib/jobs/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** A drain can run two jobs; give it room without hitting the platform cap. */
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  registerAllJobHandlers();

  try {
    const result = await drainJobs();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/jobs] drain failed", err);
    return NextResponse.json(
      { error: "Job drain failed" },
      { status: 500 },
    );
  }
}
