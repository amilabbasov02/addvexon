/**
 * Tenant resolve helper-ləri (server, Node runtime).
 * Host → tenant + məzmun + inteqrasiya yükləməsi. Tenant render route
 * qrupunda (`app/_sites/...`) istifadə olunur. Middleware bunu İMPORT
 * ETMƏMƏLİDİR (pg edge-də işləmir) — middleware yalnız tenant-host.ts.
 */
import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  tenants,
  tenantContent,
  tenantIntegrations,
  siteTemplates,
} from "@/db/schema";
import { parseHost } from "@/lib/tenant-host";

export type ResolvedTenant = {
  tenant: typeof tenants.$inferSelect;
  template: typeof siteTemplates.$inferSelect;
  content: typeof tenantContent.$inferSelect | null;
  integrations: typeof tenantIntegrations.$inferSelect | null;
};

/** Host header-dən aktiv tenant-ı tapır. Yalnız `active` tenant render
 *  olunur. Tapılmasa null. React cache ilə eyni request-də təkrarlanmır. */
export const resolveTenantByHost = cache(
  async (rawHost: string | null | undefined): Promise<ResolvedTenant | null> => {
    const parsed = parseHost(rawHost);
    if (parsed.kind !== "tenant") return null;

    const where = parsed.subdomain
      ? eq(tenants.subdomain, parsed.subdomain)
      : parsed.customDomain
        ? eq(tenants.customDomain, parsed.customDomain)
        : null;
    if (!where) return null;

    const rows = await db
      .select()
      .from(tenants)
      .where(where)
      .limit(1);
    const tenant = rows[0];
    if (!tenant || tenant.status !== "active") return null;

    const [template] = await db
      .select()
      .from(siteTemplates)
      .where(eq(siteTemplates.id, tenant.siteTemplateId))
      .limit(1);
    if (!template) return null;

    const [content] = await db
      .select()
      .from(tenantContent)
      .where(eq(tenantContent.tenantId, tenant.id))
      .limit(1);

    const [integrations] = await db
      .select()
      .from(tenantIntegrations)
      .where(eq(tenantIntegrations.tenantId, tenant.id))
      .limit(1);

    return {
      tenant,
      template,
      content: content ?? null,
      integrations: integrations ?? null,
    };
  },
);
