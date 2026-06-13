/**
 * "bloom" dizaynı — gözəllik salonu/spa. Yumşaq pastel, elegant, yüksək
 * boşluq, incə tipoqrafiya, oval formalar. Digər dizaynlardan fərqli.
 */
import type {
  SiteContent, SiteTheme, Page, Section, Locale,
  HeroSection, FeaturesSection, GallerySection, AboutSection, ContactSection,
} from "@/lib/site-content";

const UI: Record<Locale, { book: string; phone: string; email: string; address: string }> = {
  az: { book: "Qeydiyyat", phone: "Telefon", email: "E-poçt", address: "Ünvan" },
  en: { book: "Book", phone: "Phone", email: "Email", address: "Address" },
  ru: { book: "Запись", phone: "Телефон", email: "Эл. почта", address: "Адрес" },
};
const serif: React.CSSProperties = { fontFamily: "'Playfair Display', Georgia, serif" };

export function BloomDesign({ content, page, theme, lang = "az" }: { content: SiteContent; page: Page; theme: SiteTheme; lang?: Locale }) {
  const ui = UI[lang];
  const name = content.siteName ?? "Salon";
  return (
    <div style={{ background: "var(--site-bg)", color: "var(--site-text)", fontFamily: "var(--site-font-body)" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" />
      <header className="sticky top-0 z-50" style={{ background: "color-mix(in srgb, var(--site-bg) 85%, transparent)", backdropFilter: "blur(8px)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2">
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logoUrl} alt={name} className="h-9 w-auto" />
            ) : (
              <span style={serif} className="text-2xl font-semibold tracking-wide">{name}</span>
            )}
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {(content.nav ?? []).map((n, i) => (
              <a key={i} href={n.href} className="text-sm font-medium tracking-wide" style={{ color: "var(--site-muted)" }}>{n.label}</a>
            ))}
            <a href="#elaqe" className="rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--site-primary)" }}>{ui.book}</a>
          </nav>
        </div>
      </header>
      <main>{page.sections.map((s, i) => <SectionView key={i} section={s} ui={ui} />)}</main>
      <footer className="py-10 text-center text-sm" style={{ background: "var(--site-surface)", color: "var(--site-muted)" }}>{content.footer?.text ?? `© ${name}`}</footer>
    </div>
  );
}
type BUi = { book: string; phone: string; email: string; address: string };
function SectionView({ section, ui }: { section: Section; ui: BUi }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} />;
    case "features": return <Services {...(section as FeaturesSection)} />;
    case "gallery": return <Gallery {...(section as GallerySection)} />;
    case "about": return <About {...(section as AboutSection)} />;
    case "contact": return <Contact {...(section as ContactSection)} ui={ui} />;
    default: return null;
  }
}
function Hero(s: HeroSection) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: "var(--site-primary)" }} />
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h1 style={serif} className="text-5xl font-semibold leading-tight md:text-6xl">{s.heading}</h1>
          {s.subheading && <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: "var(--site-muted)" }}>{s.subheading}</p>}
          {s.ctaText && <a href={s.ctaUrl ?? "#"} className="mt-9 inline-flex rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-md" style={{ background: "var(--site-primary)" }}>{s.ctaText}</a>}
        </div>
        {s.imageUrl && <div className="overflow-hidden rounded-[3rem] shadow-xl">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.imageUrl} alt={s.heading} className="aspect-3/4 w-full object-cover" /></div>}
      </div>
    </section>
  );
}
function Services(s: FeaturesSection) {
  return (
    <section id="xidmetler" className="py-20" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto max-w-5xl px-6">
        {s.heading && <h2 style={serif} className="mb-12 text-center text-4xl font-semibold">{s.heading}</h2>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={i} className="rounded-3xl bg-white p-8 text-center shadow-sm">
              {it.icon && <span className="material-symbols-outlined text-3xl" style={{ color: "var(--site-primary)" }}>{it.icon}</span>}
              <h3 style={serif} className="mt-3 text-xl">{it.title}</h3>
              {it.text && <p className="mt-2 text-sm" style={{ color: "var(--site-muted)" }}>{it.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Gallery(s: GallerySection) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        {s.heading && <h2 style={serif} className="mb-10 text-center text-4xl font-semibold">{s.heading}</h2>}
        <div className="grid gap-5 sm:grid-cols-3">
          {s.items.map((it, i) => <figure key={i} className="overflow-hidden rounded-[2rem] shadow-sm">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={it.imageUrl} alt={it.caption ?? ""} className="aspect-3/4 w-full object-cover" /></figure>)}
        </div>
      </div>
    </section>
  );
}
function About(s: AboutSection) {
  return (
    <section className="py-20" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        {s.heading && <h2 style={serif} className="text-4xl font-semibold">{s.heading}</h2>}
        {s.body && <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--site-muted)" }}>{s.body}</p>}
      </div>
    </section>
  );
}
function Contact(s: ContactSection & { ui: BUi }) {
  return (
    <section id="elaqe" className="py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 style={serif} className="text-4xl font-semibold">{s.heading ?? s.ui.book}</h2>
        <div className="mt-8 space-y-3 text-lg" style={{ color: "var(--site-muted)" }}>
          {s.phone && <p><a href={`tel:${s.phone}`} style={{ color: "var(--site-primary)" }}>{s.phone}</a></p>}
          {s.email && <p>{s.email}</p>}
          {s.address && <p>{s.address}</p>}
        </div>
      </div>
    </section>
  );
}
