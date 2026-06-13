/**
 * "care" dizaynı — klinika/sağlamlıq. İşıqlı, yumşaq, çoxlu boşluq, yuvarlaq
 * künclər, sakit mavi-yaşıl vurğu. Tək səhifəli landing üçün.
 */
import type {
  SiteContent,
  SiteTheme,
  Page,
  Section,
  Locale,
  HeroSection,
  FeaturesSection,
  AboutSection,
  ContactSection,
  CtaSection,
  StatsSection,
  GallerySection,
} from "@/lib/site-content";

const UI: Record<Locale, { book: string; phone: string; email: string; address: string }> = {
  az: { book: "Növbə al", phone: "Telefon", email: "E-poçt", address: "Ünvan" },
  en: { book: "Book now", phone: "Phone", email: "Email", address: "Address" },
  ru: { book: "Записаться", phone: "Телефон", email: "Эл. почта", address: "Адрес" },
};

export function CareDesign({
  content,
  page,
  theme,
  lang = "az",
}: {
  content: SiteContent;
  page: Page;
  theme: SiteTheme;
  lang?: Locale;
}) {
  const siteName = content.siteName ?? "Klinika";
  const ui = UI[lang];
  return (
    <div style={{ background: "var(--site-bg)", color: "var(--site-text)", fontFamily: "var(--site-font-body)" }}>
      <Nav siteName={siteName} logoUrl={theme.logoUrl} content={content} ui={ui} />
      <main>
        {page.sections.map((s, i) => (
          <SectionView key={i} section={s} ui={ui} />
        ))}
      </main>
      <Footer siteName={siteName} content={content} />
    </div>
  );
}

type Ui = { book: string; phone: string; email: string; address: string };

function Nav({ siteName, logoUrl, content, ui }: { siteName: string; logoUrl?: string; content: SiteContent; ui: Ui }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: "var(--site-primary)" }}>
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </span>
              <span className="text-lg font-bold tracking-tight">{siteName}</span>
            </>
          )}
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {(content.nav ?? []).map((n, i) => (
            <a key={i} href={n.href} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">{n.label}</a>
          ))}
          <a href="#elaqe" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ background: "var(--site-primary)" }}>
            {ui.book}
          </a>
        </nav>
      </div>
    </header>
  );
}

const h: React.CSSProperties = { fontFamily: "var(--site-font-heading)" };

function SectionView({ section, ui }: { section: Section; ui: Ui }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} />;
    case "stats": return <Stats {...(section as StatsSection)} />;
    case "features": return <Features {...(section as FeaturesSection)} />;
    case "about": return <About {...(section as AboutSection)} />;
    case "gallery": return <Gallery {...(section as GallerySection)} />;
    case "contact": return <Contact {...(section as ContactSection)} ui={ui} />;
    case "cta": return <Cta {...(section as CtaSection)} />;
    default: return null;
  }
}

function Hero(s: HeroSection) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--site-primary)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, transparent)", color: "var(--site-primary)" }}>
            <span className="material-symbols-outlined text-base">verified</span> Etibarlı tibbi xidmət
          </span>
          <h1 style={h} className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{s.heading}</h1>
          {s.subheading && <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: "var(--site-muted)" }}>{s.subheading}</p>}
          {s.ctaText && (
            <a href={s.ctaUrl ?? "#"} className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg" style={{ background: "var(--site-primary)" }}>
              {s.ctaText}<span className="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
          )}
        </div>
        {s.imageUrl && (
          <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.heading} className="aspect-4/3 w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

function Stats(s: StatsSection) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-2 gap-6 rounded-3xl border border-black/5 p-8 shadow-sm md:grid-cols-4" style={{ background: "var(--site-surface)" }}>
        {s.items.map((it, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl font-extrabold" style={{ color: "var(--site-primary)" }}>{it.value}</div>
            <div className="mt-1 text-sm" style={{ color: "var(--site-muted)" }}>{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features(s: FeaturesSection) {
  return (
    <section id="xidmetler" className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {s.heading && (
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 style={h} className="text-3xl font-bold tracking-tight">{s.heading}</h2>
            {s.subheading && <p className="mt-4 text-lg" style={{ color: "var(--site-muted)" }}>{s.subheading}</p>}
          </div>
        )}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={i} className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              {it.icon && (
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, transparent)" }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: "var(--site-primary)" }}>{it.icon}</span>
                </span>
              )}
              <h3 style={h} className="text-lg font-semibold">{it.title}</h3>
              {it.text && <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>{it.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About(s: AboutSection) {
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        {s.imageUrl && (
          <div className="overflow-hidden rounded-[2rem] shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.heading ?? ""} className="aspect-4/3 w-full object-cover" />
          </div>
        )}
        <div>
          {s.heading && <h2 style={h} className="text-3xl font-bold tracking-tight">{s.heading}</h2>}
          {s.body && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed" style={{ color: "var(--site-muted)" }}>{s.body}</p>}
        </div>
      </div>
    </section>
  );
}

function Gallery(s: GallerySection) {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {s.heading && <h2 style={h} className="mb-12 text-center text-3xl font-bold tracking-tight">{s.heading}</h2>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <figure key={i} className="overflow-hidden rounded-3xl shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.caption ?? ""} className="aspect-4/3 w-full object-cover" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact(s: ContactSection & { ui: Ui }) {
  return (
    <section id="elaqe" className="py-20 md:py-24" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 style={h} className="text-3xl font-bold tracking-tight">{s.heading ?? s.ui.address}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {s.phone && <ContactCard icon="call" label={s.ui.phone} value={s.phone} href={`tel:${s.phone}`} />}
          {s.email && <ContactCard icon="mail" label={s.ui.email} value={s.email} href={`mailto:${s.email}`} />}
          {s.address && <ContactCard icon="location_on" label={s.ui.address} value={s.address} />}
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const inner = (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <span className="material-symbols-outlined text-2xl" style={{ color: "var(--site-primary)" }}>{icon}</span>
      <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: "var(--site-muted)" }}>{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function Cta(s: CtaSection) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-[2rem] px-8 py-16 text-center text-white shadow-lg" style={{ background: "var(--site-primary)" }}>
        <h2 style={h} className="text-3xl font-bold tracking-tight">{s.heading}</h2>
        {s.subheading && <p className="mt-3 text-white/85">{s.subheading}</p>}
        {s.ctaText && <a href={s.ctaUrl ?? "#"} className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>{s.ctaText}</a>}
      </div>
    </section>
  );
}

function Footer({ siteName, content }: { siteName: string; content: SiteContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/5" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-sm" style={{ color: "var(--site-muted)" }}>
        {content.footer?.text ?? `© ${year} ${siteName}`}
      </div>
    </footer>
  );
}
