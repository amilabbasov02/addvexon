/**
 * Ana səhifə — yeni məhsul: hazır saytlar marketi + managed hosting.
 * Server komponent (async) — featured şablonları birbaşa DB-dən çəkir.
 * Dizayn: açıq/işıqlı, çoxlu boşluq, yuvarlaq künclər, modern sans-serif.
 */
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { BRAND } from "@/lib/brand";
import { azn } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getFeatured() {
  try {
    return await db
      .select()
      .from(siteTemplates)
      .where(eq(siteTemplates.published, true))
      .orderBy(siteTemplates.sortOrder, desc(siteTemplates.createdAt))
      .limit(6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const templates = await getFeatured();

  return (
    <main className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-8 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
              <span className="material-symbols-outlined text-base">bolt</span>
              Kod yazmadan, dəqiqələr içində
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
              {BRAND.tagline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {BRAND.description}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
              >
                Şablonlara bax
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link
                href="#nece-isleyir"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Necə işləyir?
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Abunə: {azn(10000)} giriş + {azn(5000)}/ay · və ya export {azn(100000)}
            </p>
          </div>

          {/* Browser mockup */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-green-300" />
                <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-slate-400">
                  senin-saytin.{BRAND.domain}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1400&q=80"
                alt="Sayt önizləməsi"
                className="h-72 w-full object-cover md:h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NECƏ İŞLƏYİR */}
      <section id="nece-isleyir" className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Necə işləyir?</h2>
            <p className="mt-4 text-lg text-slate-600">Üç sadə addım — qalanını biz edirik.</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "dashboard_customize",
                title: "1. Şablon seç",
                text: "Marketdən bəyəndiyin hazır saytı seç, canlı önizləməyə bax.",
              },
              {
                icon: "verified",
                title: "2. Ödə və təsdiqlə",
                text: "Ödənişdən sonra saytın bizim serverdə aktivləşir — heç bir quraşdırma yoxdur.",
              },
              {
                icon: "language",
                title: "3. Domenini qoş, idarə et",
                text: "Öz domenini qoş, panellə mətn/rəng/logonu dəyiş — istədiyin kimi.",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ŞABLONLAR */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Hazır şablonlar</h2>
              <p className="mt-3 text-lg text-slate-600">Sənayəyə uyğun, peşəkar dizaynlar.</p>
            </div>
            <Link href="/marketplace" className="hidden shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:inline">
              Hamısına bax →
            </Link>
          </div>

          {templates.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
              Hələ şablon əlavə olunmayıb.
            </p>
          ) : (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/marketplace/${t.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {t.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnailUrl} alt={t.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-300">
                        <span className="material-symbols-outlined text-5xl">web</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                        {t.type === "landing" ? "Landing" : "Çoxsəhifəli"}
                      </span>
                      <span className="text-xs text-slate-400">{t.category}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold group-hover:text-indigo-600">{t.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.tagline}</p>
                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      {azn(t.priceSetupAzn)} <span className="font-normal text-slate-400">giriş + {azn(t.priceMonthlyAzn)}/ay</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* QİYMƏT */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Sadə qiymət</h2>
            <p className="mt-4 text-lg text-slate-600">Gizli xərc yoxdur. İstədiyin modeli seç.</p>
          </div>
          <div className="mt-14 grid gap-7 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">Ən populyar</span>
              <h3 className="mt-4 text-xl font-bold">Abunə (hosted)</h3>
              <p className="mt-2 text-slate-500">Saytı biz host edirik, sən idarə edirsən.</p>
              <p className="mt-6 text-3xl font-extrabold">{azn(10000)} <span className="text-base font-medium text-slate-400">giriş</span></p>
              <p className="text-lg font-semibold text-slate-700">+ {azn(5000)} / ay</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {["Managed hosting + SSL", "Öz domenini qoş", "Panellə tam idarə", "Texniki dəstək"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-indigo-500">check_circle</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/marketplace" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">
                Şablon seç
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Developer / Agentlik</span>
              <h3 className="mt-4 text-xl font-bold">Export (self-host)</h3>
              <p className="mt-2 text-slate-500">Kodu, admini və SQL dump-ı al — öz serverinə qur.</p>
              <p className="mt-6 text-3xl font-extrabold">{azn(100000)} <span className="text-base font-medium text-slate-400">bir dəfəlik</span></p>
              <p className="text-lg font-semibold text-transparent">.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {["Tam mənbə kodu (zip)", "Admin panel daxil", "SQL dump + install README", "Aylıq ödəniş yoxdur"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-slate-400">check_circle</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/marketplace" className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Ətraflı
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Saytını bu gün canlandır</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Şablonu seç, qalanını biz edək. Bir neçə dəqiqəyə öz domenində canlı sayt.
            </p>
            <Link href="/marketplace" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-indigo-600 transition-transform hover:scale-[1.03]">
              İndi başla
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
