/**
 * "forge" dizaynı — idman klubu / fitness / döyüş idmanları.
 * Tünd, yüksək kontrastlı, sıxılmış ağır tipoqrafiya, diaqonal aksentlər,
 * nəhəng rəqəmlər. Premium idman geyimi brendi enerjisi — plakat deyil.
 *
 * Server komponentdir: "use client" YOXDUR, JS yoxdur, yalnız CSS.
 * Marka rəngi tema dəyişənindən gəlir (--site-primary); struktur rəngləri
 * neytral qara/ağdır ki, tenant temanı dəyişəndə kontrast pozulmasın.
 */
import type {
  SiteContent, SiteTheme, Page, Section, Locale,
  HeroSection, FeaturesSection, AboutSection, GallerySection,
  StatsSection, ContactSection, CtaSection,
  TestimonialsSection, FaqSection, TeamSection, PricingSection,
  ProcessSection, HoursSection, LogosSection,
} from "@/lib/site-content";

/* ── Neytral struktur rəngləri (temadan asılı deyil, AA zəmanətli) ───────── */
const INK = "#08080a";      // səhifə fonu
const INK_2 = "#101014";    // ikinci səviyyə səth
const LINE = "rgba(255,255,255,0.14)";
const DIM = "#a3a3ad";      // INK üzərində ≈ 8.6:1

/* ── UI mətnləri ─────────────────────────────────────────────────────────── */
type Ui = {
  join: string; classes: string; about: string; gallery: string;
  contact: string; phone: string; email: string; address: string;
  map: string; nav: string; skip: string;
  // İkinci nəsil bölmələr
  reviews: string; rating: string; faq: string; team: string;
  /**
   * Vurğulanan paketin nişanı. Bilərəkdən "ən çox seçilən" DEYİL:
   * `PricingItem`-də populyarlıq datası yoxdur, ona görə belə bir iddia
   * tenantın vermədiyi və yoxlanıla bilməyən iddia olardı.
   */
  featured: string;
  pricing: string; choose: string;
  process: string; step: string; hours: string; partners: string;
};
const UI: Record<Locale, Ui> = {
  az: {
    join: "Üzv ol", classes: "Məşğələlər", about: "Haqqımızda", gallery: "Qalereya",
    contact: "Əlaqə", phone: "Telefon", email: "E-poçt", address: "Ünvan",
    map: "Xəritədə bax", nav: "Əsas naviqasiya", skip: "Əsas məzmuna keç",
    reviews: "Rəylər", rating: "Reytinq", faq: "Tez-tez verilən suallar", team: "Məşqçilər",
    pricing: "Üzvlük paketləri", featured: "Seçilmiş", choose: "Bu paketi seç",
    process: "Necə başlayırsan", step: "Addım", hours: "İş saatları", partners: "Partnyorlar",
  },
  en: {
    join: "Join now", classes: "Classes", about: "About us", gallery: "Gallery",
    contact: "Contact", phone: "Phone", email: "Email", address: "Address",
    map: "View on map", nav: "Main navigation", skip: "Skip to main content",
    reviews: "Reviews", rating: "Rating", faq: "Frequently asked questions", team: "Coaches",
    pricing: "Memberships", featured: "Featured", choose: "Choose this plan",
    process: "How it works", step: "Step", hours: "Opening hours", partners: "Partners",
  },
  ru: {
    join: "Записаться", classes: "Занятия", about: "О нас", gallery: "Галерея",
    contact: "Контакты", phone: "Телефон", email: "Эл. почта", address: "Адрес",
    map: "Смотреть на карте", nav: "Основная навигация", skip: "Перейти к содержимому",
    reviews: "Отзывы", rating: "Рейтинг", faq: "Частые вопросы", team: "Тренеры",
    pricing: "Абонементы", featured: "Выбранный", choose: "Выбрать",
    process: "Как начать", step: "Шаг", hours: "Часы работы", partners: "Партнёры",
  },
};

