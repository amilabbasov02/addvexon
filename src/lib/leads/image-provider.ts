/**
 * Stock imagery for generated demo sites.
 *
 * A demo with no photographs looks unfinished, and an unfinished demo does not
 * sell. But we have no photographs of the actual business — so the honest
 * option is category-appropriate licensed stock, clearly generic rather than
 * pretending to be their premises.
 *
 * Two providers are supported and whichever key is configured wins. Both allow
 * commercial use, which matters because these images ship on a site the client
 * pays for:
 *   - Unsplash — Unsplash License, commercial use, attribution not required
 *   - Pexels   — Pexels License, commercial use, attribution not required
 *
 * With no key configured the whole module degrades to returning nothing, and
 * the designs fall back to their no-image layouts. That is why every design is
 * required to look correct without images.
 */
import type { LeadCategory } from "./providers/types";

export type StockImage = {
  url: string;
  /** Descriptive alt text — never left empty, screen readers get real content. */
  alt: string;
  /** Photographer credit. Not legally required, but we store it anyway. */
  credit?: string;
  creditUrl?: string;
};

/**
 * Search terms per niche, best first.
 *
 * Written to return interiors, detail shots and people-at-work rather than
 * logos or flat-lays — a salon wants its chairs and its stylists, not a stock
 * photo of scissors on white.
 */
const CATEGORY_QUERIES: Record<LeadCategory, string[]> = {
  beauty_salon: [
    "modern hair salon interior",
    "beauty salon treatment",
    "hairdresser working client",
    "manicure detail",
  ],
  barber: [
    "barbershop interior",
    "barber cutting hair",
    "barber chair vintage",
    "beard grooming",
  ],
  restaurant: [
    "restaurant interior warm",
    "plated fine dining dish",
    "chef plating kitchen",
    "restaurant table setting",
  ],
  cafe: [
    "coffee shop interior",
    "barista pouring latte art",
    "cafe pastry counter",
    "espresso detail",
  ],
  dental: [
    "modern dental clinic interior",
    "dentist with patient",
    "dental treatment room",
    "smiling patient dentist",
  ],
  medical_clinic: [
    "modern medical clinic interior",
    "doctor consulting patient",
    "clinic reception bright",
    "medical examination room",
  ],
  fitness: [
    "modern gym interior",
    "athlete training weights",
    "group fitness class",
    "boxing gym training",
  ],
  real_estate: [
    "modern apartment interior",
    "real estate agent client keys",
    "city apartment building",
    "living room bright modern",
  ],
  education: [
    "modern classroom students",
    "teacher explaining whiteboard",
    "students studying together",
    "language class",
  ],
  auto_service: [
    "car repair garage",
    "mechanic working engine",
    "tyre change workshop",
    "car detailing polish",
  ],
  hotel: [
    "boutique hotel room",
    "hotel lobby modern",
    "hotel bed linen detail",
    "hotel terrace view",
  ],
  retail_shop: [
    "boutique clothing store interior",
    "retail shop display",
    "shop window fashion",
    "folded clothes shelf",
  ],
};

/** Human-readable alt text, so it never reads like a search query. */
const CATEGORY_ALT: Record<LeadCategory, string> = {
  beauty_salon: "Gözəllik salonu interyeri",
  barber: "Bərbərxana interyeri",
  restaurant: "Restoran zalı",
  cafe: "Kafe interyeri",
  dental: "Diş klinikası müalicə otağı",
  medical_clinic: "Klinika interyeri",
  fitness: "İdman zalı",
  real_estate: "Modern mənzil interyeri",
  education: "Tədris sinfi",
  auto_service: "Avtoservis sexi",
  hotel: "Otel nömrəsi",
  retail_shop: "Mağaza interyeri",
};

type Provider = "unsplash" | "pexels" | "none";

function activeProvider(): Provider {
  if (process.env.UNSPLASH_ACCESS_KEY) return "unsplash";
  if (process.env.PEXELS_API_KEY) return "pexels";
  return "none";
}

/**
 * Fetch images for a category.
 *
 * Never throws and never returns a partial failure — imagery is decoration on
 * a sales demo, and a rate-limited stock API must not be able to fail a demo
 * build. On any problem it returns fewer images, or none.
 */
export async function fetchCategoryImages(
  category: string,
  count: number,
): Promise<StockImage[]> {
  const queries = CATEGORY_QUERIES[category as LeadCategory];
  if (!queries || queries.length === 0) return [];

  return fetchImagesForQuery(
    queries[0]!,
    count,
    CATEGORY_ALT[category as LeadCategory] ?? "Biznes şəkli",
  );
}

/**
 * Fetch by an explicit search term.
 *
 * Used by the template seeder, whose templates don't map onto the lead-category
 * list — a corporate services template has no equivalent niche key, but it
 * still needs office photography.
 */
export async function fetchImagesForQuery(
  query: string,
  count: number,
  alt = "Biznes şəkli",
): Promise<StockImage[]> {
  const provider = activeProvider();
  if (provider === "none") return [];

  try {
    const images =
      provider === "unsplash"
        ? await fromUnsplash(query, count)
        : await fromPexels(query, count);

    return images.map((img, i) => ({
      ...img,
      // Vary the alt text slightly so a gallery isn't twelve identical labels.
      alt: i === 0 ? alt : `${alt} — ${i + 1}`,
    }));
  } catch {
    return [];
  }
}

async function fromUnsplash(query: string, count: number): Promise<StockImage[]> {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(Math.min(count, 30)));
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");

  const res = await withTimeout((signal) =>
    fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
      signal,
    }),
  );
  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: {
      urls?: { regular?: string; raw?: string };
      alt_description?: string | null;
      user?: { name?: string; links?: { html?: string } };
    }[];
  };

  const out: StockImage[] = [];
  for (const r of data.results ?? []) {
    const src = r.urls?.regular;
    if (!src) continue;
    const image: StockImage = { url: src, alt: r.alt_description ?? "" };
    if (r.user?.name) image.credit = r.user.name;
    if (r.user?.links?.html) image.creditUrl = r.user.links.html;
    out.push(image);
  }
  return out;
}

async function fromPexels(query: string, count: number): Promise<StockImage[]> {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(Math.min(count, 80)));
  url.searchParams.set("orientation", "landscape");

  const res = await withTimeout((signal) =>
    fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
      signal,
    }),
  );
  if (!res.ok) return [];

  const data = (await res.json()) as {
    photos?: {
      src?: { large?: string; medium?: string };
      alt?: string;
      photographer?: string;
      photographer_url?: string;
    }[];
  };

  const out: StockImage[] = [];
  for (const p of data.photos ?? []) {
    const src = p.src?.large ?? p.src?.medium;
    if (!src) continue;
    const image: StockImage = { url: src, alt: p.alt ?? "" };
    if (p.photographer) image.credit = p.photographer;
    if (p.photographer_url) image.creditUrl = p.photographer_url;
    out.push(image);
  }
  return out;
}

async function withTimeout(
  run: (signal: AbortSignal) => Promise<Response>,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/** Whether imagery is available at all — lets callers skip the work entirely. */
export function imageProviderConfigured(): boolean {
  return activeProvider() !== "none";
}
