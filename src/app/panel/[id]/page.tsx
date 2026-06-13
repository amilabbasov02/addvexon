/**
 * Tenant idarəetmə səhifəsi (müştəri admini). Sahiblik yoxlanır, məzmun +
 * tema + inteqrasiyalar client editor-a ötürülür.
 */
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants, tenantContent, tenantIntegrations } from "@/db/schema";
import { getSession } from "@/lib/session";
import { PanelEditor } from "@/components/panel/PanelEditor";
import type { SiteTheme } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function PanelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect(`/signin?next=/panel/${id}`);

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, id), eq(tenants.ownerId, session.user.id)))
    .limit(1);
  if (!tenant) notFound();

  const [content] = await db
    .select()
    .from(tenantContent)
    .where(eq(tenantContent.tenantId, id))
    .limit(1);
  const [integrations] = await db
    .select()
    .from(tenantIntegrations)
    .where(eq(tenantIntegrations.tenantId, id))
    .limit(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <Link href="/panel" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Saytlarım
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{tenant.name} — idarəetmə</h1>
        <p className="mt-1 text-sm text-slate-500">
          Canlı sayt:{" "}
          <a className="text-indigo-600 hover:underline" href={`http://${tenant.subdomain}.localhost:3000`} target="_blank" rel="noreferrer">
            {tenant.subdomain}.addvoxen.com
          </a>
        </p>

        <PanelEditor
          tenantId={tenant.id}
          subdomain={tenant.subdomain}
          name={tenant.name}
          customDomain={tenant.customDomain}
          content={content?.content ?? null}
          theme={(content?.theme ?? {}) as SiteTheme}
          integrations={{
            ga4Id: integrations?.ga4Id ?? "",
            gtmContainerId: integrations?.gtmContainerId ?? "",
            metaPixelId: integrations?.metaPixelId ?? "",
            googleVerification: integrations?.googleVerification ?? "",
            metaVerification: integrations?.metaVerification ?? "",
          }}
        />
      </div>
    </main>
  );
}
