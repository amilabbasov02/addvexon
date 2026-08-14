/**
 * Demo site generation.
 *
 * A demo is not a new kind of object — it is a `tenant` with status "demo" and
 * a `leadId`. That reuses subdomain hosting, the renderer, the content editor
 * and the localisation layer that already exist for paying customers, and it
 * means a demo that lands can be converted into a real site by flipping a
 * status rather than migrating anything.
 *
 * Content comes from cloning the template's own preview tenant and swapping in
 * the business's details. Cloning beats generating from scratch because the
 * preview content is already designed, populated and translated — a generated
 * skeleton would look worse than the template the prospect is being sold.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  leadEvents,
  siteTemplates,
  tenantContent,
  tenants,
} from "@/db/schema";
import { slugify, uid } from "@/lib/ids";
import {
  isLocalizedBundle,
  type LocalizedBundle,
  type Section,
  type SiteContent,
} from "@/lib/site-content";
import {
  fetchCategoryImages,
  imageProviderConfigured,
  type StockImage,
} from "./image-provider";
import { findTemplateForCategory } from "./template-match";
import type { Lead } from "@/db/schema";

export type GeneratedDemo = {
  tenantId: string;
  subdomain: string;
  url: string;
  templateId: string;
  templateName: string;
};

export class DemoGenerationError extends Error {}

/**
 * Build a demo site for a lead.
 *
 * Idempotent by lead: calling it twice returns the existing demo rather than
 * littering the tenants table with near-identical sites.
 */
export async function generateDemoForLead(
  lead: Lead,
  actorUserId: string,
): Promise<GeneratedDemo> {
  const existing = await db
    .select({
      id: tenants.id,
      subdomain: tenants.subdomain,
      siteTemplateId: tenants.siteTemplateId,
    })
    .from(tenants)
    .where(and(eq(tenants.leadId, lead.id), eq(tenants.status, "demo")))
    .limit(1);

  if (existing[0]) {
    const template = await db
      .select({ name: siteTemplates.name })
      .from(siteTemplates)
      .where(eq(siteTemplates.id, existing[0].siteTemplateId))
      .limit(1);

    return {
      tenantId: existing[0].id,
      subdomain: existing[0].subdomain,
      url: demoUrl(existing[0].subdomain),
      templateId: existing[0].siteTemplateId,
      templateName: template[0]?.name ?? "Template",
    };
  }

  const template = await findTemplateForCategory(lead.category ?? "");
  if (!template) {
    throw new DemoGenerationError(
      `No published template matches the category "${lead.category ?? "unknown"}"`,
    );
  }

  const baseContent = await loadTemplateBaseContent(template.id);
  if (!baseContent) {
    throw new DemoGenerationError(
      `Template "${template.name}" has no preview content to build a demo from`,
    );
  }

  const personalised = personalise(baseContent.content, lead);
  const content = await addImagery(personalised, lead.category ?? "");
  const subdomain = await uniqueSubdomain(lead.name);
  const tenantId = uid("tnt");

  await db.insert(tenants).values({
    id: tenantId,
    ownerId: actorUserId,
    siteTemplateId: template.id,
    name: lead.name,
    subdomain,
    status: "demo",
    deliveryType: "hosted",
    leadId: lead.id,
  });

  await db.insert(tenantContent).values({
    tenantId,
    content: content as unknown as Record<string, unknown>,
    theme: baseContent.theme,
  });

  await db.insert(leadEvents).values({
    id: uid("lev"),
    leadId: lead.id,
    type: "demo_created",
    actorUserId,
    detail: {
      tenantId,
      subdomain,
      templateId: template.id,
      templateName: template.name,
    },
  });

  return {
    tenantId,
    subdomain,
    url: demoUrl(subdomain),
    templateId: template.id,
    templateName: template.name,
  };
}

