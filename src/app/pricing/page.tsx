/**
 * Qiymət səhifəsi — MƏLUMAT XARAKTERLİ. Ödəniş axını hələ aktiv deyil;
 * sifariş üçün müştəri bizimlə əlaqə saxlayır (e-poçt). Qiymətlər saytdakı
 * şablon qiymətləri ilə eynidir.
 */
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { azn } from "@/lib/format";

export const metadata = {
  title: "Qiymətlər",
  description: "addvoxen hazır sayt qiymətləri — abunə və export. Məlumat xarakterli.",
};

const MAIL = `mailto:${BRAND.email}?subject=${encodeURIComponent("Sayt sifarişi — qiymət sorğusu")}`;

export default function PricingPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Qiymətlər</h1>
          <p className="mt-4 text-lg text-slate-600">
            Sadə və şəffaf. Aşağıdakı qiymətlər məlumat xarakterlidir — dəqiq təklif və
            sifariş üçün bizimlə əlaqə saxlayın.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
        <div className="grid gap-7 md:grid-cols-2">
          {/* Abunə */}
          <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">Ən populyar</span>
            <h2 className="mt-4 text-xl font-bold">Abunə (hosted)</h2>
            <p className="mt-2 text-slate-500">Saytı biz host edirik, sən idarə edirsən.</p>
            <p className="mt-6 text-3xl font-extrabold">{azn(10000)} <span className="text-base font-medium text-slate-400">giriş</span></p>
            <p className="text-lg font-semibold text-slate-700">+ {azn(5000)} / ay</p>
            <p className="mt-2 text-sm text-slate-400">Çoxsəhifəli saytlar üçün giriş və aylıq bir az yüksəkdir.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {["Managed hosting + SSL", "Öz domenini qoş", "Panellə tam idarə (mətn/rəng/logo)", "GA4 / GTM / Pixel inteqrasiyası", "Texniki dəstək"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-indigo-500">check_circle</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Export */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Developer / Agentlik</span>
            <h2 className="mt-4 text-xl font-bold">Export (self-host)</h2>
            <p className="mt-2 text-slate-500">Kodu, admini və SQL dump-ı al — öz serverinə qur.</p>
            <p className="mt-6 text-3xl font-extrabold">{azn(100000)} <span className="text-base font-medium text-slate-400">bir dəfəlik</span></p>
            <p className="mt-2 text-sm text-slate-400">Çoxsəhifəli saytlar üçün qiymət dəyişir.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {["Tam mənbə kodu (zip)", "Admin panel daxil", "SQL dump + install README", "Aylıq ödəniş yoxdur"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">check_circle</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Əlaqə zolağı */}
        <div className="mt-12 rounded-3xl bg-slate-50 p-8 text-center">
          <h3 className="text-xl font-semibold">Sifariş vermək istəyirsiniz?</h3>
          <p className="mx-auto mt-2 max-w-xl text-slate-500">
            Şablon seçin və bizimlə əlaqə saxlayın — qalanını biz edək. Sualınız varsa,
            e-poçt yazın.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/marketplace" className="inline-flex items-center rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white">
              Şablonlara bax
            </Link>
            <a href={MAIL} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
              <span className="material-symbols-outlined text-lg">mail</span>
              {BRAND.email}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
