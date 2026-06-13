/**
 * "corporate" dizaynı — biznes/şirkət. Cəsarətli, geometrik, böyük tipoqrafiya,
 * statistika zolağı, növbələşən split bölmələr, layihə grid-i. Çoxsəhifəli
 * (Ana / Xidmətlər / Layihələr / Əlaqə). Care və Bistro-dan tamam fərqli.
 */
import type {
  SiteContent,
  SiteTheme,
  Page,
  Section,
  Locale,
  HeroSection,
  FeaturesSection,
  StatsSection,
  GallerySection,
  AboutSection,
  ContactSection,
  CtaSection,
} from "@/lib/site-content";

const INK = "#0b1220";
const UI: Record<Locale, { contact: string; phone: string; email: string; address: string }> = {
  az: { contact: "Əlaqə", phone: "Telefon", email: "E-poçt", address: "Ünvan" },
  en: { contact: "Contact", phone: "Phone", email: "Email", address: "Address" },
  ru: { contact: "Контакт", phone: "Телефон", email: "Эл. почта", address: "Адрес" },
};
const h: React.CSSProperties = { fontFamily: "var(--site-font-heading)" };

export function CorporateDesign({
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
  const accent = theme.colors?.primary ?? "#4f46e5";
  const siteName = content.siteName ?? "Şirkət";
  const ui = UI[lang];
  return (
    <div style={{ background: "#ffffff", color: INK, fontFamily: "var(--site-font-body)" }}>
      <Nav siteName={siteName} logoUrl={theme.logoUrl} content={content} accent={accent} ui={ui} />
      <main>
        {page.sections.map((s, i) => (
          <SectionView key={i} section={s} accent={accent} ui={ui} />
        ))}
      </main>
      <Footer siteName={siteName} content={content} accent={accent} />
    </div>
  );
}

type CUi = { contact: string; phone: string; email: string; address: string };
const navHref = (slug: string) => (slug === "" ? "/" : `/${slug}`);

function Nav({ siteName, logoUrl, content, accent, ui }: { siteName: string; logoUrl?: string; content: SiteContent; accent: string; ui: CUi }) {
  const links = content.nav ?? content.pages.map((p) => ({ label: p.title, href: navHref(p.slug) }));
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
          ) : (
            <>
              <span className="h-7 w-7 rounded" style={{ background: accent }} />
              <span style={h} className="text-xl font-extrabold tracking-tight">{siteName}</span>
            </>
          )}
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((n, i) => (
            <a key={i} href={n.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">{n.label}</a>
          ))}
          <a href="/elaqe" className="rounded-md px-5 py-2.5 text-sm font-bold text-white" style={{ background: accent }}>{ui.contact}</a>
        </nav>
      </div>
    </header>
  );
}

function SectionView({ section, accent, ui }: { section: Section; accent: string; ui: CUi }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} accent={accent} />;
    case "stats": return <Stats {...(section as StatsSection)} accent={accent} />;
    case "features": return <Features {...(section as FeaturesSection)} accent={accent} />;
    case "gallery": return <Projects {...(section as GallerySection)} accent={accent} />;
    case "about": return <About {...(section as AboutSection)} accent={accent} />;
    case "contact": return <Contact {...(section as ContactSection)} accent={accent} ui={ui} />;
    case "cta": return <Cta {...(section as CtaSection)} accent={accent} />;
    default: return null;
  }
}