/** The template's own preview tenant is the design reference we clone. */
async function loadTemplateBaseContent(templateId: string): Promise<{
  content: SiteContent | LocalizedBundle;
  theme: Record<string, unknown>;
} | null> {
  const template = await db
    .select({ previewSubdomain: siteTemplates.previewSubdomain })
    .from(siteTemplates)
    .where(eq(siteTemplates.id, templateId))
    .limit(1);

  const previewSubdomain = template[0]?.previewSubdomain;
  if (!previewSubdomain) return null;

  const rows = await db
    .select({ content: tenantContent.content, theme: tenantContent.theme })
    .from(tenants)
    .innerJoin(tenantContent, eq(tenantContent.tenantId, tenants.id))
    .where(eq(tenants.subdomain, previewSubdomain))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    content: row.content as unknown as SiteContent | LocalizedBundle,
    theme: (row.theme ?? {}) as Record<string, unknown>,
  };
}

/**
 * Replace the template's placeholder business with this lead's.
 *
 * Content is stored either as a plain SiteContent or as a per-locale bundle, so
 * both shapes are handled — a demo that only replaced the Azerbaijani copy and
 * left the English page advertising "Sağlam Klinika" would be worse than none.
 */
function personalise(
  source: SiteContent | LocalizedBundle,
  lead: Lead,
): SiteContent | LocalizedBundle {
  // Structured-clone so we never mutate the template's own preview content.
  const clone = structuredClone(source);

  if (isLocalizedBundle(clone)) {
    for (const locale of Object.keys(clone.locales) as (keyof typeof clone.locales)[]) {
      const localeContent = clone.locales[locale];
      if (localeContent) clone.locales[locale] = personaliseContent(localeContent, lead);
    }
    return clone;
  }

  return personaliseContent(clone as SiteContent, lead);
}

/**
 * Fill the empty photo slots with category-appropriate licensed stock.
 *
 * A demo with no photographs looks unfinished, and an unfinished demo does not
 * sell — but we have no photographs of this actual business, so the honest
 * option is generic imagery of the right kind of place. It is obviously stock;
 * it is not pretending to be their premises.
 *
 * Silently does nothing when no image provider is configured, which is why
 * every design is required to look correct with no images at all.
 */
async function addImagery(
  source: SiteContent | LocalizedBundle,
  category: string,
): Promise<SiteContent | LocalizedBundle> {
  if (!imageProviderConfigured() || !category) return source;

  // One fetch for the whole demo — every locale shows the same premises.
  const images = await fetchCategoryImages(category, 10);
  if (images.length === 0) return source;

  if (isLocalizedBundle(source)) {
    for (const locale of Object.keys(source.locales) as (keyof typeof source.locales)[]) {
      const localeContent = source.locales[locale];
      if (localeContent) applyImages(localeContent, images);
    }
    return source;
  }

  applyImages(source as SiteContent, images);
  return source;
}

function applyImages(content: SiteContent, images: StockImage[]): void {
  let next = 0;
  const take = (): StockImage | undefined => images[next++ % images.length];

  for (const page of content.pages ?? []) {
    for (const section of page.sections ?? []) {
      switch (section.type) {
        case "hero":
        case "about": {
          // The hero gets the strongest image, so always start from the top.
          const img = images[0];
          if (img && !section.imageUrl) section.imageUrl = img.url;
          break;
        }
        case "gallery": {
          // Content authors leave gallery slots with captions but no URL; the
          // design filters those out, so filling them is what makes the
          // section appear at all.
          for (const item of section.items ?? []) {
            if (item.imageUrl) continue;
            const img = take();
            if (img) item.imageUrl = img.url;
          }
          break;
        }
        // Team portraits are deliberately left empty: a stock photo of a
        // stranger presented as a named employee is a fabrication, and every
        // design already degrades team members to a clean text block.
        default:
          break;
      }
    }
  }
}

