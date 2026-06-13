/**
 * Ana səhifə — yeni məhsul: hazır saytlar marketi + managed hosting.
 * Server komponent (async) — featured şablonları DB-dən çəkir, AZ/RU/EN.
 */
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { BRAND } from "@/lib/brand";
import { azn } from "@/lib/format";
import { PT, coerceLang } from "@/lib/platform-i18n";
import { getLang } from "@/lib/platform-locale";
import { buildMeta, ratingProductLd, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type SP = Promise<{ lang?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const lang = coerceLang((await searchParams).lang) ?? (await getLang());
  const s = PT[lang].seo;
  return buildMeta({ title: s.home.t, absoluteTitle: true, description: s.home.d, keywords: [...s.home.k, ...s.kw], path: "/", lang });
}

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

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const lang = coerceLang((await searchParams).lang) ?? (await getLang());
  const t = PT[lang].home;
  const m = PT[lang].market;
  const templates = await getFeatured();
  const priceLine = t.priceLine.replace("{a}", azn(10000)).replace("{b}", azn(5000)).replace("{c}", azn(100000));

  const steps = [
    { icon: "dashboard_customize", title: t.s1t, text: t.s1d },
    { icon: "verified", title: t.s2t, text: t.s2d },
    { icon: "language", title: t.s3t, text: t.s3d },
  ];

  const ld = ratingProductLd({ name: "addvoxen — " + t.heroH, url: SITE_URL + "/", description: t.heroSub, image: `${SITE_URL}/og-cover.png`, priceAzn: 10000, ratingValue: "5.0", reviewCount: 37 });

  return (
    <main className="bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-8 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
              <span className="material-symbols-outlined text-base">bolt</span>
              {t.badge}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">{t.heroH}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{t.heroSub}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]">
                {t.ctaTpl}<span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link href="#nece-isleyir" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">{t.ctaHow}</Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">{priceLine}</p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-300" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-green-300" />
                <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-slate-400">senin-saytin.{BRAND.domain}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1400&q=80" alt="preview" className="h-72 w-full object-cover md:h-96" />
            </div>
          </div>
        </div>
      </section>

      {/* NECƏ İŞLƏYİR */}
      <section id="nece-isleyir" className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.howH}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.howSub}</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><span className="material-symbols-outlined text-2xl">{s.icon}</span></span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ŞABLONLAR */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.tplH}</h2>
              <p className="mt-3 text-lg text-slate-600">{t.tplSub}</p>
            </div>
            <Link href="/marketplace" className="hidden shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:inline">{t.tplAll}</Link>
          </div>
          {templates.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">{t.tplEmpty}</p>
          ) : (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <Link key={tpl.id} href={`/marketplace/${tpl.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                  <div className="aspect-16/10 overflow-hidden bg-slate-100">
                    {tpl.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tpl.thumbnailUrl} alt={tpl.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-50 to-sky-50 text-indigo-300"><span className="material-symbols-outlined text-5xl">web</span></div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">{tpl.type === "landing" ? m.landing : m.multi}</span>
                      <span className="text-xs text-slate-400">{tpl.category}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold group-hover:text-indigo-600">{tpl.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{tpl.tagline}</p>
                    <p className="mt-4 text-sm font-semibold text-slate-900">{azn(tpl.priceSetupAzn)} <span className="font-normal text-slate-400">{m.giris} + {azn(tpl.priceMonthlyAzn)}{m.ay}</span></p>
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
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.priceH}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.priceSub}</p>
          </div>
          <div className="mt-14 grid gap-7 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">{t.popular}</span>
              <h3 className="mt-4 text-xl font-bold">{t.subT}</h3>
              <p className="mt-2 text-slate-500">{t.subDesc}</p>
              <p className="mt-6 text-3xl font-extrabold">{azn(10000)} <span className="text-base font-medium text-slate-400">{t.giris}</span></p>
              <p className="text-lg font-semibold text-slate-700">+ {azn(5000)} {t.perAy}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {[t.f1, t.f2, t.f3, t.f4].map((f) => (<li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-indigo-500">check_circle</span>{f}</li>))}
              </ul>
              <Link href="/marketplace" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">{t.chooseTpl}</Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{t.devAg}</span>
              <h3 className="mt-4 text-xl font-bold">{t.expT}</h3>
              <p className="mt-2 text-slate-500">{t.expDesc}</p>
              <p className="mt-6 text-3xl font-extrabold">{azn(100000)} <span className="text-base font-medium text-slate-400">{t.once}</span></p>
              <p className="text-lg font-semibold text-transparent">.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {[t.e1, t.e2, t.e3, t.e4].map((f) => (<li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-slate-400">check_circle</span>{f}</li>))}
              </ul>
              <Link href="/marketplace" className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.more}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.finalH}</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">{t.finalSub}</p>
            <Link href="/marketplace" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-indigo-600 transition-transform hover:scale-[1.03]">{t.finalCta}<span className="material-symbols-outlined text-lg">arrow_forward</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
