/**
 * Marketplace — hazır sayt şablonları kataloqu (yeni məhsul).
 * `siteTemplates`-dən oxuyur. Tip (landing/çoxsəhifəli) və kateqoriya filtri
 * searchParams ilə. Hər kart şablonun detal səhifəsinə keçir.
 */
import Link from "next/link";
import { and, eq, asc, desc, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { siteTemplates } from "@/db/schema";
import { azn } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = { type?: string; category?: string; q?: string };

async function loadTemplates(s: Search) {
  const conds = [eq(siteTemplates.published, true)];
  if (s.type === "landing" || s.type === "multipage")
    conds.push(eq(siteTemplates.type, s.type));
  if (s.category) conds.push(eq(siteTemplates.category, s.category));
  if (s.q) conds.push(ilike(siteTemplates.name, `%${s.q}%`));
  return db
    .select()
    .from(siteTemplates)
    .where(and(...conds))
    .orderBy(asc(siteTemplates.sortOrder), desc(siteTemplates.createdAt))
    .limit(60);
}

async function loadCategories() {
  return db
    .select({ category: siteTemplates.category, n: sql<number>`count(*)::int` })
    .from(siteTemplates)
    .where(eq(siteTemplates.published, true))
    .groupBy(siteTemplates.category)
    .orderBy(desc(sql`count(*)`));
}

function FilterChip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
        (active
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
      }
    >
      {children}
    </Link>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const [items, categories] = await Promise.all([
    loadTemplates(params),
    loadCategories(),
  ]);

  const qs = (patch: Partial<Search>) => {
    const merged = { ...params, ...patch };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/marketplace?${s}` : "/marketplace";
  };

  return (
    <main className="bg-white">
      {/* Başlıq */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hazır sayt şablonları</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Sənayəyə uyğun, peşəkar dizaynlar. Birini seç — qalanını biz edək.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        {/* Filtrlər */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={!params.type} href={qs({ type: undefined })}>Hamısı</FilterChip>
          <FilterChip active={params.type === "landing"} href={qs({ type: "landing" })}>Landing</FilterChip>
          <FilterChip active={params.type === "multipage"} href={qs({ type: "multipage" })}>Çoxsəhifəli</FilterChip>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <FilterChip active={!params.category} href={qs({ category: undefined })}>Bütün kateqoriyalar</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.category} active={params.category === c.category} href={qs({ category: c.category })}>
              {c.category} ({c.n})
            </FilterChip>
          ))}
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            Bu filtrə uyğun şablon tapılmadı.
          </p>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <Link
                key={t.id}
                href={`/marketplace/${t.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="aspect-16/10 overflow-hidden bg-slate-100">
                  {t.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnailUrl} alt={t.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-50 to-sky-50 text-indigo-300">
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
    </main>
  );
}
