/**
 * Qiymət səhifəsi — MƏLUMAT XARAKTERLİ, çoxdilli (AZ/RU/EN). Sifariş üçün
 * müştəri bizimlə əlaqə saxlayır.
 */
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { azn } from "@/lib/format";
import { PT } from "@/lib/platform-i18n";
import { getLang } from "@/lib/platform-locale";
import { buildMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const s = PT[lang].seo;
  return buildMeta({ title: s.price.t, description: s.price.d, keywords: [...s.price.k, ...s.kw], path: "/pricing", lang });
}

const MAIL = `mailto:${BRAND.email}?subject=${encodeURIComponent("Sayt sifarişi")}`;

export default async function PricingPage() {
  const lang = await getLang();
  const p = PT[lang].price;
  const devAg = PT[lang].home.devAg;
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{p.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{p.sub}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
        <div className="grid gap-7 md:grid-cols-2">
          <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">{p.popular}</span>
            <h2 className="mt-4 text-xl font-bold">{p.subT}</h2>
            <p className="mt-2 text-slate-500">{p.subDesc}</p>
            <p className="mt-6 text-3xl font-extrabold">{azn(10000)} <span className="text-base font-medium text-slate-400">{p.giris}</span></p>
            <p className="text-lg font-semibold text-slate-700">+ {azn(5000)} {p.perAy}</p>
            <p className="mt-2 text-sm text-slate-400">{p.multiNote}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[p.f1, p.f2, p.f3, p.f4, p.f5].map((f) => (<li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-indigo-500">check_circle</span>{f}</li>))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{devAg}</span>
            <h2 className="mt-4 text-xl font-bold">{p.expT}</h2>
            <p className="mt-2 text-slate-500">{p.expDesc}</p>
            <p className="mt-6 text-3xl font-extrabold">{azn(100000)} <span className="text-base font-medium text-slate-400">{p.once}</span></p>
            <p className="mt-2 text-sm text-slate-400">{p.multiNote2}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[p.e1, p.e2, p.e3, p.e4].map((f) => (<li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-slate-400">check_circle</span>{f}</li>))}
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-3xl bg-slate-50 p-8 text-center">
          <h3 className="text-xl font-semibold">{p.orderH}</h3>
          <p className="mx-auto mt-2 max-w-xl text-slate-500">{p.orderDesc}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/marketplace" className="inline-flex items-center rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white">{p.browse}</Link>
            <a href={MAIL} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-white"><span className="material-symbols-outlined text-lg">mail</span>{BRAND.email}</a>
          </div>
        </div>
      </div>
    </main>
  );
}
