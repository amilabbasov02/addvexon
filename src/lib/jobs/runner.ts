/**
 * Database-backed job runner.
 *
 * A cron endpoint calls `drainJobs()` every minute. Each invocation claims a
 * small number of due jobs and runs them to completion. Claiming uses
 * `FOR UPDATE SKIP LOCKED`, so two overlapping cron runs — or a manual "run
 * now" from the UI — never process the same job twice.
 *
 * There is no external queue on purpose. The workload is a handful of searches
 * a day, and a table gives us durable progress, crash recovery and per-user
 * visibility with nothing new to pay for or operate. If throughput ever
 * outgrows this, the handler contract below is what a real queue would call —
 * only the claiming changes.
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { backgroundJobs } from "@/db/schema";
import { uid } from "@/lib/ids";
import type { BackgroundJob } from "@/db/schema";

/** How many jobs one cron tick will process before returning. */
const BATCH_SIZE = 2;

/** A job locked for longer than this is assumed dead and is retried. */
const STUCK_AFTER_MINUTES = 15;

/** Exponential-ish backoff between attempts, in seconds. */
const RETRY_BACKOFF_S = [30, 180, 900];

export type JobContext = {
  job: BackgroundJob;
  /** Report progress; safe to call often, it is a single indexed update. */
  setProgress: (progress: number, step?: string) => Promise<void>;
};

export type JobHandler = (ctx: JobContext) => Promise<void>;

const handlers = new Map<string, JobHandler>();

export function registerJobHandler(type: string, handler: JobHandler): void {
  handlers.set(type, handler);
}

export async function enqueueJob(input: {
  userId: string;
  workspaceId: string;
  type: string;
  payload: Record<string, unknown>;
  runAfter?: Date;
}): Promise<string> {
  const id = uid("job");
  await db.insert(backgroundJobs).values({
    id,
    userId: input.userId,
    workspaceId: input.workspaceId,
    type: input.type,
    payload: input.payload,
    status: "queued",
    runAfter: input.runAfter ?? new Date(),
  });
  return id;
}

/**
 * Claim one due job atomically.
 *
 * The UPDATE … WHERE id IN (SELECT … FOR UPDATE SKIP LOCKED) form is the
 * standard Postgres queue pattern: the subselect takes row locks, skips rows
 * another transaction already holds, and the UPDATE flips the status in the
 * same statement — so a job cannot be claimed twice even under concurrency.
 */
async function claimNextJob(): Promise<BackgroundJob | null> {
  const result = await db.execute(sql`
    UPDATE background_jobs
       SET status = 'running',
           locked_at = now(),
           started_at = COALESCE(started_at, now()),
           attempts = attempts + 1
     WHERE id IN (
       SELECT id
         FROM background_jobs
        WHERE status = 'queued'
          AND run_after <= now()
        ORDER BY run_after ASC
        LIMIT 1
          FOR UPDATE SKIP LOCKED
     )
     RETURNING *
  `);

  const row = (result.rows as unknown as BackgroundJob[])[0];
  return row ?? null;
}

/**
 * Return jobs whose worker died mid-run to the queue.
 *
 * Serverless functions get killed without warning, so a `running` row with a
 * stale lock is expected rather than exceptional.
 */
async function reapStuckJobs(): Promise<number> {
  const result = await db.execute(sql`
    UPDATE background_jobs
       SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
           locked_at = NULL,
           error = CASE WHEN attempts >= max_attempts
                        THEN 'Job was interrupted and exceeded its retry limit'
                        ELSE error END,
           finished_at = CASE WHEN attempts >= max_attempts THEN now() ELSE finished_at END
     WHERE status = 'running'
       AND locked_at < now() - interval '${sql.raw(String(STUCK_AFTER_MINUTES))} minutes'
     RETURNING id
  `);
  return result.rows.length;
}

async function setProgress(
  jobId: string,
  progress: number,
  step?: string,
): Promise<void> {
  await db
    .update(backgroundJobs)
    .set({
      progress: Math.max(0, Math.min(100, Math.round(progress))),
      ...(step ? { step } : {}),
    })
    .where(eq(backgroundJobs.id, jobId));
}

async function completeJob(jobId: string): Promise<void> {
  await db
    .update(backgroundJobs)
    .set({
      status: "completed",
      progress: 100,
      finishedAt: new Date(),
      lockedAt: null,
      error: null,
    })
    .where(eq(backgroundJobs.id, jobId));
}

async function failJob(job: BackgroundJob, err: unknown): Promise<void> {
  const message =
    err instanceof Error ? err.message : String(err ?? "Unknown error");

  // Providers mark transient failures; those get another attempt, real bugs
  // don't — retrying a TypeError just wastes three more runs.
  const retryable =
    typeof err === "object" && err !== null && "retryable" in err
      ? Boolean((err as { retryable?: unknown }).retryable)
      : false;

  const canRetry = retryable && job.attempts < job.maxAttempts;
  const backoff =
    RETRY_BACKOFF_S[Math.min(job.attempts - 1, RETRY_BACKOFF_S.length - 1)] ?? 300;

  await db
    .update(backgroundJobs)
    .set({
      status: canRetry ? "queued" : "failed",
      error: message.slice(0, 1000),
      lockedAt: null,
      ...(canRetry
        ? { runAfter: new Date(Date.now() + backoff * 1000) }
        : { finishedAt: new Date() }),
    })
    .where(eq(backgroundJobs.id, job.id));
}

/** Process up to BATCH_SIZE due jobs. Returns what happened, for the cron log. */
export async function drainJobs(): Promise<{
  reaped: number;
  processed: number;
  failed: number;
}> {
  const reaped = await reapStuckJobs();
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < BATCH_SIZE; i++) {
    const job = await claimNextJob();
    if (!job) break;

    const handler = handlers.get(job.type);
    if (!handler) {
      await failJob(job, new Error(`No handler registered for "${job.type}"`));
      failed++;
      continue;
    }

    try {
      await handler({
        job,
        setProgress: (progress, step) => setProgress(job.id, progress, step),
      });
      await completeJob(job.id);
      processed++;
    } catch (err) {
      await failJob(job, err);
      failed++;
    }
  }

  return { reaped, processed, failed };
}

export async function cancelJob(jobId: string): Promise<void> {
  await db
    .update(backgroundJobs)
    .set({ status: "cancelled", finishedAt: new Date(), lockedAt: null })
    .where(eq(backgroundJobs.id, jobId));
}
