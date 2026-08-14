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
import type { LocalizedBundle, SiteTheme } from "../src/lib/site-content";

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
    content: atlasContent,
    theme: atlasTheme,
    sortOrder: 5,
    priceSetupAzn: 40000,
    priceMonthlyAzn: 7000,
    priceExportAzn: 150000,
  },
];

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

  const content = spec.content as unknown as Record<string, unknown>;
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
