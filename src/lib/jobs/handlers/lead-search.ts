/**
 * The lead search pipeline.
 *
 * discover → de-duplicate → analyse websites → score → store
 *
 * Progress is reported at each stage because a search takes minutes and a
 * silent spinner reads as a broken feature. The percentages map to the stage
 * labels the UI shows, so they are chosen for legibility rather than for being
 * a true measure of work done.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  leadAnalyses,
  leadEvents,
  leadSearches,
  leads,
} from "@/db/schema";
import { uid } from "@/lib/ids";
import { dedupeBatch, dedupeKeyFor } from "@/lib/leads/dedupe";
import { getProvider, DEFAULT_PROVIDER_ID } from "@/lib/leads/providers";
import { scoreLead } from "@/lib/leads/scoring";
import { buildTemplateAvailabilityMap } from "@/lib/leads/template-match";
import { analyzeWebsite, type WebsiteAnalysis } from "@/lib/leads/website-analysis";
import type { DiscoveredBusiness } from "@/lib/leads/providers/types";
import type { JobContext } from "../runner";

/** Websites analysed at once. Kept low: these are other people's servers. */
const ANALYSIS_CONCURRENCY = 5;

export type LeadSearchPayload = {
  searchId: string;
  providerId?: string;
};

export async function handleLeadSearch({
  job,
  setProgress,
}: JobContext): Promise<void> {
  const payload = job.payload as LeadSearchPayload;
  const searchId = payload.searchId;
  if (!searchId) throw new Error("lead_search job has no searchId");

  const search = await db.query.leadSearches.findFirst({
    where: eq(leadSearches.id, searchId),
  });
  if (!search) throw new Error(`Lead search ${searchId} no longer exists`);

  await db
    .update(leadSearches)
    .set({ status: "running" })
    .where(eq(leadSearches.id, searchId));

  try {
    // ── 1. Discover ────────────────────────────────────────────────────────
    await setProgress(10, "Finding businesses");

    const provider = getProvider(payload.providerId ?? DEFAULT_PROVIDER_ID);
    const found = await provider.searchBusinesses({
      country: search.country,
      city: search.city,
      category: search.category,
      limit: search.maxLeads,
    });

    // ── 2. De-duplicate within this batch ──────────────────────────────────
    await setProgress(30, "Removing duplicates");
    const unique = dedupeBatch(found).slice(0, search.maxLeads);

    if (unique.length === 0) {
      await finishSearch(searchId, { total: 0, high: 0, medium: 0, low: 0 });
      await setProgress(100, "Completed");
      return;
    }

    // ── 3. Analyse websites ────────────────────────────────────────────────
    await setProgress(40, "Analyzing websites");
    const analyses = await analyzeAll(unique, async (done) => {
      // 40 → 85 across the batch.
      await setProgress(40 + (done / unique.length) * 45, "Analyzing websites");
    });

    // ── 4. Score ───────────────────────────────────────────────────────────
    await setProgress(88, "Scoring leads");
    const templates = await buildTemplateAvailabilityMap([search.category]);
    const hasTemplate = Boolean(templates.get(search.category));

    const counts = { total: 0, high: 0, medium: 0, low: 0 };

    // ── 5. Store ───────────────────────────────────────────────────────────
    await setProgress(94, "Saving results");

    for (let i = 0; i < unique.length; i++) {
      const business = unique[i]!;
      const analysis = analyses[i]!;

      const { score, band, reasons } = scoreLead({
        hasWebsite: analysis.hasWebsite,
        websiteReachable: analysis.reachable,
        websiteIssues: analysis.issues,
        hasPhone: Boolean(business.phone),
        hasEmail: Boolean(business.email),
        socialsCount: countSocials(business),
        looksActive: business.looksActive,
        hasMatchingTemplate: hasTemplate,
      });

      const leadId = await upsertLead({
        workspaceId: search.workspaceId,
        searchId,
        business,
        provider: { id: provider.id, attribution: provider.attribution },
        category: search.category,
        score,
        band,
        reasons,
      });

      await upsertAnalysis(leadId, analysis);

      counts.total++;
      if (band === "high") counts.high++;
      else if (band === "medium") counts.medium++;
      else counts.low++;
    }

    await finishSearch(searchId, counts);
    await setProgress(100, "Completed");
  } catch (err) {
    await db
      .update(leadSearches)
      .set({
        status: "failed",
        error: err instanceof Error ? err.message.slice(0, 500) : "Unknown error",
      })
      .where(eq(leadSearches.id, searchId));
    throw err;
  }
}

