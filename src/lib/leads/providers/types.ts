/**
 * Business discovery provider contract.
 *
 * Every source of businesses — OpenStreetMap today, something else later —
 * implements this. The pipeline only ever sees DiscoveredBusiness, so adding a
 * provider never touches scoring, dedupe, storage or UI.
 *
 * A provider is also responsible for declaring what its licence obliges us to
 * do: `attribution` is stored on every lead it produces and rendered in the UI,
 * and `canStore` tells the pipeline whether the data may be persisted at all.
 * Some commercial APIs (Google Places, for one) forbid retaining most fields —
 * those providers must set canStore to false so we never build a database we
 * are not allowed to build.
 */

export type DiscoveredBusiness = {
  /** Stable id within this provider, so a later run can re-fetch the record. */
  sourceId: string;
  name: string;
  /** The provider's own category string, before mapping to our niches. */
  rawCategory?: string;
  country?: string;
  city?: string;
  address?: string;
  /** Decimal degrees. Converted to fixed-point integers at the storage layer. */
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    other?: string[];
  };
  /**
   * Provider-specific evidence that this is a going concern rather than a
   * stale record — opening hours, a recent survey date, a live phone number.
   */
  looksActive: boolean;
};

export type BusinessSearchQuery = {
  /** ISO-3166 alpha-2. */
  country: string;
  city: string;
  /** Our internal niche key, e.g. "beauty_salon". */
  category: string;
  /** Upper bound on results; providers should stop early rather than over-fetch. */
  limit: number;
};

export interface BusinessDiscoveryProvider {
  /** Stored on each lead as `source`. */
  readonly id: string;
  /** Human-readable name for the UI. */
  readonly name: string;
  /** Attribution text the licence requires us to display next to the data. */
  readonly attribution: string;
  /** False when the provider's terms forbid persisting its data. */
  readonly canStore: boolean;

  searchBusinesses(query: BusinessSearchQuery): Promise<DiscoveredBusiness[]>;
}

/**
 * Our niche keys. These are the values the UI offers, the values stored on
 * leads, and the keys used to find a matching site template — keeping them in
 * one place stops the three drifting apart.
 */
export const LEAD_CATEGORIES = [
  "beauty_salon",
  "barber",
  "restaurant",
  "cafe",
  "dental",
  "fitness",
  "real_estate",
  "education",
  "medical_clinic",
  "auto_service",
  "hotel",
  "retail_shop",
] as const;

export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  beauty_salon: "Beauty Salon",
  barber: "Barber",
  restaurant: "Restaurant",
  cafe: "Cafe",
  dental: "Dental Clinic",
  fitness: "Fitness / Gym",
  real_estate: "Real Estate Agency",
  education: "Education / Courses",
  medical_clinic: "Medical Clinic",
  auto_service: "Auto Service",
  hotel: "Hotel",
  retail_shop: "Retail Shop",
};

export function isLeadCategory(value: string): value is LeadCategory {
  return (LEAD_CATEGORIES as readonly string[]).includes(value);
}
