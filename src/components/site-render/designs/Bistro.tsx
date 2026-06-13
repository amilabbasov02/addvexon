/**
 * "bistro" dizaynı — restoran. TÜND, elegant, serif başlıqlar, full-bleed
 * şəkil hero, qızılı vurğu. Çoxsəhifəli (Ana / Menyu / Qalereya / Əlaqə).
 * Care-dən tamamilə fərqli estetika.
 */
import type {
  SiteContent,
  SiteTheme,
  Page,
  Section,
  Locale,
  HeroSection,
  MenuSection,
  GallerySection,
  AboutSection,
  ContactSection,
} from "@/lib/site-content";

const UI: Record<Locale, { reserve: string }> = {
  az: { reserve: "Rezervasiya" },
  en: { reserve: "Reservation" },
  ru: { reserve: "Бронь" },
};

const DARK = "#17110d";
const CARD = "#1f1813";
const CREAM = "#f3ece1";
const MUTED = "#b8a98f";
const serif: React.CSSProperties = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

export function BistroDesign({
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
  const accent = theme.colors?.primary ?? "#c9a45c";
  const siteName = content.siteName ?? "Restoran";
  return (
    <div style={{ background: DARK, color: CREAM, ["--accent" as string]: accent }}>
      <Nav siteName={siteName} logoUrl={theme.logoUrl} content={content} accent={accent} reserve={UI[lang].reserve} />
      <main>
        {page.sections.map((s, i) => (
          <SectionView key={i} section={s} accent={accent} />
        ))}
      </main>
      <Footer siteName={siteName} content={content} />
    </div>
  );
}

function navHref(slug: string) {
  return slug === "" ? "/" : `/${slug}`;
}

function Nav({ siteName, logoUrl, content, accent, reserve }: { siteName: string; logoUrl?: string; content: SiteContent; accent: string; reserve: string }) {
  const links = content.nav ?? content.pages.map((p) => ({ label: p.title, href: navHref(p.slug) }));
  return (
    <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: "rgba(23,17,13,0.85)", backdropFilter: "blur(10px)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
          ) : (
            <span style={serif} className="text-2xl font-bold tracking-wide" >{siteName}</span>
          )}
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((n, i) => (
            <a key={i} href={n.href} className="text-sm font-medium tracking-wide transition-colors hover:text-white" style={{ color: MUTED }}>
              {n.label}
            </a>
          ))}
          <a href="/elaqe" className="rounded-sm border px-5 py-2 text-sm font-semibold tracking-wide" style={{ borderColor: accent, color: accent }}>
            {reserve}
          </a>
        </nav>
      </div>
    </header>
  );
}

function SectionView({ section, accent }: { section: Section; accent: string }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} accent={accent} />;
    case "menu": return <Menu {...(section as MenuSection)} accent={accent} />;
    case "gallery": return <Gallery {...(section as GallerySection)} />;
    case "about": return <About {...(section as AboutSection)} />;
    case "contact": return <Contact {...(section as ContactSection)} accent={accent} />;
    default: return null;
  }
}

function Hero(s: HeroSection & { accent: string }) {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden">
      {s.imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.heading} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(23,17,13,0.55) 0%, rgba(23,17,13,0.85) 100%)" }} />
        </>
      )}
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 h-px w-16" style={{ background: s.accent }} />
        <h1 style={serif} className="text-5xl font-bold leading-tight md:text-7xl">{s.heading}</h1>
        {s.subheading && <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: CREAM }}>{s.subheading}</p>}
        {s.ctaText && (
          <a href={s.ctaUrl ?? "/elaqe"} className="mt-9 inline-flex rounded-sm px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-black" style={{ background: s.accent }}>
            {s.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function Menu(s: MenuSection & { accent: string }) {
  return (
    <section id="menyu" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        {s.heading && (
          <div className="mb-14 text-center">
            <div className="mx-auto mb-5 h-px w-16" style={{ background: s.accent }} />
            <h2 style={serif} className="text-4xl font-bold">{s.heading}</h2>
          </div>
        )}
        <div className="grid gap-12 md:grid-cols-2">
          {s.groups.map((g, i) => (
            <div key={i}>
              <h3 style={{ ...serif, color: s.accent }} className="mb-6 text-2xl">{g.name}</h3>
              <ul className="space-y-5">
                {g.items.map((it, j) => (
                  <li key={j}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium">{it.name}</span>
                      <span className="flex-1 border-b border-dotted border-white/20" />
                      {it.price && <span style={{ color: s.accent }} className="font-semibold">{it.price}</span>}
                    </div>
                    {it.desc && <p className="mt-1 text-sm" style={{ color: MUTED }}>{it.desc}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery(s: GallerySection) {
  return (
    <section id="qalereya" className="py-24" style={{ background: CARD }}>
      <div className="mx-auto max-w-6xl px-6">
        {s.heading && <h2 style={serif} className="mb-12 text-center text-4xl font-bold">{s.heading}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.caption ?? ""} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {it.caption && <figcaption className="absolute bottom-0 w-full bg-black/50 px-3 py-2 text-sm">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function About(s: AboutSection) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {s.heading && <h2 style={serif} className="text-4xl font-bold">{s.heading}</h2>}
        {s.body && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed" style={{ color: MUTED }}>{s.body}</p>}
      </div>
    </section>
  );
}

function Contact(s: ContactSection & { accent: string }) {
  return (
    <section id="elaqe" className="py-24" style={{ background: CARD }}>
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="mx-auto mb-5 h-px w-16" style={{ background: s.accent }} />
        <h2 style={serif} className="text-4xl font-bold">{s.heading ?? "Əlaqə & Rezervasiya"}</h2>
        <div className="mt-10 space-y-4 text-lg">
          {s.phone && <p><a href={`tel:${s.phone}`} style={{ color: s.accent }}>{s.phone}</a></p>}
          {s.email && <p><a href={`mailto:${s.email}`} className="hover:text-white" style={{ color: MUTED }}>{s.email}</a></p>}
          {s.address && <p style={{ color: MUTED }}>{s.address}</p>}
        </div>
      </div>
    </section>
  );
}

function Footer({ siteName, content }: { siteName: string; content: SiteContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm" style={{ color: MUTED }}>
      {content.footer?.text ?? `© ${year} ${siteName}`}
    </footer>
  );
}