/** Analyse websites with bounded concurrency, reporting progress as they land. */
async function analyzeAll(
  businesses: DiscoveredBusiness[],
  onProgress: (completed: number) => Promise<void>,
): Promise<WebsiteAnalysis[]> {
  const results = new Array<WebsiteAnalysis>(businesses.length);
  let cursor = 0;
  let completed = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor++;
      if (index >= businesses.length) return;

      // analyzeWebsite never throws — a failed check is a result, not an error,
      // and one unreachable site must not abort a search of a hundred.
      results[index] = await analyzeWebsite(businesses[index]!.websiteUrl);

      completed++;
      if (completed % 5 === 0) await onProgress(completed);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(ANALYSIS_CONCURRENCY, businesses.length) }, worker),
  );

  return results;
}

/**
 * Insert the lead, or refresh it if this workspace has seen it before.
 *
 * Deliberately does NOT touch `status` or `contactedAt` — re-running a search
 * must never reset a lead someone has already contacted back to "new".
 */
async function upsertLead(input: {
  workspaceId: string;
  searchId: string;
  business: DiscoveredBusiness;
  provider: { id: string; attribution: string };
  category: string;
  score: number;
  band: string;
  reasons: { rule: string; points: number; label: string }[];
}): Promise<string> {
  const { business } = input;
  const id = uid("lead");
  const dedupeKey = dedupeKeyFor(business);

  const values = {
    id,
    workspaceId: input.workspaceId,
    searchId: input.searchId,
    name: business.name,
    category: input.category,
    country: business.country ?? null,
    city: business.city ?? null,
    address: business.address ?? null,
    lat: toFixedPoint(business.lat),
    lng: toFixedPoint(business.lng),
    phone: business.phone ?? null,
    email: business.email ?? null,
    websiteUrl: business.websiteUrl ?? null,
    socials: business.socials ?? null,
    source: input.provider.id,
    sourceId: business.sourceId,
    sourceAttribution: input.provider.attribution,
    dedupeKey,
    score: input.score,
    band: input.band,
    scoreReasons: input.reasons,
  };

  const [row] = await db
    .insert(leads)
    .values(values)
    .onConflictDoUpdate({
      target: [leads.workspaceId, leads.dedupeKey],
      set: {
        name: values.name,
        address: values.address,
        phone: values.phone,
        email: values.email,
        websiteUrl: values.websiteUrl,
        socials: values.socials,
        score: values.score,
        band: values.band,
        scoreReasons: values.scoreReasons,
        updatedAt: new Date(),
      },
    })
    .returning({ id: leads.id });

  const leadId = row?.id ?? id;

  await db.insert(leadEvents).values({
    id: uid("lev"),
    leadId,
    type: "discovered",
    detail: {
      source: input.provider.id,
      sourceId: business.sourceId,
      searchId: input.searchId,
      score: input.score,
    },
  });

  return leadId;
}

async function upsertAnalysis(
  leadId: string,
  analysis: WebsiteAnalysis,
): Promise<void> {
  const values = {
    leadId,
    hasWebsite: analysis.hasWebsite,
    reachable: analysis.reachable,
    httpStatus: analysis.httpStatus ?? null,
    responseMs: analysis.responseMs ?? null,
    isHttps: analysis.isHttps ?? null,
    hasViewportMeta: analysis.hasViewportMeta ?? null,
    hasTitle: analysis.hasTitle ?? null,
    hasDescription: analysis.hasDescription ?? null,
    htmlBytes: analysis.htmlBytes ?? null,
    issues: analysis.issues,
    error: analysis.error ?? null,
    analyzedAt: new Date(),
  };

  await db
    .insert(leadAnalyses)
    .values(values)
    .onConflictDoUpdate({ target: leadAnalyses.leadId, set: values });
}

async function finishSearch(
  searchId: string,
  counts: { total: number; high: number; medium: number; low: number },
): Promise<void> {
  await db
    .update(leadSearches)
    .set({
      status: "completed",
      totalFound: counts.total,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      completedAt: new Date(),
    })
    .where(eq(leadSearches.id, searchId));
}

function countSocials(business: DiscoveredBusiness): number {
  const s = business.socials;
  if (!s) return 0;
  return [s.facebook, s.instagram, s.linkedin].filter(Boolean).length +
    (s.other?.length ?? 0);
}

/** Degrees → fixed-point integer (×1e6), so no floats reach the database. */
function toFixedPoint(value: number | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.round(value * 1_000_000);
}

/** Convenience for the read side. */
export function fromFixedPoint(value: number | null): number | null {
  return value === null ? null : value / 1_000_000;
}
