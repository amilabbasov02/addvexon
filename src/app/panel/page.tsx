/**
 * Müştəri paneli — giriş etmiş istifadəçinin saytları (tenant).
 * Hər müştəri öz saytlarını buradan idarə edir (B-tipli admin).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { tenants, siteTemplates } from "@/db/schema";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: "Aktiv", cls: "bg-green-50 text-green-700" },
  pending: { text: "Gözləyir", cls: "bg-amber-50 text-amber-700" },
  suspended: { text: "Dayandırılıb", cls: "bg-red-50 text-red-700" },
  canceled: { text: "Ləğv edilib", cls: "bg-slate-100 text-slate-500" },
};

export default async function PanelPage() {
  const session = await getSession();
  if (!session?.user) redirect("/signin?next=/panel");

  const rows = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      subdomain: tenants.subdomain,
      customDomain: tenants.customDomain,
      status: tenants.status,
      templateName: siteTemplates.name,
    })
    .from(tenants)
    .leftJoin(siteTemplates, eq(siteTemplates.id, tenants.siteTemplateId))
    .where(eq(tenants.ownerId, session.user.id))
    .orderBy(desc(tenants.createdAt));

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saytlarım</h1>
            <p className="mt-1 text-slate-500">Saytlarınızı buradan idarə edin.</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Hələ saytınız yoxdur.</p>
            <Link href="/marketplace" className="mt-4 inline-flex rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">
              Şablon seç
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {rows.map((t) => {
              const st = STATUS_LABEL[t.status] ?? STATUS_LABEL.pending;
              return (
                <div key={t.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">{t.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Şablon: {t.templateName ?? "—"} · {t.customDomain ?? `${t.subdomain}.addvoxen.com`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={`http://${t.subdomain}.localhost:3000`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Bax
                    </a>
                    <Link
                      href={`/panel/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      İdarə et
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