function Hero(s: HeroSection & { accent: string }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="mb-6 h-1.5 w-16 rounded-full" style={{ background: s.accent }} />
          <h1 style={h} className="text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">{s.heading}</h1>
          {s.subheading && <p className="mt-6 max-w-lg text-lg text-slate-500">{s.subheading}</p>}
          {s.ctaText && (
            <a href={s.ctaUrl ?? "/elaqe"} className="mt-8 inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-bold text-white" style={{ background: s.accent }}>
              {s.ctaText}<span className="material-symbols-outlined text-lg">trending_flat</span>
            </a>
          )}
        </div>
        <div className="relative">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-2xl" style={{ background: s.accent, opacity: 0.15 }} />
          {s.imageUrl && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.imageUrl} alt={s.heading} className="aspect-4/3 w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stats(s: StatsSection & { accent: string }) {
  return (
    <section style={{ background: INK }} className="text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {s.items.map((it, i) => (
          <div key={i}>
            <div style={{ ...h, color: s.accent }} className="text-4xl font-black">{it.value}</div>
            <div className="mt-1 text-sm text-slate-400">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features(s: FeaturesSection & { accent: string }) {
  return (
    <section id="xidmetler" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {s.heading && (
          <div className="mb-14 max-w-2xl">
            <h2 style={h} className="text-3xl font-black tracking-tight md:text-4xl">{s.heading}</h2>
            {s.subheading && <p className="mt-3 text-lg text-slate-500">{s.subheading}</p>}
          </div>
        )}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={i} className="bg-white p-8">
              {it.icon && (
                <span className="material-symbols-outlined text-3xl" style={{ color: s.accent }}>{it.icon}</span>
              )}
              <h3 style={h} className="mt-4 text-lg font-bold">{it.title}</h3>
              {it.text && <p className="mt-2 text-sm leading-relaxed text-slate-500">{it.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects(s: GallerySection & { accent: string }) {
  return (
    <section id="layiheler" className="py-20 md:py-28" style={{ background: "#f8fafc" }}>
      <div className="mx-auto max-w-7xl px-6">
        {s.heading && <h2 style={h} className="mb-12 text-3xl font-black tracking-tight md:text-4xl">{s.heading}</h2>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.caption ?? ""} className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {it.caption && <figcaption className="absolute bottom-4 left-4 font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function About(s: AboutSection & { accent: string }) {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-2">
        <div>
          {s.heading && <h2 style={h} className="text-3xl font-black tracking-tight md:text-4xl">{s.heading}</h2>}
          {s.body && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-slate-500">{s.body}</p>}
        </div>
        {s.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.heading ?? ""} className="aspect-4/3 w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

function Contact(s: ContactSection & { accent: string; ui: CUi }) {
  return (
    <section id="elaqe" style={{ background: INK }} className="py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <h2 style={h} className="text-3xl font-black tracking-tight md:text-4xl">{s.heading ?? s.ui.contact}</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {s.phone && <div><div className="text-sm text-slate-400">{s.ui.phone}</div><a href={`tel:${s.phone}`} className="text-lg font-semibold" style={{ color: s.accent }}>{s.phone}</a></div>}
          {s.email && <div><div className="text-sm text-slate-400">{s.ui.email}</div><a href={`mailto:${s.email}`} className="text-lg font-semibold">{s.email}</a></div>}
          {s.address && <div><div className="text-sm text-slate-400">{s.ui.address}</div><div className="text-lg font-semibold">{s.address}</div></div>}
        </div>
      </div>
    </section>
  );
}

function Cta(s: CtaSection & { accent: string }) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl px-10 py-12 text-white md:flex-row" style={{ background: s.accent }}>
        <h2 style={h} className="text-2xl font-black md:text-3xl">{s.heading}</h2>
        {s.ctaText && <a href={s.ctaUrl ?? "/elaqe"} className="shrink-0 rounded-md bg-white px-7 py-3.5 text-sm font-bold" style={{ color: INK }}>{s.ctaText}</a>}
      </div>
    </section>
  );
}

function Footer({ siteName, content, accent }: { siteName: string; content: SiteContent; accent: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-slate-400">
        <span>{content.footer?.text ?? `© ${year} ${siteName}`}</span>
        <span className="h-5 w-5 rounded" style={{ background: accent, opacity: 0.4 }} />
      </div>
    </footer>
  );
}
