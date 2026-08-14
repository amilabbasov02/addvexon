/**
 * "atlas" dizaynı — korporativ / peşəkar xidmətlər / B2B.
 *
 * Konsepsiya: "cədvəl" (ledger). Kart və kölgə əvəzinə bütün səhifə 1px
 * incə xətlərlə qurulur; asimmetrik redaksiya grid-i, iri və dəqiq tipoqrafiya,
 * xidmətlər siyahı kimi (saniyələr içində oxunur), rəqəmlər tünd zolaqda,
 * əlaqə yolu isə həmişə göz önündə. Vurğu rəngi çox az yerdə işlənir.
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
  ProductsSection,
  ContactSection,
  CtaSection,
  TestimonialsSection,
  FaqSection,
  TeamSection,
  PricingSection,
  ProcessSection,
  HoursSection,
  LogosSection,
} from "@/lib/site-content";

// ── Sabitlər ────────────────────────────────────────────────────────────────
/** Struktur üçün neytral tünd — brend rəngi deyil, tema ilə dəyişmir. */
const INK = "#101113";
/** İşıqlı fonda incə xətt — mətn rəngindən törəyir, ona görə temaya uyğunlaşır. */
const HAIR = "color-mix(in srgb, var(--site-text) 14%, transparent)";
/** Tünd zolaqda incə xətt. */
const HAIR_INK = "rgba(255,255,255,0.18)";

const HEAD: React.CSSProperties = {
  fontFamily: "'Archivo', var(--site-font-heading), system-ui, sans-serif",
};

const WRAP = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12";
const PAD = "py-16 sm:py-20 lg:py-28";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-primary)]";
const FOCUS_INK =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const TR = "transition-colors duration-200 motion-reduce:transition-none";

type Ui = {
  skip: string;
  contact: string;
  nav: string;
  footerNav: string;
  phone: string;
  email: string;
  address: string;
  map: string;
  social: string;
  featured: string;
  rating: string;
};

const UI: Record<Locale, Ui> = {
  az: {
    skip: "Əsas məzmuna keç",
    contact: "Əlaqə",
    nav: "Əsas naviqasiya",
    footerNav: "Altbilgi naviqasiyası",
    phone: "Telefon",
    email: "E-poçt",
    address: "Ünvan",
    map: "Xəritədə bax",
    social: "Sosial şəbəkələr",
    featured: "Seçilmiş",
    rating: "Qiymətləndirmə",
  },
  en: {
    skip: "Skip to main content",
    contact: "Contact",
    nav: "Main navigation",
    footerNav: "Footer navigation",
    phone: "Phone",
    email: "Email",
    address: "Address",
    map: "View on map",
    social: "Social links",
    featured: "Featured",
    rating: "Rating",
  },
  ru: {
    skip: "Перейти к содержимому",
    contact: "Контакты",
    nav: "Основная навигация",
    footerNav: "Навигация в подвале",
    phone: "Телефон",
    email: "Эл. почта",
    address: "Адрес",
    map: "Смотреть на карте",
    social: "Соцсети",
    featured: "Выбранный",
    rating: "Оценка",
  },
};

const navHref = (slug: string) => (slug === "" ? "/" : `/${slug}`);

// ── Paylaşılan başlıq elementləri ───────────────────────────────────────────
/** Bütün bölmə başlıqları eyni ölçü/ritmi paylaşır. */
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      style={HEAD}
      className={`text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] ${className}`}
    >
      {children}
    </h2>
  );
}

