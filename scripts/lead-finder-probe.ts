/**
 * Lead Finder probe — runs the discovery pipeline against a real city and
 * prints what it found, without touching the database.
 *
 * This is the tool for answering "does it actually work?" and for tuning the
 * scoring model against real data rather than assumptions. It deliberately
 * skips storage so it can be run repeatedly, safely, before any migration.
 *
 *   pnpm leads:probe                          # Baku, beauty salons, 40 max
 *   CITY=Sumqayit CATEGORY=restaurant pnpm leads:probe
 *   LIMIT=15 pnpm leads:probe
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { dedupeBatch } from "../src/lib/leads/dedupe";
import { overpassProvider } from "../src/lib/leads/providers/overpass";
import { scoreLead } from "../src/lib/leads/scoring";
import { analyzeWebsite, type WebsiteAnalysis } from "../src/lib/leads/website-analysis";
import type { DiscoveredBusiness } from "../src/lib/leads/providers/types";

const CITY = process.env.CITY ?? "Baku";
const COUNTRY = process.env.COUNTRY ?? "AZ";
const CATEGORY = process.env.CATEGORY ?? "beauty_salon";
const LIMIT = Number.parseInt(process.env.LIMIT ?? "40", 10);
const ANALYSIS_CONCURRENCY = 5;

function pad(value: string, width: number): string {
  const clean = value.length > width ? `${value.slice(0, width - 1)}…` : value;
  return clean.padEnd(width);
}

async function analyzeAll(
  businesses: DiscoveredBusiness[],
): Promise<WebsiteAnalysis[]> {
  const results = new Array<WebsiteAnalysis>(businesses.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    for (;;) {
      const index = cursor++;
      if (index >= businesses.length) return;
      results[index] = await analyzeWebsite(businesses[index]!.websiteUrl);
      done++;
      process.stdout.write(`\r  analysed ${done}/${businesses.length}   `);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(ANALYSIS_CONCURRENCY, businesses.length) }, worker),
  );
  process.stdout.write("\r".padEnd(40) + "\r");
  return results;
}

async function main() {
  console.log(`\nLead Finder probe`);
  console.log(`  ${CATEGORY} in ${CITY}, ${COUNTRY} — up to ${LIMIT}\n`);

  // ── 1. Discover ───────────────────────────────────────────────────────────
  const started = Date.now();
  console.log("→ Querying OpenStreetMap (Overpass)…");
  const found = await overpassProvider.searchBusinesses({
    country: COUNTRY,
    city: CITY,
    category: CATEGORY,
    limit: LIMIT,
  });
  console.log(`  ${found.length} raw results in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  if (found.length === 0) {
    console.log(
      `\n  Nothing found. Either OSM has no "${CATEGORY}" mapped in ${CITY},\n` +
        `  or the city name doesn't match an OSM administrative boundary.\n`,
    );
    return;
  }

  // ── 2. De-duplicate ───────────────────────────────────────────────────────
  const unique = dedupeBatch(found).slice(0, LIMIT);
  console.log(`  ${unique.length} after de-duplication (${found.length - unique.length} merged)\n`);

  // ── 3. Analyse websites ───────────────────────────────────────────────────
  const withSites = unique.filter((b) => b.websiteUrl).length;
  console.log(`→ Analysing ${withSites} website(s)…`);
  const analyses = await analyzeAll(unique);

  // ── 4. Score ──────────────────────────────────────────────────────────────
  // Template availability is a database question; the probe assumes one exists
  // so the +10 rule is visible. Real scores may be 10 lower for niches with no
  // published template yet.
  const scored = unique.map((business, i) => {
    const analysis = analyses[i]!;
    const result = scoreLead({
      hasWebsite: analysis.hasWebsite,
      websiteReachable: analysis.reachable,
      websiteIssues: analysis.issues,
      hasPhone: Boolean(business.phone),
      hasEmail: Boolean(business.email),
      socialsCount: business.socials
        ? [business.socials.facebook, business.socials.instagram, business.socials.linkedin].filter(
            Boolean,
          ).length
        : 0,
      looksActive: business.looksActive,
      hasMatchingTemplate: true,
    });
    return { business, analysis, ...result };
  });

  scored.sort((a, b) => b.score - a.score);

  // ── 5. Report ─────────────────────────────────────────────────────────────
  const bands = { high: 0, medium: 0, low: 0 };
  for (const s of scored) bands[s.band]++;

  console.log(`\n${"─".repeat(96)}`);
  console.log(
    `Search completed — ${scored.length} businesses found`,
  );
  console.log(
    `  ${bands.high} High Potential · ${bands.medium} Medium · ${bands.low} Low`,
  );
  console.log("─".repeat(96));

  console.log(
    `\n${pad("BUSINESS", 32)}${pad("PHONE", 17)}${pad("WEBSITE", 26)}${pad("SOC", 4)}${pad("SCORE", 6)}BAND`,
  );
  console.log("─".repeat(96));

  for (const s of scored.slice(0, 25)) {
    const b = s.business;
    const website = !b.websiteUrl
      ? "— none —"
      : !s.analysis.reachable
        ? "BROKEN"
        : s.analysis.issues.length > 0
          ? `${s.analysis.issues.length} issue(s)`
          : "ok";
    const socials = b.socials
      ? [b.socials.facebook, b.socials.instagram, b.socials.linkedin].filter(Boolean).length
      : 0;

    console.log(
      pad(b.name, 32) +
        pad(b.phone ?? "—", 17) +
        pad(website, 26) +
        pad(socials ? String(socials) : "—", 4) +
        pad(String(s.score), 6) +
        s.band,
    );
  }

  // ── 6. Field coverage — the number that decides if this is usable ─────────
  const withPhone = unique.filter((b) => b.phone).length;
  const withEmail = unique.filter((b) => b.email).length;
  const withWebsite = unique.filter((b) => b.websiteUrl).length;
  const withSocial = unique.filter((b) => b.socials).length;
  const withAddress = unique.filter((b) => b.address).length;
  const contactable = unique.filter((b) => b.phone || b.email).length;

  const pct = (n: number) => `${((n / unique.length) * 100).toFixed(0)}%`.padStart(5);

  console.log(`\n${"─".repeat(96)}`);
  console.log("FIELD COVERAGE — how much of the data OSM actually has");
  console.log("─".repeat(96));
  console.log(`  Phone       ${pct(withPhone)}  (${withPhone}/${unique.length})`);
  console.log(`  Email       ${pct(withEmail)}  (${withEmail}/${unique.length})`);
  console.log(`  Website     ${pct(withWebsite)}  (${withWebsite}/${unique.length})`);
  console.log(`  Social      ${pct(withSocial)}  (${withSocial}/${unique.length})`);
  console.log(`  Address     ${pct(withAddress)}  (${withAddress}/${unique.length})`);
  console.log(`  Contactable ${pct(contactable)}  (${contactable}/${unique.length})  ← leads you can actually reach`);

  const topReasons = new Map<string, number>();
  for (const s of scored) {
    for (const r of s.reasons) {
      topReasons.set(r.label, (topReasons.get(r.label) ?? 0) + 1);
    }
  }
  console.log(`\nSCORING SIGNALS`);
  console.log("─".repeat(96));
  for (const [label, count] of [...topReasons.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pad(label, 50)}${pct(count)}  (${count})`);
  }

  console.log(`\nSource: ${overpassProvider.attribution}`);
  console.log(`Total time: ${((Date.now() - started) / 1000).toFixed(1)}s\n`);
}

main().catch((err) => {
  console.error("\nProbe failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
