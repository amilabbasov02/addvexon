/**
 * "studio" dizaynı — kreativ agentlik/portfolio. TÜND, editorial, nəhəng
 * asimmetrik tipoqrafiya, mono vurğular, layihə showcase. Çox fərqli.
 */
import type {
  SiteContent, SiteTheme, Page, Section, Locale,
  HeroSection, FeaturesSection, GallerySection, StatsSection, ContactSection, CtaSection,
} from "@/lib/site-content";

const BG = "#0d0d0f", CARD = "#16161a", FG = "#f4f4f5", MUT = "#8a8a93";
const UI: Record<Locale, { work: string; lets: string }> = {
  az: { work: "İşlərimiz", lets: "Layihə danışaq" },
  en: { work: "Our work", lets: "Let's talk" },
  ru: { work: "Наши работы", lets: "Обсудим проект" },
};
const mono: React.CSSProperties = { fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" };

export function StudioDesign({ content, page, theme, lang = "az" }: { content: SiteContent; page: Page; theme: SiteTheme; lang?: Locale }) {
  const accent = theme.colors?.primary ?? "#c4ff4d";
  const name = content.siteName ?? "Studio";
  const links = content.nav ?? content.pages.map((p) => ({ label: p.title, href: p.slug === "" ? "/" : `/${p.slug}` }));
  return (
    <div style={{ background: BG, color: FG }}>
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: "rgba(13,13,15,0.8)", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-lg font-black tracking-tight">{theme.logoUrl ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={theme.logoUrl} alt={name} className="h-8 w-auto" />) : name}<span style={{ color: accent }}>.</span></a>
          <nav className="hidden items-center gap-8 md:flex" style={mono}>
            {links.map((n, i) => <a key={i} href={n.href} className="text-xs uppercase tracking-widest hover:text-white" style={{ color: MUT }}>{n.label}</a>)}
          </nav>
        </div>
      </header>
      <main>{page.sections.map((s, i) => <SectionView key={i} section={s} accent={accent} ui={UI[lang]} />)}</main>
      <footer className="border-t border-white/10 py-8 text-center text-xs uppercase tracking-widest" style={{ ...mono, color: MUT }}>{content.footer?.text ?? `© ${name}`}</footer>
    </div>
  );
}
type SUi = { work: string; lets: string };
function SectionView({ section, accent, ui }: { section: Section; accent: string; ui: SUi }) {
  switch (section.type) {
    case "hero": return <Hero {...(section as HeroSection)} accent={accent} />;
    case "stats": return <Stats {...(section as StatsSection)} accent={accent} />;
    case "features": return <Services {...(section as FeaturesSection)} accent={accent} />;
    case "gallery": return <Work {...(section as GallerySection)} accent={accent} ui={ui} />;
    case "contact": return <Contact {...(section as ContactSection)} accent={accent} ui={ui} />;
    case "cta": return <Cta {...(section as CtaSection)} accent={accent} />;
    default: return null;
  }
}
function Hero(s: HeroSection & { accent: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-36">
      <p style={mono} className="mb-6 text-xs uppercase tracking-[0.3em]" >{/* eyebrow */}<span style={{ color: s.accent }}>// </span>{s.subheading}</p>
      <h1 className="text-5xl font-black leading-[0.95] tracking-tighter md:text-8xl">{s.heading}</h1>
      {s.ctaText && <a href={s.ctaUrl ?? "#"} className="mt-12 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-black" style={{ background: s.accent }}>{s.ctaText} ↗</a>}
    </section>
  );
}
function Stats(s: StatsSection & { accent: string }) {
  return (
    <section className="border-y border-white/10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {s.items.map((it, i) => <div key={i}><div className="text-4xl font-black" style={{ color: s.accent }}>{it.value}</div><div style={mono} className="mt-1 text-xs uppercase tracking-widest" >{it.label}</div></div>)}
      </div>
    </section>
  );
}
function Services(s: FeaturesSection & { accent: string }) {
  return (
    <section id="xidmetler" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      {s.heading && <h2 className="mb-12 text-3xl font-black tracking-tight md:text-5xl">{s.heading}</h2>}
      <div className="divide-y divide-white/10">
        {s.items.map((it, i) => (
          <div key={i} className="grid gap-4 py-7 md:grid-cols-[80px_1fr]">
            <span style={{ ...mono, color: s.accent }} className="text-lg">0{i + 1}</span>
            <div><h3 className="text-2xl font-bold">{it.title}</h3>{it.text && <p className="mt-2 max-w-xl" style={{ color: MUT }}>{it.text}</p>}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Work(s: GallerySection & { accent: string; ui: SUi }) {
  return (
    <section id="layiheler" className="py-20" style={{ background: CARD }}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-3xl font-black tracking-tight md:text-5xl">{s.heading ?? s.ui.work}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {s.items.map((it, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.caption ?? ""} className="aspect-video w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" />
              {it.caption && <figcaption style={mono} className="absolute bottom-4 left-4 text-sm font-semibold uppercase tracking-widest">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
function Contact(s: ContactSection & { accent: string; ui: SUi }) {
  return (
    <section id="elaqe" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 className="text-4xl font-black leading-tight tracking-tighter md:text-7xl">{s.heading ?? s.ui.lets}</h2>
      <div className="mt-10 flex flex-wrap gap-10" style={mono}>
        {s.email && <a href={`mailto:${s.email}`} className="text-lg hover:underline" style={{ color: s.accent }}>{s.email}</a>}
        {s.phone && <a href={`tel:${s.phone}`} className="text-lg" style={{ color: MUT }}>{s.phone}</a>}
        {s.address && <span className="text-lg" style={{ color: MUT }}>{s.address}</span>}
      </div>
    </section>
  );
}
function Cta(s: CtaSection & { accent: string }) {
  return (
    <section className="border-t border-white/10 px-6 py-16 text-center">
      <h2 className="text-3xl font-black tracking-tight md:text-4xl">{s.heading}</h2>
      {s.ctaText && <a href={s.ctaUrl ?? "#"} className="mt-6 inline-flex rounded-full px-8 py-4 text-sm font-bold text-black" style={{ background: s.accent }}>{s.ctaText} ↗</a>}
    </section>
  );
}
