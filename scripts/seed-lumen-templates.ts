/**
 * Seeds the five second-generation site templates and their preview tenants.
 *
 * Idempotent: re-running updates the template row and replaces the preview
 * content rather than creating duplicates, so this is safe to run after every
 * content edit.
 *
 *   pnpm seed:templates
 *
 * Each template gets a preview tenant at its `previewSubdomain`. That tenant is
 * what the marketplace links to, and — importantly — what the Lead Finder demo
 * generator clones when it builds a personalised demo for a business.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import {
  siteTemplates,
  tenantContent,
  tenants,
  users,
} from "../src/db/schema";
import { uid } from "../src/lib/ids";
import type { LocalizedBundle, SiteContent, SiteTheme } from "../src/lib/site-content";
import {
  fetchImagesForQuery,
  imageProviderConfigured,
  type StockImage,
} from "../src/lib/leads/image-provider";

import { lumenContent, lumenTheme } from "./seed-content/lumen";
import { emberContent, emberTheme } from "./seed-content/ember";
import { meridianContent, meridianTheme } from "./seed-content/meridian";
import { forgeContent, forgeTheme } from "./seed-content/forge";
import { atlasContent, atlasTheme } from "./seed-content/atlas";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { siteTemplates, tenants, tenantContent, users } });

type TemplateSpec = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  previewSubdomain: string;
  content: LocalizedBundle;
  theme: SiteTheme;
  /** Lower sorts first. 1-5 so these outrank the first-generation templates,
   * which sit at 90 — findTemplateForCategory() takes the lowest per category. */
  sortOrder: number;
  priceSetupAzn: number;
  priceMonthlyAzn: number;
  priceExportAzn: number;
  /** Stock-photo search term — templates do not map onto the lead niches. */
  imageQuery: string;
  imageAlt: string;
};

/**
 * Prices are in qəpik. The setup fee sits at 300-400 AZN because that is the
 * band these fuller templates are built to justify — twelve sections, real
 * copy in three languages, and a design that does not look templated.
 */
const TEMPLATES: TemplateSpec[] = [
  {
    slug: "gozellik-lumen",
    name: "Gözəllik Salonu — Lumen",
    category: "Gözəllik",
    tagline: "Gözəllik salonu və spa üçün editorial dizayn",
    description:
      "Jurnal estetikası, asimmetrik qalereya, xidmət indeksi, qiymət siyahısı və onlayn qeydiyyat çağırışı. 12 bölmə, AZ/EN/RU.",
    previewSubdomain: "demo-lumen",
    imageQuery: "modern hair salon interior",
    imageAlt: "Gözəllik salonu interyeri",
    content: lumenContent,
    theme: lumenTheme,
    sortOrder: 1,
    priceSetupAzn: 35000,
    priceMonthlyAzn: 6000,
    priceExportAzn: 120000,
  },
  {
    slug: "restoran-ember",
    name: "Restoran — Ember",
    category: "Restoran",
    tagline: "Restoran və kafe üçün tünd, isti dizayn",
    description:
      "Çap menyu kartı təsiri, qrup üzrə menyu, set menyular, komanda və iş saatları. 12 bölmə, AZ/EN/RU.",
    previewSubdomain: "demo-ember",
    imageQuery: "restaurant interior warm dining",
    imageAlt: "Restoran zalı",
    content: emberContent,
    theme: emberTheme,
    sortOrder: 2,
    priceSetupAzn: 35000,
    priceMonthlyAzn: 6000,
    priceExportAzn: 120000,
  },
  {
    slug: "klinika-meridian",
    name: "Klinika — Meridian",
    category: "Səhiyyə",
    tagline: "Diş və tibb klinikaları üçün sakit, dəqiq dizayn",
    description:
      "Xidmətlər spesifikasiya siyahısı kimi, həkim komandası, müalicə prosesi, indikativ qiymətlər və daimi qeydiyyat düyməsi. 12 bölmə, AZ/EN/RU.",
    previewSubdomain: "demo-meridian",
    imageQuery: "modern dental clinic interior",
    imageAlt: "Diş klinikası interyeri",
    content: meridianContent,
    theme: meridianTheme,
    sortOrder: 3,
    priceSetupAzn: 35000,
    priceMonthlyAzn: 6000,
    priceExportAzn: 120000,
  },
  {
    slug: "fitnes-forge",
    name: "İdman Klubu — Forge",
    category: "Fitnes",
    tagline: "Fitnes və idman klubları üçün yüksək kontrastlı dizayn",
    description:
      "Tünd fon, iri rəqəmlər, abunə paketləri, məşqçilər və dərs cədvəli. 13 bölmə, AZ/EN/RU.",
    previewSubdomain: "demo-forge",
    imageQuery: "modern gym interior training",
    imageAlt: "İdman zalı",
    content: forgeContent,
    theme: forgeTheme,
    sortOrder: 4,
    priceSetupAzn: 35000,
    priceMonthlyAzn: 6000,
    priceExportAzn: 120000,
  },
  {
    slug: "korporativ-atlas",
    name: "Korporativ — Atlas",
    category: "Korporativ",
    tagline: "Xidmət və B2B şirkətləri üçün struktur dizayn",
    description:
      "Redaksiya şəbəkəsi, xidmət siyahısı, iş prosesi, tarif cədvəli və partnyor zolağı. 13 bölmə, AZ/EN/RU.",
    previewSubdomain: "demo-atlas",
    imageQuery: "modern office meeting workspace",
    imageAlt: "Ofis interyeri",
    content: atlasContent,
    theme: atlasTheme,
    sortOrder: 5,
    priceSetupAzn: 40000,
    priceMonthlyAzn: 7000,
    priceExportAzn: 150000,
  },
];

