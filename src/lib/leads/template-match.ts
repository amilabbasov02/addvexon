/**
 * Match a lead's niche to a published Addvoxen site template.
 *
 * Two jobs: it feeds the "a matching template is available" scoring rule, and
 * in Phase 2 it picks which template a generated demo is built from.
 *
 * Existing templates are categorised in Azerbaijani ("Səhiyyə", "Restoran",
 * "Korporativ"), so the map below is the bridge between our English niche keys
 * and whatever `site_templates.category` actually contains. Unmapped niches
 * simply find nothing — the scoring rule doesn't fire and no demo is offered,
 * which is the correct behaviour until a template for them exists.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import type { LeadCategory } from "./providers/types";

/** Niche → the site_templates.category values that suit it, best first. */
const CATEGORY_TO_TEMPLATE_CATEGORIES: Record<LeadCategory, string[]> = {
  beauty_salon: ["Gözəllik", "Səhiyyə", "Korporativ"],
  barber: ["Gözəllik", "Korporativ"],
  restaurant: ["Restoran"],
  cafe: ["Restoran"],
  dental: ["Səhiyyə"],
  medical_clinic: ["Səhiyyə"],
  fitness: ["Fitnes", "Səhiyyə", "Korporativ"],
  real_estate: ["Daşınmaz əmlak", "Korporativ"],
  education: ["Təhsil", "Korporativ"],
  auto_service: ["Korporativ"],
  hotel: ["Otel", "Restoran", "Korporativ"],
  retail_shop: ["Korporativ"],
};

export type MatchedTemplate = {
  id: string;
  slug: string;
  name: string;
  category: string;
  thumbnailUrl: string | null;
};

/**
 * Best published template for a niche, or null.
 *
 * Preference order follows the map: a beauty salon would rather have a beauty
 * template than a generic corporate one, but a corporate one still beats
 * nothing when that's all we have.
 */
export async function findTemplateForCategory(
  category: string,
): Promise<MatchedTemplate | null> {
  const candidates =
    CATEGORY_TO_TEMPLATE_CATEGORIES[category as LeadCategory] ?? [];
  if (candidates.length === 0) return null;

  for (const templateCategory of candidates) {
    const rows = await db
      .select({
        id: siteTemplates.id,
        slug: siteTemplates.slug,
        name: siteTemplates.name,
        category: siteTemplates.category,
        thumbnailUrl: siteTemplates.thumbnailUrl,
      })
      .from(siteTemplates)
      .where(
        and(
          eq(siteTemplates.category, templateCategory),
          eq(siteTemplates.published, true),
        ),
      )
      .orderBy(siteTemplates.sortOrder)
      .limit(1);

    if (rows[0]) return rows[0];
  }

  return null;
}

/**
 * Resolve template availability for many niches at once.
 *
 * A lead search scores up to a few hundred businesses that share one or two
 * niches; without this the scorer would issue the same query per lead.
 */
export async function buildTemplateAvailabilityMap(
  categories: string[],
): Promise<Map<string, MatchedTemplate | null>> {
  const map = new Map<string, MatchedTemplate | null>();
  for (const category of new Set(categories)) {
    map.set(category, await findTemplateForCategory(category));
  }
  return map;
}