/** Bölmə üstündəki başlıq + izah bloku. İkisi də yoxdursa heç nə çıxarmır. */
function SectionIntro({
  heading,
  subheading,
  className = "mb-10 lg:mb-14",
}: {
  heading?: string;
  subheading?: string;
  className?: string;
}) {
  if (!heading && !subheading) return null;
  return (
    <div className={className}>
      {heading && <H2 className="max-w-[26ch]">{heading}</H2>}
      {subheading && (
        <p
          className={`max-w-[56ch] leading-relaxed ${heading ? "mt-4" : ""}`}
          style={{ color: "var(--site-muted)" }}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}

/** Əlaqə səhifəsinə/bölməsinə ən uyğun linki tapır — ölü link yaratmamaq üçün. */
function contactHref(content: SiteContent): string {
  const links = content.nav ?? content.pages?.map((p) => ({ href: navHref(p.slug) })) ?? [];
  const hit = links.find((l) => /elaqe|əlaqə|contact|kontakt|контакт/i.test(l.href ?? ""));
  return hit?.href ?? "#elaqe";
}

// ── Kök ─────────────────────────────────────────────────────────────────────
export function AtlasDesign({
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
  const ui = UI[lang];
  const siteName = content.siteName?.trim() || "Atlas";
  const cHref = contactHref(content);

  return (
    <div
      className="overflow-x-clip"
      style={{
        background: "var(--site-bg)",
        color: "var(--site-text)",
        fontFamily: "var(--site-font-body)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
      />

      <a
        href="#main"
        className={`sr-only rounded-sm px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] ${FOCUS}`}
        style={{ background: INK }}
      >
        {ui.skip}
      </a>

      <SiteHeader content={content} siteName={siteName} logoUrl={theme.logoUrl} ui={ui} cHref={cHref} />

      <main id="main">
        {(page.sections ?? []).map((s, i) => (
          <SectionView key={i} section={s} ui={ui} cHref={cHref} />
        ))}
      </main>

      <SiteFooter content={content} siteName={siteName} ui={ui} />
    </div>
  );
}

function SectionView({ section, ui, cHref }: { section: Section; ui: Ui; cHref: string }) {
  switch (section.type) {
    case "hero":
      return <Hero s={section as HeroSection} cHref={cHref} />;
    case "features":
      return <Services s={section as FeaturesSection} />;
    case "stats":
      return <Stats s={section as StatsSection} />;
    case "about":
      return <About s={section as AboutSection} />;
    case "gallery":
      return <Work s={section as GallerySection} />;
    case "products":
      return <Products s={section as ProductsSection} />;
    case "logos":
      return <Logos s={section as LogosSection} />;
    case "process":
      return <Process s={section as ProcessSection} />;
    case "pricing":
      return <Pricing s={section as PricingSection} ui={ui} />;
    case "testimonials":
      return <Testimonials s={section as TestimonialsSection} ui={ui} />;
    case "team":
      return <Team s={section as TeamSection} />;
    case "faq":
      return <Faq s={section as FaqSection} />;
    case "hours":
      return <Hours s={section as HoursSection} />;
    case "contact":
      return <Contact s={section as ContactSection} ui={ui} />;
    case "cta":
      return <Cta s={section as CtaSection} cHref={cHref} />;
    default:
      return null;
  }
}

// ── Başlıq ──────────────────────────────────────────────────────────────────
function SiteHeader({
  content,
  siteName,
  logoUrl,
  ui,
  cHref,
}: {
  content: SiteContent;
  siteName: string;
  logoUrl?: string;
  ui: Ui;
  cHref: string;
}) {
  const links =
    content.nav ?? (content.pages ?? []).map((p) => ({ label: p.title, href: navHref(p.slug) }));

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "var(--site-bg)", borderColor: HAIR }}
    >
      <div className={`${WRAP} flex items-center justify-between gap-4 py-4 lg:py-5`}>
        <a href="/" className={`flex min-w-0 items-center gap-2.5 ${FOCUS}`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto lg:h-9" />
          ) : (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
                style={{ background: "var(--site-primary)" }}
              />
              <span
                style={HEAD}
                className="truncate text-lg font-semibold tracking-[-0.02em] lg:text-xl"
              >
                {siteName}
              </span>
            </>
          )}
        </a>

        <div className="flex items-center gap-6">
          {links.length > 0 && (
            <nav aria-label={ui.nav} className="hidden items-center gap-7 md:flex">
              {links.map((n, i) => (
                <a
                  key={i}
                  href={n.href}
                  className={`text-sm font-medium hover:text-[var(--site-text)] ${TR} ${FOCUS}`}
                  style={{ color: "var(--site-muted)" }}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          )}
          <a
            href={cHref}
            className={`hidden shrink-0 rounded-sm px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--site-on-primary)] duration-200 hover:brightness-90 motion-reduce:transition-none sm:inline-block ${FOCUS}`}
            style={{ background: "var(--site-primary)", transitionProperty: "filter" }}
          >
            {ui.contact}
          </a>
        </div>
      </div>

      {/* Mobil: linklər ikinci sətirdə sarılır — üfüqi sürüşmə yoxdur, JS lazım deyil. */}
      {links.length > 0 && (
        <nav
          aria-label={ui.nav}
          className="border-t md:hidden"
          style={{ borderColor: HAIR }}
        >
          <div className={`${WRAP} flex flex-wrap items-center gap-x-5 gap-y-1 py-2.5`}>
            {links.map((n, i) => (
              <a
                key={i}
                href={n.href}
                className={`py-1 text-sm font-medium hover:text-[var(--site-text)] ${TR} ${FOCUS}`}
                style={{ color: "var(--site-muted)" }}
              >
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ s, cHref }: { s: HeroSection; cHref: string }) {
  const hasFoot = Boolean(s.subheading || s.ctaText);
  return (
    <section className="border-b" style={{ borderColor: HAIR }}>
      <div className={`${WRAP} pt-14 sm:pt-20 lg:pt-28`}>
        {s.heading && (
          <h1
            style={HEAD}
            className="max-w-[17ch] break-words text-[clamp(2.25rem,6.4vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
          >
            {s.heading}
          </h1>
        )}

        {hasFoot && (
          <div
            className="mt-10 grid gap-6 border-t pt-8 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-10"
            style={{ borderColor: HAIR }}
          >
            {s.subheading && (
              <p
                className="max-w-[52ch] text-base leading-relaxed lg:col-span-7 lg:text-lg"
                style={{ color: "var(--site-muted)" }}
              >
                {s.subheading}
              </p>
            )}
            {s.ctaText && (
              <div className="lg:col-span-5 lg:justify-self-end">
                <a
                  href={s.ctaUrl ?? cHref}
                  className={`inline-block rounded-sm px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--site-on-primary)] duration-200 hover:brightness-90 motion-reduce:transition-none ${FOCUS}`}
                  style={{ background: "var(--site-primary)", transitionProperty: "filter" }}
                >
                  {s.ctaText}
                </a>
              </div>
            )}
          </div>
        )}

        {s.imageUrl && (
          <div className="mt-12 lg:mt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading ?? ""}
              className="aspect-4/3 w-full object-cover sm:aspect-video lg:aspect-[21/9]"
            />
          </div>
        )}

        {!s.imageUrl && <div className="h-14 lg:h-20" />}
      </div>
    </section>
  );
}

// ── Xidmətlər ───────────────────────────────────────────────────────────────
function Services({ s }: { s: FeaturesSection }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;
  const hasHead = Boolean(s.heading || s.subheading);

  return (
    <section id="xidmetler" className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
        {hasHead && (
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <SectionIntro heading={s.heading} subheading={s.subheading} className="" />
          </div>
        )}

        <ul className={hasHead ? "lg:col-span-8" : "lg:col-span-12"}>
          {items.map((it, i) => (
            <li
              key={i}
              className="grid gap-2 border-t py-7 last:border-b sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-10"
              style={{ borderColor: HAIR }}
            >
              <h3
                style={HEAD}
                className="flex min-w-0 items-start gap-2.5 text-lg font-semibold leading-snug tracking-[-0.015em]"
              >
                {it.icon && (
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] leading-none"
                    style={{ color: "var(--site-primary)" }}
                  >
                    {it.icon}
                  </span>
                )}
                <span className="min-w-0">{it.title}</span>
              </h3>
              {it.text && (
                <p className="min-w-0 leading-relaxed" style={{ color: "var(--site-muted)" }}>
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

// ── Rəqəmlər ────────────────────────────────────────────────────────────────
function Stats({ s }: { s: StatsSection }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;
  const cols = items.length <= 2 ? "sm:grid-cols-2" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section style={{ background: INK, color: "#ffffff" }}>
      <div className={`${WRAP} py-14 lg:py-16`}>
        <dl className={`grid grid-cols-1 gap-y-8 sm:gap-y-10 ${cols} sm:gap-x-10`}>
          {items.map((it, i) => (
            <div
              key={i}
              className="flex flex-col-reverse border-t pt-5"
              style={{ borderColor: HAIR_INK }}
            >
              <dt className="mt-3 text-sm leading-snug" style={{ color: "rgba(255,255,255,0.66)" }}>
                {it.label}
              </dt>
              <dd
                style={HEAD}
                className="text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-none tracking-[-0.03em] tabular-nums"
              >
                {it.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ── Haqqımızda ──────────────────────────────────────────────────────────────
function About({ s }: { s: AboutSection }) {
  if (!s.heading && !s.body && !s.imageUrl) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={`${WRAP} grid items-start gap-10 lg:grid-cols-12 lg:gap-16`}>
        <div className={s.imageUrl ? "lg:col-span-6" : "lg:col-span-8"}>
          {s.heading && <H2 className="max-w-[26ch]">{s.heading}</H2>}
          {s.body && (
            <p
              className={`max-w-[66ch] whitespace-pre-line text-base leading-[1.75] lg:text-lg ${s.heading ? "mt-6" : ""}`}
              style={{ color: "var(--site-muted)" }}
            >
              {s.body}
            </p>
          )}
        </div>

        {s.imageUrl && (
          <div className="lg:col-span-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading ?? ""}
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ── Layihələr ───────────────────────────────────────────────────────────────
function Work({ s }: { s: GallerySection }) {
  const items = (s.items ?? []).filter((it) => it.imageUrl);
  if (items.length === 0) return null;

  return (
    <section id="layiheler" className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} />
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {items.map((it, i) => (
            <li key={i}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.imageUrl}
                  alt={it.caption ?? ""}
                  className="aspect-4/3 w-full object-cover"
                />
                {it.caption && (
                  <figcaption
                    className="mt-3 border-t pt-3 text-sm leading-snug"
                    style={{ borderColor: HAIR, color: "var(--site-muted)" }}
                  >
                    {it.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Məhsullar / paketlər ────────────────────────────────────────────────────
function Products({ s }: { s: ProductsSection }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} subheading={s.subheading} />
        <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: HAIR }}>
          {items.map((it, i) => (
            <li key={i} className="flex flex-col gap-4 p-6 lg:p-7" style={{ background: "var(--site-bg)" }}>
              {it.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="aspect-4/3 w-full object-cover"
                />
              )}
              {it.tag && (
                <span
                  className="self-start border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ borderColor: HAIR, color: "var(--site-muted)" }}
                >
                  {it.tag}
                </span>
              )}
              <div className="mt-auto flex items-baseline justify-between gap-4">
                <h3 style={HEAD} className="min-w-0 text-base font-semibold leading-snug">
                  {it.name}
                </h3>
                {it.price && (
                  <span style={HEAD} className="shrink-0 text-base font-semibold tabular-nums">
                    {it.price}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Müştərilər / partnyorlar ────────────────────────────────────────────────
/** Sakit, cizgili zolaq — karusel yox. Şəkil yoxdursa ad mətn kimi göstərilir. */
function Logos({ s }: { s: LogosSection }) {
  const items = (s.items ?? []).filter((it) => it.name?.trim() || it.imageUrl);
  if (items.length === 0) return null;

  // Sinif adları statik olmalıdır — Tailwind dinamik şablonu görmür.
  // Başlıq varsa strip 9/12 sütun tutur, ona görə sıra başına daha az xana.
  const cols =
    items.length === 2
      ? "grid-cols-2"
      : items.length === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : items.length === 1 || items.length === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : s.heading
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <section
      className="border-b py-12 lg:py-16"
      style={{ background: "var(--site-surface)", borderColor: HAIR }}
    >
      <div className={`${WRAP} grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12`}>
        {s.heading && (
          <h2
            style={HEAD}
            className="max-w-[22ch] text-base font-semibold leading-snug tracking-[-0.01em] lg:col-span-3"
          >
            {s.heading}
          </h2>
        )}
        <ul
          className={`grid gap-px ${cols} ${s.heading ? "lg:col-span-9" : "lg:col-span-12"}`}
          style={{ background: HAIR }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              className="flex h-20 items-center justify-center px-4 lg:h-24"
              style={{ background: "var(--site-surface)" }}
            >
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="max-h-9 w-auto max-w-full object-contain opacity-70 grayscale duration-200 hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none lg:max-h-10"
                  style={{ transitionProperty: "opacity, filter" }}
                />
              ) : (
                <span
                  style={HEAD}
                  className="text-center text-sm font-semibold leading-tight tracking-[0.02em] lg:text-base"
                >
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

// ── İş prosesi ──────────────────────────────────────────────────────────────
/** Nömrələnmiş addımlar — ardıcıllıq məlumatın özüdür, ona görə rəqəmlər görünür. */
function Process({ s }: { s: ProcessSection }) {
  const items = (s.items ?? []).filter((it) => it.title?.trim());
  if (items.length === 0) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} subheading={s.subheading} />
        <ol className="list-none">
          {items.map((it, i) => (
            <li
              key={i}
              className="grid gap-x-6 gap-y-2 border-t py-7 last:border-b sm:grid-cols-[3.5rem_minmax(0,1fr)] lg:grid-cols-[5rem_minmax(0,22ch)_minmax(0,1fr)] lg:gap-x-10"
              style={{ borderColor: HAIR }}
            >
              <span
                aria-hidden="true"
                className="text-lg font-semibold leading-none tabular-nums lg:text-xl"
                style={{ ...HEAD, color: "var(--site-primary)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                style={HEAD}
                className="min-w-0 text-lg font-semibold leading-snug tracking-[-0.015em]"
              >
                {it.title}
              </h3>
              {it.text && (
                <p
                  className="min-w-0 leading-relaxed sm:col-start-2 lg:col-start-3"
                  style={{ color: "var(--site-muted)" }}
                >
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

// ── Qiymət cədvəli ──────────────────────────────────────────────────────────
/** SaaS tarif kartları deyil — peşəkar xidmət haqqı cədvəli. */
function Pricing({ s, ui }: { s: PricingSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.name?.trim());
  if (items.length === 0) return null;

  return (
    <section id="qiymetler" className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} subheading={s.subheading} />

        <div>
          {items.map((it, i) => {
            const feats = (it.features ?? []).filter((f) => f?.trim());
            return (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 gap-y-4 border-t py-7 last:border-b sm:gap-x-10"
                style={{
                  borderColor: HAIR,
                  background: it.featured ? "var(--site-surface)" : undefined,
                }}
              >
                <div className="min-w-0">
                  <h3
                    style={HEAD}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 break-words text-lg font-semibold leading-snug tracking-[-0.015em]"
                  >
                    {it.name}
                    {it.featured && (
                      <span
                        className="border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                        style={{ borderColor: "var(--site-primary)", color: "var(--site-primary)" }}
                      >
                        {ui.featured}
                      </span>
                    )}
                  </h3>
                  {it.desc && (
                    <p
                      className="mt-2 max-w-[60ch] leading-relaxed"
                      style={{ color: "var(--site-muted)" }}
                    >
                      {it.desc}
                    </p>
                  )}
                </div>

                <p className="shrink-0 text-right">
                  <span
                    style={HEAD}
                    className="block text-xl font-semibold leading-none tracking-[-0.02em] tabular-nums lg:text-2xl"
                  >
                    {it.price}
                  </span>
                  {it.unit && (
                    <span className="mt-1.5 block text-sm" style={{ color: "var(--site-muted)" }}>
                      {it.unit}
                    </span>
                  )}
                </p>

                {feats.length > 0 && (
                  <ul className="col-span-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                    {feats.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined mt-px shrink-0 text-[16px] leading-none"
                          style={{ color: "var(--site-primary)" }}
                        >
                          check
                        </span>
                        <span className="min-w-0" style={{ color: "var(--site-muted)" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {s.note && (
          <p className="mt-6 max-w-[70ch] text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
            {s.note}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Rəylər ──────────────────────────────────────────────────────────────────
function Stars({ rating, label }: { rating: number; label: string }) {
  const n = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-px" role="img" aria-label={`${label}: ${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="material-symbols-outlined text-[16px] leading-none"
          style={{
            color: "var(--site-primary)",
            opacity: i < n ? 1 : 0.25,
            fontVariationSettings: i < n ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function Testimonials({ s, ui }: { s: TestimonialsSection; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.quote?.trim());
  if (items.length === 0) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} subheading={s.subheading} />
        <ul className="grid gap-px sm:grid-cols-2" style={{ background: HAIR }}>
          {items.map((it, i) => (
            <li key={i} className="flex" style={{ background: "var(--site-bg)" }}>
              <figure className="flex w-full flex-col gap-6 p-6 lg:p-8">
                {typeof it.rating === "number" && it.rating > 0 && (
                  <Stars rating={it.rating} label={ui.rating} />
                )}
                <blockquote
                  style={HEAD}
                  className="text-base font-medium leading-[1.6] tracking-[-0.01em] lg:text-lg"
                >
                  {it.quote}
                </blockquote>
                {(it.author?.trim() || it.role || it.avatarUrl) && (
                  <figcaption
                    className="mt-auto flex items-center gap-3 border-t pt-5"
                    style={{ borderColor: HAIR }}
                  >
                    {it.avatarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.avatarUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      {it.author?.trim() && (
                        <span style={HEAD} className="block truncate text-sm font-semibold">
                          {it.author}
                        </span>
                      )}
                      {it.role && (
                        <span
                          className="block truncate text-sm"
                          style={{ color: "var(--site-muted)" }}
                        >
                          {it.role}
                        </span>
                      )}
                    </span>
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Komanda ─────────────────────────────────────────────────────────────────
function Team({ s }: { s: TeamSection }) {
  const items = (s.items ?? []).filter((it) => it.name?.trim());
  if (items.length === 0) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={WRAP}>
        <SectionIntro heading={s.heading} subheading={s.subheading} />
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {items.map((it, i) => (
            <li key={i} className="self-start">
              {it.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="mb-4 aspect-3/4 w-full object-cover"
                />
              )}
              <div className="border-t pt-4" style={{ borderColor: HAIR }}>
                <h3
                  style={HEAD}
                  className="text-base font-semibold leading-snug tracking-[-0.015em] lg:text-lg"
                >
                  {it.name}
                </h3>
                {it.role && (
                  <p className="mt-1 text-sm" style={{ color: "var(--site-muted)" }}>
                    {it.role}
                  </p>
                )}
                {it.bio && (
                  <p
                    className="mt-3 max-w-[46ch] text-sm leading-relaxed"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {it.bio}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Tez-tez verilən suallar ─────────────────────────────────────────────────
/**
 * JavaScript yoxdur — <details>/<summary>.
 * FAQPage struktur məlumatı (JSON-LD) mərkəzi olaraq SiteRenderer-də verilir.
 */
function Faq({ s }: { s: FaqSection }) {
  const items = (s.items ?? []).filter((it) => it.question?.trim() && it.answer?.trim());
  if (items.length === 0) return null;

  const hasHead = Boolean(s.heading || s.subheading);

  return (
    <section id="faq" className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
        {hasHead && (
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <SectionIntro heading={s.heading} subheading={s.subheading} className="" />
          </div>
        )}
        <div className={hasHead ? "lg:col-span-8" : "lg:col-span-12"}>
          {items.map((it, i) => (
            <details
              key={i}
              className="group border-t last:border-b"
              style={{ borderColor: HAIR }}
            >
              <summary
                className={`flex cursor-pointer list-none items-start justify-between gap-5 py-6 [&::-webkit-details-marker]:hidden ${FOCUS}`}
              >
                <h3
                  style={HEAD}
                  className="min-w-0 text-base font-semibold leading-snug tracking-[-0.015em] lg:text-lg"
                >
                  {it.question}
                </h3>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] leading-none duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  style={{ color: "var(--site-muted)", transitionProperty: "transform" }}
                >
                  add
                </span>
              </summary>
              <p
                className="max-w-[68ch] whitespace-pre-line pb-7 leading-relaxed"
                style={{ color: "var(--site-muted)" }}
              >
                {it.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── İş saatları ─────────────────────────────────────────────────────────────
function Hours({ s }: { s: HoursSection }) {
  const items = (s.items ?? []).filter((it) => it.days?.trim() || it.hours?.trim());
  if (items.length === 0) return null;

  return (
    <section className={`border-b ${PAD}`} style={{ borderColor: HAIR }}>
      <div className={`${WRAP} grid gap-8 lg:grid-cols-12 lg:gap-16`}>
        {s.heading && <H2 className="max-w-[22ch] lg:col-span-4">{s.heading}</H2>}
        <div className={s.heading ? "lg:col-span-6" : "lg:col-span-8"}>
          <dl>
            {items.map((it, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-6 border-t py-4 last:border-b"
                style={{ borderColor: HAIR }}
              >
                <dt className="min-w-0">{it.days}</dt>
                <dd
                  style={HEAD}
                  className="shrink-0 text-right font-medium tabular-nums"
                >
                  {it.hours}
                </dd>
              </div>
            ))}
          </dl>
          {s.note && (
            <p className="mt-5 max-w-[60ch] text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
              {s.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Əlaqə ───────────────────────────────────────────────────────────────────
function Contact({ s, ui }: { s: ContactSection; ui: Ui }) {
  const rows: { label: string; value: string; href?: string }[] = [];
  if (s.phone) rows.push({ label: ui.phone, value: s.phone, href: `tel:${s.phone.replace(/\s+/g, "")}` });
  if (s.email) rows.push({ label: ui.email, value: s.email, href: `mailto:${s.email}` });
  if (s.address) rows.push({ label: ui.address, value: s.address, href: s.mapUrl });

  if (rows.length === 0 && !s.heading) return null;

  return (
    <section id="elaqe" className={PAD} style={{ background: "var(--site-surface)" }}>
      <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
        <H2 className="max-w-[22ch] lg:col-span-4">{s.heading ?? ui.contact}</H2>

        {rows.length > 0 && (
          <dl className="lg:col-span-8">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid gap-1 border-t py-6 last:border-b sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8"
                style={{ borderColor: HAIR }}
              >
                <dt className="text-sm" style={{ color: "var(--site-muted)" }}>
                  {r.label}
                </dt>
                <dd
                  style={HEAD}
                  className="min-w-0 break-words text-lg font-medium tracking-[-0.015em] lg:text-xl"
                >
                  {r.href ? (
                    <a
                      href={r.href}
                      {...(r.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={`underline decoration-1 underline-offset-4 hover:text-[var(--site-primary)] ${TR} ${FOCUS}`}
                      style={{ textDecorationColor: HAIR }}
                    >
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {s.mapUrl && !s.address && (
        <div className={`${WRAP} mt-8`}>
          <a
            href={s.mapUrl}
            target="_blank"
            rel="noreferrer"
            className={`text-sm font-semibold underline underline-offset-4 hover:text-[var(--site-primary)] ${TR} ${FOCUS}`}
          >
            {ui.map}
          </a>
        </div>
      )}
    </section>
  );
}

// ── Yekun çağırış ───────────────────────────────────────────────────────────
function Cta({ s, cHref }: { s: CtaSection; cHref: string }) {
  if (!s.heading && !s.ctaText) return null;

  return (
    <section style={{ background: INK, color: "#ffffff" }}>
      <div
        className={`${WRAP} flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20`}
      >
        <div className="max-w-[34ch]">
          {s.heading && (
            <h2
              style={HEAD}
              className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]"
            >
              {s.heading}
            </h2>
          )}
          {s.subheading && (
            <p className="mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              {s.subheading}
            </p>
          )}
        </div>
        {s.ctaText && (
          <a
            href={s.ctaUrl ?? cHref}
            className={`shrink-0 self-start rounded-sm px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--site-on-primary)] duration-200 hover:brightness-90 motion-reduce:transition-none lg:self-auto ${FOCUS_INK}`}
            style={{ background: "var(--site-primary)", transitionProperty: "filter" }}
          >
            {s.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// ── Altbilgi ────────────────────────────────────────────────────────────────
function SiteFooter({
  content,
  siteName,
  ui,
}: {
  content: SiteContent;
  siteName: string;
  ui: Ui;
}) {
  const year = new Date().getFullYear();
  const links =
    content.nav ?? (content.pages ?? []).map((p) => ({ label: p.title, href: navHref(p.slug) }));
  const socials = content.footer?.socials ?? [];

  return (
    <footer style={{ background: INK, color: "#ffffff" }}>
      <div className={`${WRAP} py-12 lg:py-14`}>
        <div className="flex flex-col gap-8 border-b pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16" style={{ borderColor: HAIR_INK }}>
          <span style={HEAD} className="text-xl font-semibold tracking-[-0.02em]">
            {siteName}
          </span>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
            {links.length > 0 && (
              <nav aria-label={ui.footerNav} className="flex flex-col gap-2.5">
                {links.map((n, i) => (
                  <a
                    key={i}
                    href={n.href}
                    className={`text-sm hover:text-white ${TR} ${FOCUS_INK}`}
                    style={{ color: "rgba(255,255,255,0.66)" }}
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
            )}
            {socials.length > 0 && (
              <nav aria-label={ui.social} className="flex flex-col gap-2.5">
                {socials.map((n, i) => (
                  <a
                    key={i}
                    href={n.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-sm hover:text-white ${TR} ${FOCUS_INK}`}
                    style={{ color: "rgba(255,255,255,0.66)" }}
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>

        <p className="pt-6 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
          {content.footer?.text ?? `© ${year} ${siteName}`}
        </p>
      </div>
    </footer>
  );
}
