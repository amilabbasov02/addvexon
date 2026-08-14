/**
 * OpenStreetMap business discovery via the Overpass API.
 *
 * Chosen as the default provider because ODbL permits storing the data and
 * building a derived database from it, which is exactly what a lead pipeline
 * is. The obligation in exchange is attribution, which we carry on every lead.
 *
 * Overpass is a free, shared, volunteer-run service. The usage policy asks for
 * a small number of concurrent requests, a real User-Agent, and restraint —
 * so this module runs one query per search, caps the result set, and never
 * retries aggressively. Treat a 429 as "stop", not "try harder".
 *
 * https://wiki.openstreetmap.org/wiki/Overpass_API
 * https://operations.osmfoundation.org/policies/api/
 */
import type {
  BusinessDiscoveryProvider,
  BusinessSearchQuery,
  DiscoveredBusiness,
  LeadCategory,
} from "./types";

const OVERPASS_ENDPOINT =
  process.env.OVERPASS_API_URL ?? "https://overpass-api.de/api/interpreter";

const USER_AGENT =
  "Addvoxen-LeadFinder/1.0 (+https://addvoxen.com; contact: info@addvoxen.com)";

/** How long we let Overpass think before giving up, in seconds. */
const OVERPASS_TIMEOUT_S = 60;

/**
 * Our niches expressed as OSM tag filters. A niche can map to several tags —
 * a barber is `shop=hairdresser`, but so is part of the beauty market, so the
 * two overlap deliberately rather than trying to draw a line OSM doesn't draw.
 */
const CATEGORY_TAGS: Record<LeadCategory, string[]> = {
  beauty_salon: ['["shop"="beauty"]', '["shop"="hairdresser"]', '["leisure"="spa"]'],
  barber: ['["shop"="hairdresser"]'],
  restaurant: ['["amenity"="restaurant"]'],
  cafe: ['["amenity"="cafe"]'],
  dental: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
  fitness: ['["leisure"="fitness_centre"]', '["leisure"="sports_centre"]'],
  real_estate: ['["office"="estate_agent"]'],
  education: [
    '["amenity"="language_school"]',
    '["amenity"="driving_school"]',
    '["office"="educational_institution"]',
  ],
  medical_clinic: ['["amenity"="clinic"]', '["amenity"="doctors"]'],
  auto_service: ['["shop"="car_repair"]', '["shop"="tyres"]'],
  hotel: ['["tourism"="hotel"]', '["tourism"="guest_house"]'],
  retail_shop: ['["shop"="clothes"]', '["shop"="shoes"]', '["shop"="gift"]'],
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements?: OverpassElement[] };

export class OverpassProvider implements BusinessDiscoveryProvider {
  readonly id = "openstreetmap";
  readonly name = "OpenStreetMap";
  readonly attribution = "© OpenStreetMap contributors (ODbL)";
  readonly canStore = true;

  async searchBusinesses(
    query: BusinessSearchQuery,
  ): Promise<DiscoveredBusiness[]> {
    const tags = CATEGORY_TAGS[query.category as LeadCategory];
    if (!tags || tags.length === 0) {
      throw new Error(`No OSM tag mapping for category "${query.category}"`);
    }

    const ql = buildQuery(query.city, tags, query.limit);
    const raw = await runOverpass(ql);

    const out: DiscoveredBusiness[] = [];
    for (const element of raw.elements ?? []) {
      const business = normalizeElement(element, query);
      if (business) out.push(business);
      if (out.length >= query.limit) break;
    }
    return out;
  }
}

/**
 * Resolve the city by name and search inside its administrative boundary.
 *
 * Both `name` and `name:en` are matched because Azerbaijani places are tagged
 * locally ("Bakı") while users type the English form ("Baku") — matching only
 * one silently returns nothing, which looks like "no businesses found".
 */
