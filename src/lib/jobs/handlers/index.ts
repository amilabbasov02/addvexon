/**
 * Job handler registration.
 *
 * Import this module for its side effects before draining the queue — the cron
 * route does exactly that. Handlers register themselves here rather than in the
 * runner so the runner stays free of feature-specific imports.
 */
import { registerJobHandler } from "../runner";
import { handleLeadSearch } from "./lead-search";

export const JOB_TYPES = {
  LEAD_SEARCH: "lead_search",
} as const;

let registered = false;

export function registerAllJobHandlers(): void {
  if (registered) return;
  registerJobHandler(JOB_TYPES.LEAD_SEARCH, handleLeadSearch);
  registered = true;
}
