/**
 * Lead scoring.
 *
 * Every rule lives in SCORING_CONFIG so the model can be retuned without
 * touching the pipeline — which matters, because the right weights are an
 * empirical question that only real conversion data can answer.
 *
 * Each rule that fires is recorded with its label, and those labels are what
 * the UI shows under "Why this is a potential customer?". The score and the
 * explanation therefore cannot drift apart.
 */

export type ScoringInput = {
  /** A website URL was found for this business at all. */
  hasWebsite: boolean;
  /** The site responded to a request. A dead domain is not a working website. */
  websiteReachable: boolean;
  /** Problems found by the website analyser (see website-analysis.ts). */
  websiteIssues: string[];
  hasPhone: boolean;
  hasEmail: boolean;
  socialsCount: number;
  /** Provider signals that the business is a going concern, not a stale record. */
  looksActive: boolean;
  /** A published Addvoxen template matches this business category. */
  hasMatchingTemplate: boolean;
};

export type ScoreRule = {
  id: string;
  /** Shown verbatim to the user — write it as a reason, not as a condition. */
  label: string;
  points: number;
  test: (input: ScoringInput) => boolean;
};

export type ScoreBand = "high" | "medium" | "low";

export type ScoreResult = {
  score: number;
  band: ScoreBand;
  reasons: { rule: string; points: number; label: string }[];
};

/**
 * NOTE ON THE BANDS — read before retuning.
 *
 * The weights encode what we believe predicts a sale. The bands encode how
 * selective the list should be. When High turned out to be unreachable, the
 * band moved — the weights did not. Inflating a weight to fix a band would
 * corrupt the model to fix a display problem.
 *
 * Why 70 and not 80. "No website" (+30) and "weak website" (+20) are mutually
 * exclusive, so the real ceilings are 80 for a business with no site and 70 for
 * one with a bad site. Reaching 80 additionally requires social links, and
 * measured against live OpenStreetMap data for Baku those are almost absent:
 *
 *   beauty salons  159 found   social 11%   phone 28%   email  7%
 *   restaurants    300+ found  social  0%   phone 11%   email  1%
 *   cafes          299 found   social  4%   phone 10%   email  2%
 *   dental          90 found   social  3%   phone 24%   email  9%
 *
 * With High at 80, four of five categories produced **zero** High leads, and
 * the genuinely best prospects — no website, reachable by phone, visibly
 * trading — all sat in Medium. At 70 those surface correctly and High becomes
 * roughly a quarter to a third of a search.
 *
 * If a richer data source is added later (one that actually carries social and
 * email), revisit this: the ceiling stops being artificial and 80 may be right
 * again.
 */
export const SCORING_CONFIG: {
  rules: ScoreRule[];
  bands: { high: number; medium: number };
} = {
  rules: [
    {
      id: "no_website",
      label: "No website found",
      points: 30,
      test: (i) => !i.hasWebsite,
    },
    {
      id: "website_unreachable",
      label: "Website does not load",
      points: 30,
      // A domain that no longer resolves is worth as much as having none.
      test: (i) => i.hasWebsite && !i.websiteReachable,
    },
    {
      id: "weak_website",
      label: "Website has technical or usability problems",
      points: 20,
      test: (i) => i.hasWebsite && i.websiteReachable && i.websiteIssues.length > 0,
    },
    {
      id: "active_business",
      label: "Business appears active",
      points: 15,
      test: (i) => i.looksActive,
    },
    {
      id: "has_contact",
      label: "Public contact details available",
      points: 15,
      test: (i) => i.hasPhone || i.hasEmail,
    },
    {
      id: "has_social",
      label: "Active social media presence",
      points: 10,
      test: (i) => i.socialsCount > 0,
    },
    {
      id: "template_match",
      label: "A matching Addvoxen template is available",
      points: 10,
      test: (i) => i.hasMatchingTemplate,
    },
  ],
  // Ölçülmüş data əsasında tənzimlənib. İzah aşağıdadır.
  bands: { high: 70, medium: 45 },
};

export function scoreLead(input: ScoringInput): ScoreResult {
  const reasons: ScoreResult["reasons"] = [];
  let score = 0;

  for (const rule of SCORING_CONFIG.rules) {
    if (!rule.test(input)) continue;
    score += rule.points;
    reasons.push({ rule: rule.id, points: rule.points, label: rule.label });
  }

  // Rules are additive and hand-tuned, so clamp rather than trusting them to
  // sum to a sane range after someone edits the config.
  score = Math.max(0, Math.min(100, score));

  return { score, band: bandFor(score), reasons };
}

export function bandFor(score: number): ScoreBand {
  if (score >= SCORING_CONFIG.bands.high) return "high";
  if (score >= SCORING_CONFIG.bands.medium) return "medium";
  return "low";
}

export const BAND_LABELS: Record<ScoreBand, string> = {
  high: "High Potential",
  medium: "Medium Potential",
  low: "Low Potential",
};