/* ── Tipoqrafiya ─────────────────────────────────────────────────────────── */
/** Nəhəng başlıqlar: sıxılmış (wdth 75) ağır qrotesk, böyük hərflər. */
const display: React.CSSProperties = {
  fontFamily: "'Archivo', var(--site-font-heading), system-ui, sans-serif",
  fontStretch: "75%",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "-0.015em",
};
/** Kiçik etiketlər: normal enli, geniş hərf aralığı. */
const label: React.CSSProperties = {
  fontFamily: "'Archivo', var(--site-font-heading), system-ui, sans-serif",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
};

/* Fokus halqaları — tünd və açıq fonlar üçün ayrı. */
const focusOnDark =
  "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black";
const focusOnLight =
  "outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const tr = "transition-all duration-200 ease-out motion-reduce:transition-none";

export function ForgeDesign({
  content, page, theme, lang = "az",
}: { content: SiteContent; page: Page; theme: SiteTheme; lang?: Locale }) {
  const ui = UI[lang];
  const name = content.siteName ?? "Forge";
  const links =
    content.nav ??
    (content.pages ?? []).map((p) => ({ label: p.title, href: p.slug === "" ? "/" : `/${p.slug}` }));

  return (
    <div
      className="min-w-0 overflow-x-clip"
      style={{ background: INK, color: "#ffffff", fontFamily: "var(--site-font-body), system-ui, sans-serif" }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..900&display=swap"
      />

      <a
        href="#main"
        className={`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black ${focusOnDark}`}
      >
        {ui.skip}
      </a>

      {/* ── Başlıq ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ borderColor: LINE, background: "rgba(8,8,10,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="/" className={`flex shrink-0 items-center gap-3 ${focusOnDark}`}>
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logoUrl} alt={name} className="h-8 w-auto sm:h-9" />
            ) : (
              <span style={display} className="text-xl leading-none sm:text-2xl">
                {name}
              </span>
            )}
            <span aria-hidden className="hidden h-6 w-1 sm:block" style={{ background: "var(--site-primary)" }} />
          </a>

          <nav aria-label={ui.nav} className="hidden items-center gap-7 md:flex">
            {links.map((n, i) => (
              <a
                key={i}
                href={n.href}
                style={label}
                className={`text-[11px] text-white/70 hover:text-white ${tr} ${focusOnDark}`}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <a
            href="#elaqe"
            style={label}
            className={`shrink-0 bg-white px-4 py-2.5 text-[11px] text-black hover:bg-white/85 sm:px-6 ${tr} ${focusOnDark}`}
          >
            {ui.join}
          </a>
        </div>

        {/* Mobil naviqasiya — JS yoxdur, ikinci sətir */}
        {links.length > 0 && (
          <nav
            aria-label={ui.nav}
            className="flex flex-wrap gap-x-5 gap-y-2 border-t px-5 py-3 md:hidden"
            style={{ borderColor: LINE }}
          >
            {links.map((n, i) => (
              <a
                key={i}
                href={n.href}
                style={label}
                className={`text-[10px] text-white/70 hover:text-white ${tr} ${focusOnDark}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main">
        {(page.sections ?? []).map((s, i) => (
          <SectionView key={i} section={s} ui={ui} index={i} />
        ))}
      </main>

      {/* ── Alt hissə ──────────────────────────────────────────────────── */}
      <footer className="border-t px-5 py-12 sm:px-8" style={{ borderColor: LINE, background: INK_2 }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p style={display} className="text-3xl leading-none sm:text-4xl">
              {name}
            </p>
            <span aria-hidden className="mt-4 block h-1 w-16" style={{ background: "var(--site-primary)" }} />
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            {content.footer?.socials && content.footer.socials.length > 0 && (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {content.footer.socials.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.href}
                      style={label}
                      className={`text-[11px] text-white/70 hover:text-white ${tr} ${focusOnDark}`}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm" style={{ color: DIM }}>
              {content.footer?.text ?? `© ${new Date().getFullYear()} ${name}`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Bölmə seçicisi ──────────────────────────────────────────────────────── */
function SectionView({ section, ui, index }: { section: Section; ui: Ui; index: number }) {
  switch (section.type) {
    case "hero": return <Hero s={section as HeroSection} ui={ui} />;
    case "stats": return <Stats s={section as StatsSection} />;
    case "features": return <Classes s={section as FeaturesSection} ui={ui} />;
    case "about": return <About s={section as AboutSection} ui={ui} />;
    case "gallery": return <Gallery s={section as GallerySection} ui={ui} />;
    case "contact": return <Contact s={section as ContactSection} ui={ui} />;
    case "cta": return <Cta s={section as CtaSection} index={index} />;
    case "testimonials": return <Testimonials s={section as TestimonialsSection} ui={ui} />;
    case "faq": return <Faq s={section as FaqSection} ui={ui} />;
    case "team": return <Team s={section as TeamSection} ui={ui} />;
    case "pricing": return <Pricing s={section as PricingSection} ui={ui} />;
    case "process": return <Process s={section as ProcessSection} ui={ui} />;
    case "hours": return <Hours s={section as HoursSection} ui={ui} />;
    case "logos": return <Logos s={section as LogosSection} ui={ui} />;
    default: return null;
  }
}

/**
 * Bölmə başlığı — bütün bölmələrdə eyni ritm: kiçik etiket, nəhəng başlıq,
 * altında izahat. Təkrarlanan markup-ı bir yerdə saxlayır.
 */
function Head({
  eyebrow, heading, subheading, className = "",
}: { eyebrow: string; heading?: string; subheading?: string; className?: string }) {
  return (
    <header className={`mb-10 md:mb-14 ${className}`}>
      <p style={label} className="mb-4 text-[11px]">
        <span style={{ color: "var(--site-primary)" }}>—— </span>
        <span className="text-white/70">{eyebrow}</span>
      </p>
      <h2 style={display} className="max-w-[20ch] break-words text-[clamp(1.9rem,5.5vw,3.75rem)] leading-[0.92]">
        {heading ?? eyebrow}
      </h2>
      {subheading && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: DIM }}>
          {subheading}
        </p>
      )}
    </header>
  );
}

/* ── Hero: tam enli şəkil + sərt tipoqrafik örtük ────────────────────────── */
function Hero({ s, ui }: { s: HeroSection; ui: Ui }) {
  if (!s.heading) return null;
  return (
    <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden md:min-h-[88svh]">
      {s.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,8,10,0.72) 0%, rgba(8,8,10,0.45) 38%, rgba(8,8,10,0.94) 100%)",
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "repeating-linear-gradient(115deg, color-mix(in srgb, var(--site-primary) 26%, transparent) 0 2px, transparent 2px 16px)",
          }}
        />
      )}

      {/* Diaqonal aksent — dekorativ */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 hidden h-full w-28 -skew-x-12 opacity-70 lg:block"
        style={{ background: "color-mix(in srgb, var(--site-primary) 55%, transparent)" }}
      />

      <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-28 sm:px-8 md:pb-20 md:pt-40">
        {s.subheading && (
          <p className="mb-6 flex items-center gap-3">
            <span aria-hidden className="h-4 w-1.5 shrink-0" style={{ background: "var(--site-primary)" }} />
            <span style={label} className="text-[11px] text-white sm:text-xs">
              {s.subheading}
            </span>
          </p>
        )}

        <h1
          style={display}
          className="max-w-[16ch] break-words text-[clamp(2.75rem,10.5vw,7.5rem)] leading-[0.86]"
        >
          {s.heading}
        </h1>

        {s.ctaText && (
          <div className="mt-9 flex flex-wrap items-center gap-3 md:mt-12">
            <a
              href={s.ctaUrl ?? "#elaqe"}
              style={label}
              className={`bg-white px-8 py-4 text-xs text-black hover:bg-white/85 ${tr} ${focusOnDark}`}
            >
              {s.ctaText}
            </a>
            <a
              href="#xidmetler"
              style={label}
              className={`border border-white/40 px-8 py-4 text-xs text-white hover:border-white hover:bg-white/10 ${tr} ${focusOnDark}`}
            >
              {ui.classes}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Statistika: ağ zolaq, nəhəng qara rəqəmlər ──────────────────────────── */
function Stats({ s }: { s: StatsSection }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="relative overflow-hidden bg-white text-black">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-10 h-[160%] w-24 -skew-x-12"
        style={{ background: "color-mix(in srgb, var(--site-primary) 20%, transparent)" }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="min-w-0">
              <dd
                style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                className="break-words text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.9] text-black"
              >
                {it.value}
              </dd>
              <dt className="mt-3 flex items-start gap-2">
                <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0" style={{ background: "var(--site-primary)" }} />
                <span style={label} className="text-[10px] text-black/70 sm:text-[11px]">
                  {it.label}
                </span>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Məşğələlər: cəsarətli şəbəkə, güclü hover inversiyası ───────────────── */
function Classes({ s, ui }: { s: FeaturesSection; ui: Ui }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;
  return (
    <section id="xidmetler" className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK }}>
      <div className="mx-auto max-w-7xl">
        <Head eyebrow={ui.classes} heading={s.heading} subheading={s.subheading} />

        <ul
          className="grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-3"
          style={{ borderColor: LINE }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              className={`group relative flex min-w-0 flex-col border-b border-r p-7 hover:bg-white sm:p-9 ${tr}`}
              style={{ borderColor: LINE }}
            >
              <span
                style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                className={`text-sm text-white/60 group-hover:text-black/60 ${tr}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className={`mt-4 block h-1 w-10 group-hover:w-full ${tr}`}
                style={{ background: "var(--site-primary)" }}
              />
              <h3
                style={display}
                className={`mt-5 break-words text-2xl leading-[0.95] text-white group-hover:text-black sm:text-[1.75rem] ${tr}`}
              >
                {it.title}
              </h3>
              {it.text && (
                <p className={`mt-3 text-sm leading-relaxed text-white/65 group-hover:text-black/70 ${tr}`}>
                  {it.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Haqqımızda: ofset iki sütun ─────────────────────────────────────────── */
function About({ s, ui }: { s: AboutSection; ui: Ui }) {
  if (!s.heading && !s.body && !s.imageUrl) return null;
  return (
    <section className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK_2 }}>
      <div
        className={`mx-auto grid max-w-7xl items-center gap-10 md:gap-14 ${
          s.imageUrl ? "lg:grid-cols-[1.1fr_1fr]" : ""
        }`}
      >
        {s.imageUrl && (
          <div className="relative min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading ?? ui.about}
              loading="lazy"
              className="aspect-4/3 w-full object-cover lg:aspect-3/2"
            />
            <span
              aria-hidden
              className="absolute -bottom-3 left-6 hidden h-6 w-40 lg:block"
              style={{ background: "var(--site-primary)" }}
            />
          </div>
        )}
        <div className="min-w-0 border-l-4 pl-6 sm:pl-8" style={{ borderColor: "var(--site-primary)" }}>
          <p style={label} className="mb-4 text-[11px] text-white/60">
            {ui.about}
          </p>
          {s.heading && (
            <h2 style={display} className="break-words text-[clamp(1.9rem,5vw,3.25rem)] leading-[0.94]">
              {s.heading}
            </h2>
          )}
          {s.body && (
            <p className="mt-6 max-w-prose text-base leading-relaxed sm:text-lg" style={{ color: DIM }}>
              {s.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Qalereya: asimmetrik şəbəkə ─────────────────────────────────────────── */
function Gallery({ s, ui }: { s: GallerySection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => !!it.imageUrl);
  if (items.length === 0) return null;
  return (
    <section className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK }}>
      <div className="mx-auto max-w-7xl">
        <h2 style={display} className="mb-10 break-words text-[clamp(1.9rem,5vw,3.25rem)] leading-[0.94] md:mb-14">
          {s.heading ?? ui.gallery}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:[&>*:first-child]:col-span-2 lg:[&>*:first-child]:row-span-2">
          {items.map((it, i) => (
            <figure key={i} className="group relative min-w-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt={it.caption ?? ""}
                loading="lazy"
                className={`h-full w-full object-cover grayscale group-hover:grayscale-0 ${
                  i === 0 ? "aspect-4/3 lg:aspect-auto lg:min-h-full" : "aspect-4/3"
                } ${tr}`}
              />
              {it.caption && (
                <figcaption
                  className="absolute inset-x-0 bottom-0 p-4"
                  style={{ background: "linear-gradient(180deg, transparent, rgba(8,8,10,0.9))" }}
                >
                  <span style={label} className="text-[10px] text-white sm:text-[11px]">
                    {it.caption}
                  </span>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Əlaqə: iri sətirlər ─────────────────────────────────────────────────── */
function Contact({ s, ui }: { s: ContactSection; ui: Ui }) {
  const rows: { label: string; value: string; href?: string }[] = [];
  if (s.phone) rows.push({ label: ui.phone, value: s.phone, href: `tel:${s.phone.replace(/\s+/g, "")}` });
  if (s.email) rows.push({ label: ui.email, value: s.email, href: `mailto:${s.email}` });
  if (s.address) rows.push({ label: ui.address, value: s.address, href: s.mapUrl });
  if (rows.length === 0 && !s.heading) return null;

  return (
    <section id="elaqe" className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK_2 }}>
      <div className="mx-auto max-w-7xl">
        <h2 style={display} className="break-words text-[clamp(2rem,6vw,4rem)] leading-[0.92]">
          {s.heading ?? ui.contact}
        </h2>
        {rows.length > 0 && (
          <dl className="mt-10 border-t md:mt-14" style={{ borderColor: LINE }}>
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid gap-1 border-b py-5 md:grid-cols-[200px_1fr] md:items-baseline md:py-6"
                style={{ borderColor: LINE }}
              >
                <dt style={label} className="text-[11px] text-white/60">
                  {r.label}
                </dt>
                <dd className="min-w-0">
                  {r.href ? (
                    <a
                      href={r.href}
                      style={display}
                      className={`inline-block break-words text-xl leading-tight text-white underline-offset-8 hover:underline sm:text-2xl ${tr} ${focusOnDark}`}
                    >
                      {r.value}
                    </a>
                  ) : (
                    <span style={display} className="break-words text-xl leading-tight sm:text-2xl">
                      {r.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {s.mapUrl && (
          <a
            href={s.mapUrl}
            style={label}
            className={`mt-8 inline-flex items-center gap-2 border border-white/40 px-6 py-3.5 text-[11px] text-white hover:border-white hover:bg-white/10 ${tr} ${focusOnDark}`}
          >
            {ui.map}
          </a>
        )}
      </div>
    </section>
  );
}

/* ── CTA: qaçılmaz ağ zolaq ──────────────────────────────────────────────── */
function Cta({ s, index }: { s: CtaSection; index: number }) {
  if (!s.heading && !s.ctaText) return null;
  return (
    <section
      id={index === 0 ? undefined : "qosul"}
      className="relative overflow-hidden bg-white text-black"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-2.5" style={{ background: "var(--site-primary)" }} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 hidden h-[160%] w-28 -skew-x-12 md:block"
        style={{ background: "color-mix(in srgb, var(--site-primary) 18%, transparent)" }}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-end md:justify-between md:py-24">
        <div className="min-w-0">
          {s.heading && (
            <h2 style={display} className="max-w-[14ch] break-words text-[clamp(2rem,6.5vw,4.5rem)] leading-[0.88]">
              {s.heading}
            </h2>
          )}
          {s.subheading && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">{s.subheading}</p>
          )}
        </div>
        {s.ctaText && (
          <a
            href={s.ctaUrl ?? "#elaqe"}
            style={label}
            className={`shrink-0 self-start bg-black px-9 py-5 text-xs text-white hover:bg-black/85 md:self-auto ${tr} ${focusOnLight}`}
          >
            {s.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

/* ── Qiymətlər: konversiya anı. Seçilmiş paket ağa çevrilir ──────────────── */
function Pricing({ s, ui }: { s: PricingSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.name && it.price);
  if (items.length === 0) return null;

  // Sütun sayı paket sayına uyğunlaşır — 2 paket 3 sütunda yaraşıqsız qalmır.
  const cols =
    items.length === 1 ? "max-w-md"
      : items.length === 2 ? "sm:grid-cols-2 max-w-3xl"
        : items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="qiymetler" className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK }}>
      <div className="mx-auto max-w-7xl">
        <Head eyebrow={ui.pricing} heading={s.heading} subheading={s.subheading} />

        <div className={`grid grid-cols-1 gap-4 ${cols}`}>
          {items.map((it, i) => {
            const hot = !!it.featured;
            return (
              <article
                key={i}
                className={`relative flex min-w-0 flex-col ${
                  hot ? "bg-white text-black" : "border border-white/15 text-white hover:border-white/35"
                } ${tr}`}
              >
                {/* Vurğu: yuxarıda qalın marka zolağı */}
                <span
                  aria-hidden
                  className={`block w-full ${hot ? "h-2.5" : "h-1"}`}
                  style={{ background: hot ? "var(--site-primary)" : "rgba(255,255,255,0.18)" }}
                />

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 style={display} className="min-w-0 break-words text-lg leading-none sm:text-xl">
                      {it.name}
                    </h3>
                    {hot && (
                      <span
                        style={label}
                        className="bg-black px-2.5 py-1 text-[9px] leading-none text-white"
                      >
                        {ui.featured}
                      </span>
                    )}
                  </div>

                  <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                    <span
                      style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                      className="break-words text-[clamp(2.25rem,6vw,3.25rem)] leading-[0.9]"
                    >
                      {it.price}
                    </span>
                    {it.unit && (
                      <span
                        style={label}
                        className={`text-[10px] ${hot ? "text-black/65" : "text-white/65"}`}
                      >
                        {it.unit}
                      </span>
                    )}
                  </p>

                  {it.desc && (
                    <p className={`mt-4 text-sm leading-relaxed ${hot ? "text-black/70" : "text-white/70"}`}>
                      {it.desc}
                    </p>
                  )}

                  {it.features && it.features.length > 0 && (
                    <ul
                      className={`mt-7 space-y-3 border-t pt-7 ${hot ? "border-black/15" : "border-white/15"}`}
                    >
                      {it.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm leading-relaxed">
                          <span
                            aria-hidden
                            className="mt-1.5 h-2 w-2 shrink-0"
                            style={{ background: hot ? "#000000" : "var(--site-primary)" }}
                          />
                          <span className={hot ? "text-black/80" : "text-white/80"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href="#elaqe"
                    style={label}
                    className={`mt-8 block w-full px-6 py-4 text-center text-[11px] ${
                      hot
                        ? `bg-black text-white hover:bg-black/85 ${focusOnLight}`
                        : `border border-white/40 text-white hover:border-white hover:bg-white/10 ${focusOnDark}`
                    } ${tr}`}
                  >
                    {ui.choose}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {s.note && (
          <p className="mt-8 border-l-2 pl-4 text-sm leading-relaxed" style={{ borderColor: "var(--site-primary)", color: DIM }}>
            {s.note}
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Məşqçilər: sərt kənarlı portretlər ──────────────────────────────────── */
function Team({ s, ui }: { s: TeamSection; ui: Ui }) {
  const items = (s.items ?? []).filter((m) => m.name);
  if (items.length === 0) return null;
  return (
    <section id="komanda" className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK_2 }}>
      <div className="mx-auto max-w-7xl">
        <Head eyebrow={ui.team} heading={s.heading} subheading={s.subheading} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m, i) => {
            const initials = m.name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("");
            return (
              <li key={i} className="group min-w-0">
                <div className="relative overflow-hidden" style={{ background: INK }}>
                  {m.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        loading="lazy"
                        className={`aspect-3/4 w-full object-cover object-center grayscale group-hover:grayscale-0 ${tr}`}
                      />
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-1/2"
                        style={{ background: "linear-gradient(180deg, transparent, rgba(8,8,10,0.85))" }}
                      />
                    </>
                  ) : (
                    <div className="flex aspect-3/4 w-full items-center justify-center">
                      <span aria-hidden style={display} className="text-5xl text-white/25">
                        {initials}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span
                      aria-hidden
                      className={`mb-3 block h-1 w-8 group-hover:w-16 ${tr}`}
                      style={{ background: "var(--site-primary)" }}
                    />
                    <h3 style={display} className="break-words text-xl leading-none text-white">
                      {m.name}
                    </h3>
                    {m.role && (
                      <p style={label} className="mt-2 text-[10px] text-white/80">
                        {m.role}
                      </p>
                    )}
                  </div>
                </div>
                {m.bio && (
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: DIM }}>
                    {m.bio}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── Proses: fasiləsiz marka xətti üzərində nömrələnmiş addımlar ─────────── */
function Process({ s, ui }: { s: ProcessSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.title);
  if (items.length === 0) return null;
  return (
    <section className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK }}>
      <div className="mx-auto max-w-7xl">
        <Head eyebrow={ui.process} heading={s.heading} subheading={s.subheading} />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <li key={i} className="min-w-0 pb-8 pr-0 sm:pr-8">
              {/* Hər addımın üstündəki zolaq birləşib davamlı bir xətt yaradır */}
              <span aria-hidden className="block h-[3px] w-full" style={{ background: "var(--site-primary)" }} />
              <p style={label} className="mt-5 text-[10px] text-white/60">
                {ui.step} {String(i + 1).padStart(2, "0")}
              </p>
              <p
                aria-hidden
                style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                className="mt-2 text-[clamp(2.75rem,7vw,4rem)] leading-[0.85] text-white/45"
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 style={display} className="mt-3 break-words text-xl leading-[0.98] sm:text-2xl">
                {it.title}
              </h3>
              {it.text && (
                <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: DIM }}>
                  {it.text}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Rəylər ──────────────────────────────────────────────────────────────── */
function Testimonials({ s, ui }: { s: TestimonialsSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.quote && it.author);
  if (items.length === 0) return null;
  return (
    <section className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK_2 }}>
      <div className="mx-auto max-w-7xl">
        <Head eyebrow={ui.reviews} heading={s.heading} subheading={s.subheading} />
        <ul className="grid grid-cols-1 border-t border-l border-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const stars = typeof it.rating === "number" ? Math.max(0, Math.min(5, Math.round(it.rating))) : null;
            return (
              <li key={i} className="flex min-w-0 flex-col border-b border-r border-white/15 p-7 sm:p-8">
                {stars !== null && (
                  <p className="mb-5">
                    <span aria-hidden className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className="h-2.5 w-2.5"
                          style={{ background: j < stars ? "var(--site-primary)" : "rgba(255,255,255,0.22)" }}
                        />
                      ))}
                    </span>
                    <span className="sr-only">{`${ui.rating}: ${stars}/5`}</span>
                  </p>
                )}
                <blockquote
                  style={{ ...display, textTransform: "none", letterSpacing: "-0.005em" }}
                  className="min-w-0 break-words text-lg leading-snug text-white sm:text-xl"
                >
                  {it.quote}
                </blockquote>
                <div className="mt-7 flex items-center gap-3 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                  {it.avatarUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.avatarUrl}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="h-11 w-11 shrink-0 object-cover"
                      />
                    </>
                  )}
                  <div className="min-w-0">
                    <p style={label} className="break-words text-[11px] text-white">
                      {it.author}
                    </p>
                    {it.role && (
                      <p className="mt-1 break-words text-xs" style={{ color: DIM }}>
                        {it.role}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── FAQ: JS yoxdur, details/summary + CSS ilə açılıb-bağlanır ───────────── */
function Faq({ s, ui }: { s: FaqSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.question && it.answer);
  if (items.length === 0) return null;
  return (
    <section id="faq" className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK }}>
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.6fr] lg:gap-14">
        <Head eyebrow={ui.faq} heading={s.heading} subheading={s.subheading} className="mb-0" />
        <div className="min-w-0 border-t border-white/15">
          {items.map((it, i) => (
            <details key={i} className="group border-b border-white/15">
              <summary
                className={`flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden ${focusOnDark}`}
              >
                <span
                  style={{ ...display, textTransform: "none", letterSpacing: "-0.005em" }}
                  className="min-w-0 break-words text-base leading-snug text-white sm:text-lg"
                >
                  {it.question}
                </span>
                <span
                  aria-hidden
                  className={`relative mt-1 h-4 w-4 shrink-0 group-open:rotate-45 ${tr}`}
                >
                  <span
                    className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2"
                    style={{ background: "var(--site-primary)" }}
                  />
                  <span
                    className="absolute left-1/2 top-0 h-4 w-[2px] -translate-x-1/2"
                    style={{ background: "var(--site-primary)" }}
                  />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-8 text-sm leading-relaxed sm:text-base" style={{ color: DIM }}>
                {it.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── İş saatları: sürətli oxunan cədvəl ──────────────────────────────────── */
function Hours({ s, ui }: { s: HoursSection; ui: Ui }) {
  const items = (s.items ?? []).filter((r) => r.days && r.hours);
  if (items.length === 0) return null;
  return (
    <section className="px-5 py-20 sm:px-8 md:py-28" style={{ background: INK_2 }}>
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
        <Head eyebrow={ui.hours} heading={s.heading} className="mb-0" />
        <div className="min-w-0">
          <span aria-hidden className="block h-1.5 w-full" style={{ background: "var(--site-primary)" }} />
          <dl className="divide-y divide-white/15" style={{ background: INK }}>
            {items.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] items-baseline gap-4 px-5 py-4 sm:px-7 sm:py-5"
              >
                <dt style={label} className="min-w-0 break-words text-[10px] text-white/75 sm:text-[11px]">
                  {r.days}
                </dt>
                <dd
                  style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                  className="whitespace-nowrap text-base leading-none text-white sm:text-lg"
                >
                  {r.hours}
                </dd>
              </div>
            ))}
          </dl>
          {s.note && (
            <p
              className="mt-5 border-l-2 pl-4 text-sm leading-relaxed"
              style={{ borderColor: "var(--site-primary)", color: DIM }}
            >
              {s.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Partnyorlar / brendlər ──────────────────────────────────────────────── */
function Logos({ s, ui }: { s: LogosSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.name);
  if (items.length === 0) return null;
  return (
    <section className="border-y px-5 py-12 sm:px-8 md:py-16" style={{ borderColor: LINE, background: INK }}>
      <div className="mx-auto max-w-7xl">
        <h2 style={label} className="mb-8 text-[11px] text-white/60">
          {s.heading ?? ui.partners}
        </h2>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-7 sm:gap-x-14">
          {items.map((it, i) => (
            <li key={i} className="min-w-0">
              {it.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    loading="lazy"
                    className={`h-8 w-auto max-w-[9rem] object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 sm:h-10 ${tr}`}
                  />
                </>
              ) : (
                <span style={display} className="break-words text-lg text-white/70 sm:text-xl">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