function personaliseContent(content: SiteContent, lead: Lead): SiteContent {
  const previousName = content.siteName;
  content.siteName = lead.name;

  for (const page of content.pages ?? []) {
    page.sections = (page.sections ?? []).map((section) =>
      personaliseSection(section, lead, previousName),
    );
  }

  if (content.footer) {
    content.footer.text = replaceName(content.footer.text, previousName, lead.name);
    const socials = buildSocialLinks(lead);
    // Only override the template's placeholder socials when we actually found
    // some — an empty footer is better than links to the demo company's.
    if (socials.length > 0) content.footer.socials = socials;
    else delete content.footer.socials;
  }

  return content;
}

function personaliseSection(
  section: Section,
  lead: Lead,
  previousName: string | undefined,
): Section {
  switch (section.type) {
    case "hero":
      return {
        ...section,
        heading: replaceName(section.heading, previousName, lead.name) ?? lead.name,
        subheading: replaceName(section.subheading, previousName, lead.name),
      };

    case "contact":
      return {
        ...section,
        // Real details where we have them; drop the template's placeholders
        // where we don't, rather than showing someone else's phone number.
        phone: lead.phone ?? undefined,
        email: lead.email ?? undefined,
        address: lead.address ?? undefined,
        mapUrl: undefined,
      };

    case "about":
      return {
        ...section,
        heading: replaceName(section.heading, previousName, lead.name),
        body: replaceName(section.body, previousName, lead.name),
      };

    case "cta":
      return {
        ...section,
        heading: replaceName(section.heading, previousName, lead.name),
        subheading: replaceName(section.subheading, previousName, lead.name),
      };

    case "features":
      return {
        ...section,
        heading: replaceName(section.heading, previousName, lead.name),
      };

    // Stats, gallery, menu and products keep the template's own figures,
    // imagery and items — we have no real numbers, photos or prices for this
    // business, and inventing them would misrepresent it to the prospect.
    default:
      return section;
  }
}

function replaceName(
  text: string | undefined,
  previousName: string | undefined,
  nextName: string,
): string | undefined {
  if (!text) return text;
  if (!previousName || previousName === nextName) return text;
  return text.split(previousName).join(nextName);
}

function buildSocialLinks(lead: Lead): { label: string; href: string }[] {
  const socials = lead.socials;
  if (!socials) return [];

  const links: { label: string; href: string }[] = [];
  if (socials.instagram) links.push({ label: "Instagram", href: socials.instagram });
  if (socials.facebook) links.push({ label: "Facebook", href: socials.facebook });
  if (socials.linkedin) links.push({ label: "LinkedIn", href: socials.linkedin });
  return links;
}

/**
 * A readable, unguessable subdomain.
 *
 * The business name makes the link feel personal in outreach ("we built this
 * for you"), and the random suffix keeps demos from being enumerable by anyone
 * who guesses a competitor's name.
 */
async function uniqueSubdomain(businessName: string): Promise<string> {
  const base = slugify(businessName, 28) || "demo";

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomSuffix()}`;
    const taken = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.subdomain, candidate))
      .limit(1);
    if (taken.length === 0) return candidate;
  }

  throw new DemoGenerationError("Could not allocate a unique demo address");
}

function randomSuffix(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function demoUrl(subdomain: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "addvoxen.com";
  const protocol = root.includes("localhost") ? "http" : "https";
  return `${protocol}://${subdomain}.${root}`;
}

/** Read side for the lead detail panel. */
export async function getDemoForLead(leadId: string): Promise<GeneratedDemo | null> {
  const rows = await db
    .select({
      id: tenants.id,
      subdomain: tenants.subdomain,
      templateId: tenants.siteTemplateId,
      templateName: siteTemplates.name,
    })
    .from(tenants)
    .innerJoin(siteTemplates, eq(siteTemplates.id, tenants.siteTemplateId))
    .where(and(eq(tenants.leadId, leadId), eq(tenants.status, "demo")))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    tenantId: row.id,
    subdomain: row.subdomain,
    url: demoUrl(row.subdomain),
    templateId: row.templateId,
    templateName: row.templateName,
  };
}
