/**
 * Lead de-duplication.
 *
 * The same business turns up again every time an overlapping search runs. We
 * want one lead with one contact history, not a new row each time — otherwise
 * someone gets emailed twice and the pipeline looks broken.
 *
 * The key is derived from the most stable facts a provider gives us: the name,
 * the city, and a coarse location. Location is included on purpose so that two
 * branches of the same chain stay separate leads — they are separate businesses
 * with separate owners to pitch.
 */
import { slugify } from "@/lib/ids";
import type { DiscoveredBusiness } from "./providers/types";

/** ~110 m of precision: enough to separate two branches, tolerant of drift. */
const GEO_PRECISION = 3;

export function dedupeKeyFor(business: DiscoveredBusiness): string {
  const parts = [
    slugify(business.name, 60) || "unnamed",
    slugify(business.city ?? "", 30),
  ];

  if (typeof business.lat === "number" && typeof business.lng === "number") {
    parts.push(
      `${business.lat.toFixed(GEO_PRECISION)},${business.lng.toFixed(GEO_PRECISION)}`,
    );
  }

  return parts.filter(Boolean).join("|");
}

/**
 * Collapse duplicates inside a single provider response.
 *
 * OSM in particular returns the same business twice when it is mapped both as
 * a node (the shop point) and as a way (the building outline). Later entries
 * are merged into the first so we keep whichever record has the contact
 * details, rather than whichever happened to come back first.
 */
export function dedupeBatch(
  businesses: DiscoveredBusiness[],
): DiscoveredBusiness[] {
  const byKey = new Map<string, DiscoveredBusiness>();

  for (const business of businesses) {
    const key = dedupeKeyFor(business);
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeBusiness(existing, business) : business);
  }

  return [...byKey.values()];
}

/** Prefer whichever record actually has a value for each field. */
function mergeBusiness(
  base: DiscoveredBusiness,
  extra: DiscoveredBusiness,
): DiscoveredBusiness {
  return {
    ...base,
    address: base.address ?? extra.address,
    phone: base.phone ?? extra.phone,
    email: base.email ?? extra.email,
    websiteUrl: base.websiteUrl ?? extra.websiteUrl,
    socials: base.socials ?? extra.socials,
    rawCategory: base.rawCategory ?? extra.rawCategory,
    looksActive: base.looksActive || extra.looksActive,
  };
}
