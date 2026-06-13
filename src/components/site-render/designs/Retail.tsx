/**
 * "retail" dizaynı — mağaza/e-ticarət. Təmiz, açıq, məhsul grid-i, qiymət
 * etiketləri, "səbət" hissi. Care/Bistro/Corporate-dan fərqli.
 */
import type {
  SiteContent, SiteTheme, Page, Section, Locale,
  HeroSection, ProductsSection, FeaturesSection, ContactSection, CtaSection,
} from "@/lib/site-content";

const UI: Record<Locale, { shop: string; buy: string; phone: string; email: string; address: string }> = {
  az: { shop: "Mağaza", buy: "Bax", phone: "Telefon", email: "E-poçt", address: "Ünvan" },
  en: { shop: "Shop", buy: "View", phone: "Phone", email: "Email", address: "Address" },
  ru: { shop: "Магазин", buy: "Смотреть", phone: "Телефон", email: "Эл. почта", address: "Адрес" },
};
const h: React.CSSProperties = { fontFamily: "var(--site-font-heading)" };

export function RetailDesign({ content, page, theme, lang = "az" }: { content: SiteContent; page: Page; theme: SiteTheme; lang?: Locale }) {
  const ui = UI[lang];
  const name = content.siteName ?? "Mağaza";
  return (
    <div style={{ background: "var(--site-bg)", color: "var(--site-text)", fontFamily: "var(--site-font-body)" }}>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="/" className="flex items-center gap-2">
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logoUrl} alt={name} className="h-8 w-auto" />
            ) : (
              <span style={h} className="text-lg font-extrabold tracking-tight">{name}</span>
            )}
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {(content.nav ?? []).map((n, i) => (
              <a key={i} href={n.href} className="text-sm font-medium text-slate-600 hover:text-slate-900">{n.label}</a>
            ))}
          </nav>
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: "var(--site-primary)" }}>
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
          </span>
        </div>
      </header>
      <main>{page.sections.map((s, i) => <SectionView key={i} section={s} ui={ui} />)}</main>
      <footer className="border-t border-black/5" style={{ background: "var(--site-surface)" }}>
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm" style={{ color: "var(--site-muted)" }}>{content.footer?.text ?? `© ${name}`}</div>
      </footer>
    </div>
  );
}
type RUi = { shop: string; buy: string; phone: string; email: string; address: string };
function SectionView({ section, ui }: { section: Section; ui: RUi }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} />;
    case "products": return <Products {...(section as ProductsSection)} ui={ui} />;
    case "features": return <Features {...(section as FeaturesSection)} />;
    case "contact": return <Contact {...(section as ContactSection)} ui={ui} />;
    case "cta": return <Cta {...(section as CtaSection)} />;
    default: return null;
  }
}
function Hero(s: HeroSection) {
  return (
    <section style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
        <div>
          <h1 style={h} className="text-4xl font-extrabold tracking-tight md:text-5xl">{s.heading}</h1>
          {s.subheading && <p className="mt-4 text-lg" style={{ color: "var(--site-muted)" }}>{s.subheading}</p>}
          {s.ctaText && <a href={s.ctaUrl ?? "#"} className="mt-7 inline-flex rounded-lg px-7 py-3.5 text-sm font-semibold text-white shadow-sm" style={{ background: "var(--site-primary)" }}>{s.ctaText}</a>}
        </div>
        {s.imageUrl && <div className="overflow-hidden rounded-2xl shadow-lg">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.imageUrl} alt={s.heading} className="aspect-4/3 w-full object-cover" /></div>}
      </div>
    </section>
  );
}
function Products(s: ProductsSection & { ui: RUi }) {
  return (
    <section id="mehsullar" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {s.heading && <h2 style={h} className="mb-10 text-3xl font-bold tracking-tight">{s.heading}</h2>}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {s.items.map((p, i) => (
            <div key={i} className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {p.imageUrl && <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></>}
                {p.tag && <span className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: "var(--site-primary)" }}>{p.tag}</span>}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{p.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  {p.price && <span className="font-bold" style={{ color: "var(--site-primary)" }}>{p.price}</span>}
                  <span className="text-xs font-medium" style={{ color: "var(--site-muted)" }}>{s.ui.buy} →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Features(s: FeaturesSection) {
  return (
    <section style={{ background: "var(--site-surface)" }} className="py-14">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
        {s.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            {it.icon && <span className="material-symbols-outlined text-2xl" style={{ color: "var(--site-primary)" }}>{it.icon}</span>}
            <div><div className="font-semibold">{it.title}</div>{it.text && <div className="text-sm" style={{ color: "var(--site-muted)" }}>{it.text}</div>}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Contact(s: ContactSection & { ui: RUi }) {
  return (
    <section id="elaqe" className="py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 style={h} className="text-3xl font-bold tracking-tight">{s.heading ?? s.ui.address}</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm" style={{ color: "var(--site-muted)" }}>
          {s.phone && <span>{s.ui.phone}: <a href={`tel:${s.phone}`} style={{ color: "var(--site-text)" }}>{s.phone}</a></span>}
          {s.email && <span>{s.ui.email}: <a href={`mailto:${s.email}`} style={{ color: "var(--site-text)" }}>{s.email}</a></span>}
          {s.address && <span>{s.ui.address}: {s.address}</span>}
        </div>
      </div>
    </section>
  );
}
function Cta(s: CtaSection) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 rounded-2xl px-8 py-10 text-white md:flex-row" style={{ background: "var(--site-primary)" }}>
        <h2 style={h} className="text-2xl font-bold">{s.heading}</h2>
        {s.ctaText && <a href={s.ctaUrl ?? "#"} className="rounded-lg bg-white px-6 py-3 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>{s.ctaText}</a>}
      </div>
    </section>
  );
}