/**
 * Fill the preview content's photo slots.
 *
 * Every locale of a template shows the same premises, so one fetch covers all
 * three. Fields already carrying a URL are never overwritten — hand-picked
 * photography always beats stock, and re-running the seeder must not undo it.
 */
async function fillPreviewImages(spec: TemplateSpec): Promise<LocalizedBundle> {
  if (!imageProviderConfigured()) return spec.content;

  const images = await fetchImagesForQuery(spec.imageQuery, 12, spec.imageAlt);
  if (images.length === 0) {
    console.log("    (no images returned — seeding text-only)");
    return spec.content;
  }

  for (const locale of Object.keys(spec.content.locales) as (keyof LocalizedBundle["locales"])[]) {
    const content = spec.content.locales[locale];
    if (content) applyImages(content, images);
  }

  console.log(`    ${images.length} images applied`);
  return spec.content;
}

function applyImages(content: SiteContent, images: StockImage[]): void {
  let next = 0;
  const take = (): string | undefined => images[next++ % images.length]?.url;

  for (const page of content.pages ?? []) {
    for (const section of page.sections ?? []) {
      switch (section.type) {
        case "hero":
          section.imageUrl ??= images[0]?.url;
          break;
        case "about":
        case "cta":
        case "stats":
          section.imageUrl ??= take();
          break;
        case "gallery":
          for (const item of section.items ?? []) item.imageUrl ??= take();
          break;
        case "features":
          for (const item of section.items ?? []) item.imageUrl ??= take();
          break;
        case "menu": {
          section.imageUrl ??= take();
          // A plate on every line stops reading as a menu; a few is enough.
          let plated = 0;
          for (const group of section.groups ?? []) {
            for (const item of group.items ?? []) {
              if (item.imageUrl || plated >= 4) continue;
              item.imageUrl = take();
              plated++;
            }
          }
          break;
        }
        // Team portraits stay empty on purpose: a stock photo of a stranger
        // captioned with a named person is a fabrication, and the designs
        // render a deliberate initials tile instead.
        default:
          break;
      }
    }
  }
}

async function resolveOwner(): Promise<string> {
  // Preview tenants need an owner row; the admin account is the natural one.
  const preferred = ["admin@addvoxen.com", "amilabbas451.19@gmail.com"];
  for (const email of preferred) {
    const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (found[0]) return found[0].id;
  }
  const any = await db.select({ id: users.id }).from(users).limit(1);
  if (!any[0]) throw new Error("No users exist — sign up once before seeding.");
  return any[0].id;
}

async function seedTemplate(spec: TemplateSpec, ownerId: string): Promise<void> {
  const existing = await db
    .select({ id: siteTemplates.id })
    .from(siteTemplates)
    .where(eq(siteTemplates.slug, spec.slug))
    .limit(1);

  const templateValues = {
    name: spec.name,
    type: "landing" as const,
    category: spec.category,
    tagline: spec.tagline,
    description: spec.description,
    previewSubdomain: spec.previewSubdomain,
    priceSetupAzn: spec.priceSetupAzn,
    priceMonthlyAzn: spec.priceMonthlyAzn,
    priceExportAzn: spec.priceExportAzn,
    supportsExport: true,
    published: true,
    sortOrder: spec.sortOrder,
    updatedAt: new Date(),
  };

  let templateId: string;
  if (existing[0]) {
    templateId = existing[0].id;
    await db.update(siteTemplates).set(templateValues).where(eq(siteTemplates.id, templateId));
    console.log(`  ↻ template ${spec.slug}`);
  } else {
    templateId = uid("tpl");
    await db.insert(siteTemplates).values({ id: templateId, slug: spec.slug, ...templateValues });
    console.log(`  + template ${spec.slug}`);
  }

  // Preview tenant — the design reference the demo generator clones.
  const existingTenant = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.subdomain, spec.previewSubdomain))
    .limit(1);

  let tenantId: string;
  if (existingTenant[0]) {
    tenantId = existingTenant[0].id;
    await db
      .update(tenants)
      .set({ siteTemplateId: templateId, name: spec.name, status: "active", updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));
  } else {
    tenantId = uid("tnt");
    await db.insert(tenants).values({
      id: tenantId,
      ownerId,
      siteTemplateId: templateId,
      name: spec.name,
      subdomain: spec.previewSubdomain,
      status: "active",
      deliveryType: "hosted",
    });
  }

  // Photography, if a provider key is configured. Without one the templates
  // seed text-only and the designs fall back to their plainer layouts — which
  // is why the "no images" path has to keep working.
  const withImages = await fillPreviewImages(spec);

  const content = withImages as unknown as Record<string, unknown>;
  const theme = spec.theme as unknown as Record<string, unknown>;

  const existingContent = await db
    .select({ tenantId: tenantContent.tenantId })
    .from(tenantContent)
    .where(eq(tenantContent.tenantId, tenantId))
    .limit(1);

  if (existingContent[0]) {
    await db
      .update(tenantContent)
      .set({ content, theme, updatedAt: new Date() })
      .where(eq(tenantContent.tenantId, tenantId));
  } else {
    await db.insert(tenantContent).values({ tenantId, content, theme });
  }

  const locales = Object.keys(spec.content.locales ?? {});
  const sections = spec.content.locales?.az?.pages?.[0]?.sections?.length ?? 0;
  console.log(`    preview → ${spec.previewSubdomain}  (${locales.join("/")}, ${sections} sections)`);
}

async function main() {
  const ownerId = await resolveOwner();
  console.log(`\nSeeding ${TEMPLATES.length} templates…\n`);
  for (const spec of TEMPLATES) await seedTemplate(spec, ownerId);
  console.log("\nDone.\n");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
