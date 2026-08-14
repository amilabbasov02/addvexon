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
 * NOTE ON THE CEILING — read before retuning.
 *
 * "No website" (+30) and "weak website" (+20) are mutually exclusive: a
 * business without a site cannot also have a bad one. So the reachable ceilings
 * are 80 for a business with no website and 70 for one with a weak website.
 *
 * With the high band starting at 80, that means only a no-website business
 * hitting *every* other signal reaches High, and a weak-website business never
 * can. That may be exactly what you want — no website is the strongest buying
 * signal there is. If High turns out to be too rare in practice, lower
 * BANDS.high rather than inflating the rule weights; the weights encode what
 * you believe, the bands encode how selective you want the list to be.
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
  bands: { high: 80, medium: 50 },
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