function buildQuery(city: string, tags: string[], limit: number): string {
  const safeCity = city.replace(/["\\]/g, "");
  const selectors = tags
    .flatMap((tag) => [
      `  node${tag}(area.searchArea);`,
      `  way${tag}(area.searchArea);`,
    ])
    .join("\n");

  return `[out:json][timeout:${OVERPASS_TIMEOUT_S}];
(
  area["boundary"="administrative"]["name"="${safeCity}"];
  area["boundary"="administrative"]["name:en"="${safeCity}"];
)->.searchArea;
(
${selectors}
);
out center tags ${Math.min(limit * 3, 1000)};`;
}

async function runOverpass(ql: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    (OVERPASS_TIMEOUT_S + 15) * 1000,
  );

  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: new URLSearchParams({ data: ql }).toString(),
      signal: controller.signal,
    });

    if (res.status === 429 || res.status === 504) {
      // The shared instance is rate-limiting or overloaded. Surfacing this as a
      // retryable error lets the job runner back off instead of hammering it.
      throw new RetryableProviderError(
        `Overpass is busy (HTTP ${res.status}). The job will retry shortly.`,
      );
    }
    if (!res.ok) {
      throw new Error(`Overpass returned HTTP ${res.status}`);
    }

    return (await res.json()) as OverpassResponse;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new RetryableProviderError("Overpass request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Thrown when the failure is transient and the job should be retried. */
export class RetryableProviderError extends Error {
  readonly retryable = true;
  constructor(message: string) {
    super(message);
    this.name = "RetryableProviderError";
  }
}

function normalizeElement(
  el: OverpassElement,
  query: BusinessSearchQuery,
): DiscoveredBusiness | null {
  const tags = el.tags ?? {};
  const name = tags["name"] ?? tags["name:en"] ?? tags["brand"];

  // An unnamed point on a map is not a lead.
  if (!name || name.trim().length < 2) return null;

  const coords = el.center ?? { lat: el.lat, lon: el.lon };

  const phone = firstTag(tags, ["phone", "contact:phone", "contact:mobile"]);
  const email = firstTag(tags, ["email", "contact:email"]);
  const websiteUrl = normalizeUrl(
    firstTag(tags, ["website", "contact:website", "url"]),
  );

  const socials = {
    facebook: normalizeSocial(
      firstTag(tags, ["contact:facebook", "facebook"]),
      "facebook.com",
    ),
    instagram: normalizeSocial(
      firstTag(tags, ["contact:instagram", "instagram"]),
      "instagram.com",
    ),
    linkedin: normalizeSocial(
      firstTag(tags, ["contact:linkedin", "linkedin"]),
      "linkedin.com",
    ),
  };
  const hasSocials = Boolean(socials.facebook || socials.instagram || socials.linkedin);

  const address = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    sourceId: `${el.type}/${el.id}`,
    name: name.trim(),
    rawCategory:
      tags["shop"] ?? tags["amenity"] ?? tags["leisure"] ?? tags["office"] ?? tags["tourism"],
    country: query.country,
    city: tags["addr:city"] ?? query.city,
    address: address || undefined,
    lat: coords.lat,
    lng: coords.lon,
    phone: phone?.trim(),
    email: email?.trim().toLowerCase(),
    websiteUrl,
    socials: hasSocials ? stripUndefined(socials) : undefined,
    // Opening hours or a maintained contact point are the strongest signals
    // available in OSM that somebody is still running this business.
    looksActive: Boolean(
      tags["opening_hours"] || phone || websiteUrl || tags["check_date"],
    ),
  };
}

function firstTag(
  tags: Record<string, string>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = tags[key];
    if (value && value.trim()) return value;
  }
  return undefined;
}

/** OSM URLs are user-entered: often missing a scheme, occasionally junk. */
function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().split(";")[0].trim();
  if (!trimmed) return undefined;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Social tags hold anything from a full URL to a bare handle. */
function normalizeSocial(
  value: string | undefined,
  domain: string,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://${domain}/${handle}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

export const overpassProvider = new OverpassProvider();
