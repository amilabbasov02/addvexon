/** Hüquqi səhifələr üçün ortaq işıqlı tərtibat (privacy/terms/refund). */
export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Hüquqi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Son yenilənmə: {updated}</p>
        <article className="legal-body mt-10 space-y-6 text-slate-600">
          {children}
        </article>
      </div>
    </main>
  );
}

/** Bölmə başlığı + mətn helper-i. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}
