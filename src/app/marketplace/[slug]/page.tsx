/**
 * Şablon detal səhifəsi — təsvir, qiymət, canlı önizləmə və alış seçimləri.
 * Önizləmə URL-i cari host-a görə qurulur (dev: *.localhost:port, prod:
 * *.addvoxen.com) ki, həm lokal, həm prod-da işləsin.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { azn } from "@/lib/format";
import { BRAND } from "@/lib/brand";

/** Sifariş üçün əlaqə linki (ödəniş axını hələ aktiv deyil). */
function orderMail(templateName: string, plan: string) {
  const subject = `Sayt sifarişi: ${templateName} (${plan})`;
  return `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}`;
}

export const dynamic = "force-dynamic";

async function getTemplate(slug: string) {
  const rows = await db
    .select()
    .from(siteTemplates)
    .where(eq(siteTemplates.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) return { title: "Şablon tapılmadı" };
  return { title: t.name, description: t.tagline ?? undefined };
}

/** Cari host-dan önizləmə URL-i qurur (subdomen əlavə edir). */
async function buildPreviewUrl(sub: string | null): Promise<string | null> {
  if (!sub) return null;
  const h = await headers();
  const host = (h.get("host") ?? "").toLowerCase();
  const proto = host.startsWith("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  // Kök hostu (www-suz) götür və qarşısına subdomeni əlavə et.
  const baseHost = host.replace(/^www\./, "");
  return `${proto}://${sub}.${baseHost}`;
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) notFound();

  const previewUrl = await buildPreviewUrl(t.previewSubdomain);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Şablonlar
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Önizləmə */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-green-300" />
              </div>
              {t.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.thumbnailUrl} alt={t.name} className="h-80 w-full object-cover" />
              ) : (
                <div className="flex h-80 items-center justify-center bg-linear-to-br from-indigo-50 to-sky-50 text-indigo-300">
                  <span className="material-symbols-outlined text-6xl">web</span>
                </div>
              )}
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                Canlı önizləmə
              </a>
            )}
          </div>

          {/* Məlumat */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {t.type === "landing" ? "Landing" : "Çoxsəhifəli"}
              </span>
              <span className="text-xs text-slate-400">{t.category}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{t.name}</h1>
            {t.tagline && <p className="mt-2 text-lg text-slate-600">{t.tagline}</p>}
            {t.description && <p className="mt-4 leading-relaxed text-slate-500">{t.description}</p>}

            {/* Alış seçimləri */}
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-900">Abunə (hosted)</h3>
                  <span className="text-sm font-bold text-indigo-700">
                    {azn(t.priceSetupAzn)} + {azn(t.priceMonthlyAzn)}/ay
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">Biz host edirik, sən idarə edirsən. Öz domenini qoş.</p>
                <a
                  href={orderMail(t.name, "Abunə")}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Əlaqəyə keç
                </a>
              </div>

              {t.supportsExport && (
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold text-slate-900">Export (self-host)</h3>
                    <span className="text-sm font-bold text-slate-700">{azn(t.priceExportAzn)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Kod + admin + SQL dump — öz serverinə qur.</p>
                  <a
                    href={orderMail(t.name, "Export")}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    Əlaqəyə keç
                  </a>
                </div>
              )}
            </div>

            {/* Daxildir */}
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-600">
              {["Responsive dizayn", "SEO hazır", "Sürətli yüklənmə", "Panellə idarə", "SSL sertifikat", "Texniki dəstək"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-indigo-500">check_circle</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rəy/şərh — tezliklə */}
        <div className="mt-16 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
          Rəylər və şərhlər tezliklə əlavə olunacaq.
        </div>
      </div>
    </main>
  );
}
