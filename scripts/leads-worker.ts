/**
 * Local background job worker.
 *
 * In production Vercel Cron calls /api/cron/jobs every minute. Locally there is
 * no cron, so this polls the same queue in a loop — start it in a second
 * terminal and searches started from the UI will actually run.
 *
 *   pnpm leads:work
 *
 * It calls the same `drainJobs()` the cron route does, so what you see here is
 * exactly what production will do.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

const POLL_MS = 3000;

async function main() {
  // Imported after env is loaded — the db module reads DATABASE_URL on import.
  const { drainJobs } = await import("../src/lib/jobs/runner");
  const { registerAllJobHandlers } = await import("../src/lib/jobs/handlers");

  registerAllJobHandlers();

  console.log("Lead Finder worker running. Ctrl+C to stop.\n");

  let idleTicks = 0;
  for (;;) {
    try {
      const result = await drainJobs();
      if (result.processed || result.failed || result.reaped) {
        const stamp = new Date().toLocaleTimeString();
        console.log(
          `[${stamp}] processed=${result.processed} failed=${result.failed} reaped=${result.reaped}`,
        );
        idleTicks = 0;
      } else if (++idleTicks % 20 === 0) {
        // A quiet heartbeat so it's obvious the worker is alive, without
        // scrolling a line every three seconds.
        console.log(`[${new Date().toLocaleTimeString()}] idle`);
      }
    } catch (err) {
      console.error("worker error:", err instanceof Error ? err.message : err);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

main().catch((err) => {
  console.error("Worker failed to start:", err instanceof Error ? err.message : err);
  process.exit(1);
});
