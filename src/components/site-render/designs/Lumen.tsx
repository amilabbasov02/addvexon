/**
 * "lumen" dizaynı — gözəllik salonu / spa / bərbər.
 *
 * Redaksiya (editorial) estetikası: yüksək kontrastlı display serif, iti
 * künclər (heç bir border-radius), saç teli qalınlığında ayırıcı xətlər,
 * asimmetrik hero, nömrələnmiş xidmət indeksi və qeyri-bərabər qalereya.
 * İmza elementi — səhifə kənarındakı şaquli etiket və hər bölmənin sıra
 * nömrəsi (01, 02, 03 ...).
 *
 * Rənglər yalnız tema CSS dəyişənlərindən gəlir; struktur üçün neytral
 * ağ/qara istifadə olunur.
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
  GallerySection,
  ContactSection,
  CtaSection,
  StatsSection,
  TestimonialsSection,
  FaqSection,
  TeamSection,
  PricingSection,
  ProcessSection,
  HoursSection,
  LogosSection,
} from "@/lib/site-content";

/* ------------------------------------------------------------------ */
/*  UI mətnləri — AZ birincidir                                        */
/* ------------------------------------------------------------------ */

type Ui = {
  menu: string;
  book: string;
  phone: string;
  email: string;
  address: string;
  map: string;
  contact: string;
  toTop: string;
  /** İş saatları bölməsinin başlığı yoxdursa. */
  hours: string;
  /** FAQ bölməsinin başlığı yoxdursa. */
  faq: string;
  /** Rəy ulduzları üçün ekran oxuyucu mətni. */
  rating: string;
  /** `featured: true` paketin yanındaki incə qeyd. */
  featured: string;
  /** Rəylər bölməsinin gizli başlığı (başlıq verilməyəndə struktur üçün). */
  reviews: string;
  /** Partnyor loqoları zolağının gizli başlığı. */
  partners: string;
};

const UI: Record<Locale, Ui> = {
  az: {
    menu: "MENYU",
    book: "Randevu",
    phone: "TELEFON",
    email: "E-POÇT",
    address: "ÜNVAN",
    map: "Xəritədə bax",
    contact: "Əlaqə",
    toTop: "Yuxarı",
    hours: "İş saatları",
    faq: "Tez-tez verilən suallar",
    rating: "Qiymət",
    featured: "SEÇİLMİŞ",
    reviews: "Müştəri rəyləri",
    partners: "Partnyorlar",
  },
  en: {
    menu: "MENU",
    book: "Book",
    phone: "PHONE",
    email: "EMAIL",
    address: "ADDRESS",
    map: "View on map",
    contact: "Contact",
    toTop: "Top",
    hours: "Opening hours",
    faq: "Frequently asked questions",
    rating: "Rating",
    featured: "FEATURED",
    reviews: "Client reviews",
    partners: "Partners",
  },
  ru: {
    menu: "МЕНЮ",
    book: "Запись",
    phone: "ТЕЛЕФОН",
    email: "ПОЧТА",
    address: "АДРЕС",
    map: "На карте",
    contact: "Контакты",
    toTop: "Наверх",
    hours: "Часы работы",
    faq: "Частые вопросы",
    rating: "Оценка",
    featured: "ВЫБОР",
    reviews: "Отзывы клиентов",
    partners: "Партнёры",
  },
};

/** "Bağlıdır" tipli dəyərlər sönük göstərilir — cədvəli sürətli oxumaq üçün. */
const CLOSED = /^\s*(bağlı\w*|qapalı|istirahət\w*|closed|day\s*off|закрыт\w*|выходной|не\s*работа\w*|—|-)\s*$/i;

/* ------------------------------------------------------------------ */
/*  Ortaq stillər                                                      */
/* ------------------------------------------------------------------ */

/** Display serif — dizaynın kimliyi. */
const display: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', var(--site-font-heading), Georgia, serif",
};
/** Kiçik, geniş hərf aralıqlı etiketlər. */
const label: React.CSSProperties = {
  fontFamily: "'Jost', var(--site-font-body), system-ui, sans-serif",
  letterSpacing: "0.22em",
};
/** Tema mətnindən törəyən saç teli xətt — açıq və tünd fonda işləyir. */
const HAIR = "color-mix(in srgb, var(--site-text) 14%, transparent)";
const HAIR_STRONG = "color-mix(in srgb, var(--site-text) 28%, transparent)";

/** Hər interaktiv element üçün eyni, həmişə görünən fokus halqası. */
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

function ord(i: number) {
  return String(i + 1).padStart(2, "0");
}

/**
 * Yalnız bu bölmələr sıra nömrəsi alır. Hero, stats, cta, hours və logos
 * nömrələnmir — beləliklə indeks 01-dən başlayır və ardıcıl qalır.
 */
const NUMBERED = new Set<string>([
  "features",
  "about",
  "gallery",
  "contact",
  "testimonials",
  "faq",
  "team",
  "pricing",
  "process",
]);

/** Səhifədəki bölmələr üçün ardıcıl "01, 02, ..." siyahısı qurur. */
function buildOrdinals(sections: Section[]): string[] {
  let k = 0;
  return sections.map((s) => (NUMBERED.has(s.type) ? ord(k++) : ""));
}

/* ------------------------------------------------------------------ */
/*  Kök                                                                */
/* ------------------------------------------------------------------ */

export function LumenDesign({
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
  const siteName = content.siteName?.trim() || "Salon";
  const nav = content.nav ?? [];
  const sections = page.sections ?? [];
  const ordinals = buildOrdinals(sections);

  return (
    <div
      className="overflow-x-hidden"
      style={{
        background: "var(--site-bg)",
        color: "var(--site-text)",
        fontFamily: "var(--site-font-body)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap"
      />

      <a
        href="#lumen-main"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:px-5 focus:py-3 focus:text-xs focus:font-medium focus:text-[var(--site-on-primary)] ${focus}`}
        style={{ ...label, background: "var(--site-primary)" }}
      >
        {siteName}
      </a>

      <Header siteName={siteName} logoUrl={theme.logoUrl} nav={nav} ui={ui} />

      <main id="lumen-main">
        {sections.map((s, i) => (
          <SectionView key={i} section={s} n={ordinals[i]} ui={ui} siteName={siteName} />
        ))}
      </main>

      <Footer siteName={siteName} content={content} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Başlıq                                                             */
/* ------------------------------------------------------------------ */

function Header({
  siteName,
  logoUrl,
  nav,
  ui,
}: {
  siteName: string;
  logoUrl?: string;
  nav: { label: string; href: string }[];
  ui: Ui;
}) {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{
        borderColor: HAIR,
        background: "color-mix(in srgb, var(--site-bg) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8 md:py-5 xl:px-12">
        <a
          href="/"
          className={`inline-flex min-w-0 items-center transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none ${focus}`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto md:h-9" />
          ) : (
            <span
              style={display}
              className="truncate text-2xl font-medium tracking-tight md:text-[1.75rem]"
            >
              {siteName}
            </span>
          )}
        </a>

        {nav.length > 0 && (
          <>
            {/* Masaüstü naviqasiya */}
            <nav aria-label={siteName} className="hidden items-center gap-8 md:flex">
              {nav.map((n, i) => (
                <a
                  key={i}
                  href={n.href}
                  className={`group relative py-1 text-xs ${focus}`}
                  style={{ ...label, color: "var(--site-muted)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 block h-px origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none"
                    style={{ background: "var(--site-primary)" }}
                  />
                  {n.label}
                </a>
              ))}
              <a
                href="#elaqe"
                className={`border px-6 py-3 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none ${focus}`}
                style={{ ...label, borderColor: HAIR_STRONG }}
              >
                {ui.book}
              </a>
            </nav>

            {/* Mobil naviqasiya — JS-siz, yalnız <details> */}
            <details className="group relative md:hidden">
              <summary
                className={`flex cursor-pointer list-none items-center gap-3 py-2 text-xs [&::-webkit-details-marker]:hidden ${focus}`}
                style={label}
              >
                <span aria-hidden className="relative block h-3 w-5">
                  <span className="absolute left-0 top-0 block h-px w-5 bg-current transition-transform duration-200 group-open:translate-y-1.5 group-open:rotate-45 motion-reduce:transition-none" />
                  <span className="absolute left-0 top-3 block h-px w-5 bg-current transition-transform duration-200 group-open:-translate-y-1.5 group-open:-rotate-45 motion-reduce:transition-none" />
                </span>
                {ui.menu}
              </summary>
              <nav
                aria-label={siteName}
                className="absolute right-0 top-full z-50 mt-4 w-60 max-w-[calc(100vw-2.5rem)] border p-6"
                style={{ borderColor: HAIR_STRONG, background: "var(--site-bg)" }}
              >
                <ul className="flex flex-col">
                  {nav.map((n, i) => (
                    <li key={i} className="border-b last:border-b-0" style={{ borderColor: HAIR }}>
                      <a
                        href={n.href}
                        className={`block py-3 text-xs ${focus}`}
                        style={{ ...label, color: "var(--site-muted)" }}
                      >
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href="#elaqe"
                  className={`mt-5 block px-5 py-3 text-center text-xs font-medium text-[var(--site-on-primary)] ${focus}`}
                  style={{ ...label, background: "var(--site-primary)" }}
                >
                  {ui.book}
                </a>
              </nav>
            </details>
          </>
        )}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Bölmə seçicisi                                                     */
/* ------------------------------------------------------------------ */

function SectionView({
  section,
  n,
  ui,
  siteName,
}: {
  section: Section;
  n: string;
  ui: Ui;
  siteName: string;
}) {
  switch (section.type) {
    case "hero":
      return <Hero {...(section as HeroSection)} siteName={siteName} />;
    case "features":
      return <Services {...(section as FeaturesSection)} n={n} />;
    case "about":
      return <About {...(section as AboutSection)} n={n} />;
    case "gallery":
      return <Gallery {...(section as GallerySection)} n={n} />;
    case "stats":
      return <Stats {...(section as StatsSection)} />;
    case "contact":
      return <Contact {...(section as ContactSection)} n={n} ui={ui} />;
    case "cta":
      return <Cta {...(section as CtaSection)} />;
    case "testimonials":
      return <Testimonials {...(section as TestimonialsSection)} n={n} ui={ui} />;
    case "faq":
      return <Faq {...(section as FaqSection)} n={n} ui={ui} />;
    case "team":
      return <Team {...(section as TeamSection)} n={n} />;
    case "pricing":
      return <Pricing {...(section as PricingSection)} n={n} ui={ui} />;
    case "process":
      return <Process {...(section as ProcessSection)} n={n} />;
    case "hours":
      return <Hours {...(section as HoursSection)} ui={ui} />;
    case "logos":
      return <Logos {...(section as LogosSection)} ui={ui} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Ortaq hissəciklər                                                  */
/* ------------------------------------------------------------------ */

/** Bölmə başlığı üstündəki nömrə + xətt. İmza motivi. */
function Eyebrow({ n, className = "" }: { n: string; className?: string }) {
  if (!n) return null;
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden>
      <span className="text-xs" style={{ ...label, color: "var(--site-primary)" }}>
        {n}
      </span>
      <span className="block h-px w-12" style={{ background: HAIR_STRONG }} />
    </div>
  );
}

/** Düzbucaqlı, iti künclü əsas düymə. */
function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-4 px-8 py-4 text-xs font-medium text-[var(--site-on-primary)] transition-opacity duration-200 hover:opacity-85 motion-reduce:transition-none ${focus} ${className}`}
      style={{ ...label, background: "var(--site-primary)" }}
    >
      <span className="min-w-0">{children}</span>
      <span
        aria-hidden
        className="block h-px w-6 bg-current transition-[width] duration-200 group-hover:w-9 motion-reduce:transition-none"
      />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero(s: HeroSection & { siteName: string }) {
  const hasImage = Boolean(s.imageUrl);

  return (
    <section className="relative overflow-hidden">
      {/* İmza: səhifə kənarındakı şaquli etiket */}
      <span
        aria-hidden
        className="absolute bottom-16 left-4 hidden text-xs xl:block"
        style={{
          ...label,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          color: "var(--site-muted)",
        }}
      >
        {s.siteName}
      </span>
      <span
        aria-hidden
        className="absolute left-8 top-0 hidden h-full w-px xl:block"
        style={{ background: HAIR }}
      />

      <div
        className={`mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 xl:px-12 ${
          hasImage ? "lg:grid-cols-12 lg:gap-10" : ""
        }`}
      >
        <div
          className={`flex flex-col justify-center py-16 sm:py-20 lg:py-32 ${
            hasImage ? "lg:col-span-6" : "mx-auto max-w-3xl text-balance"
          }`}
        >
          <span
            aria-hidden
            className="mb-8 block h-px w-16"
            style={{ background: "var(--site-primary)" }}
          />
          <h1
            style={{
              ...display,
              fontSize: "clamp(2.75rem, 7.5vw, 5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.015em",
            }}
            className="font-light break-words hyphens-auto"
          >
            {s.heading}
          </h1>
          {s.subheading && (
            <p
              className="mt-7 max-w-md text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--site-muted)" }}
            >
              {s.subheading}
            </p>
          )}
          {s.ctaText && (
            <div className="mt-10">
              <PrimaryLink href={s.ctaUrl ?? "#elaqe"}>{s.ctaText}</PrimaryLink>
            </div>
          )}
        </div>

        {s.imageUrl && (
          <div className="relative pb-16 lg:col-span-5 lg:col-start-8 lg:pb-32 lg:pt-32">
            <span
              aria-hidden
              className="absolute -left-4 top-28 hidden h-full w-full border lg:block"
              style={{ borderColor: HAIR_STRONG }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading}
              className="relative aspect-3/4 w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Xidmətlər — nömrələnmiş indeks                                     */
/* ------------------------------------------------------------------ */

function Services(s: FeaturesSection & { n: string }) {
  if (!s.items?.length) return null;

  return (
    <section id="xidmetler" className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Eyebrow n={s.n} />
            {s.heading && (
              <h2
                style={display}
                className="mt-6 text-3xl font-light leading-tight sm:text-4xl"
              >
                {s.heading}
              </h2>
            )}
            {s.subheading && (
              <p
                className="mt-4 max-w-sm text-sm leading-relaxed"
                style={{ color: "var(--site-muted)" }}
              >
                {s.subheading}
              </p>
            )}
          </div>

          <ol className="mt-10 lg:col-span-8 lg:mt-0">
            {s.items.map((it, i) => (
              <li
                key={i}
                className="group border-t last:border-b"
                style={{ borderColor: HAIR }}
              >
                <div className="flex items-baseline gap-5 py-6 transition-[padding] duration-200 group-hover:pl-2 motion-reduce:transition-none sm:gap-8 sm:py-7">
                  <span
                    className="shrink-0 text-xs transition-colors duration-200 motion-reduce:transition-none"
                    style={{ ...label, color: "var(--site-muted)" }}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-8">
                    <h3
                      style={display}
                      className="text-2xl font-normal leading-snug sm:w-2/5 sm:shrink-0 sm:text-[1.75rem]"
                    >
                      {it.title}
                    </h3>
                    {it.text && (
                      <p
                        className="mt-2 text-sm leading-relaxed sm:mt-0 sm:flex-1"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {it.text}
                      </p>
                    )}
                  </div>
                  {it.icon && (
                    <span
                      aria-hidden
                      className="material-symbols-outlined hidden shrink-0 text-xl transition-colors duration-200 motion-reduce:transition-none sm:block"
                      style={{ color: "var(--site-muted)" }}
                    >
                      {it.icon}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Haqqımızda — buraxılış hərfi (drop cap)                            */
/* ------------------------------------------------------------------ */

function About(s: AboutSection & { n: string }) {
  if (!s.heading && !s.body && !s.imageUrl) return null;
  const hasImage = Boolean(s.imageUrl);

  return (
    <section
      className="py-20 sm:py-24 lg:py-32"
      style={{ background: "var(--site-surface)" }}
    >
      <div
        className={`mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 xl:px-12 ${
          hasImage ? "lg:grid-cols-12 lg:gap-16" : ""
        }`}
      >
        {s.imageUrl && (
          <div className="relative lg:col-span-5">
            <span
              aria-hidden
              className="absolute -bottom-4 -left-4 hidden h-full w-full border lg:block"
              style={{ borderColor: HAIR_STRONG }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading ?? ""}
              className="relative aspect-4/5 w-full object-cover"
            />
          </div>
        )}
        <div className={hasImage ? "lg:col-span-6 lg:col-start-7" : "mx-auto max-w-2xl"}>
          <Eyebrow n={s.n} />
          {s.heading && (
            <h2
              style={display}
              className="mt-6 text-3xl font-light leading-tight sm:text-4xl lg:text-[2.75rem]"
            >
              {s.heading}
            </h2>
          )}
          {s.body && (
            <p
              className="mt-7 whitespace-pre-line text-base leading-[1.85] first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:leading-[0.78] first-letter:font-light"
              style={{ color: "var(--site-muted)" }}
            >
              {s.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Statistika                                                         */
/* ------------------------------------------------------------------ */

function Stats(s: StatsSection) {
  if (!s.items?.length) return null;

  return (
    <section className="px-5 sm:px-8 xl:px-12">
      <div
        className="mx-auto grid max-w-6xl grid-cols-2 border-t py-14 sm:py-16 lg:grid-cols-4"
        style={{ borderColor: HAIR }}
      >
        {s.items.map((it, i) => (
          <div
            key={i}
            className="px-2 py-4 text-center sm:px-4"
            style={{
              borderLeft: i % 2 === 0 ? "none" : `1px solid ${HAIR}`,
            }}
          >
            <div
              style={{ ...display, color: "var(--site-primary)" }}
              className="text-4xl font-light leading-none sm:text-5xl"
            >
              {it.value}
            </div>
            <div
              className="mt-3 text-xs leading-relaxed"
              style={{ ...label, color: "var(--site-muted)" }}
            >
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Qalereya — qeyri-bərabər redaksiya şəbəkəsi                        */
/* ------------------------------------------------------------------ */

/** 12 sütunlu şəbəkədə 7/5 və 5/7 cütlərinin növbələşməsi. */
function galleryCell(i: number, total: number) {
  if (total === 1) return { span: "md:col-span-12", ratio: "aspect-16/9", offset: "" };
  switch (i % 4) {
    case 0:
      return { span: "md:col-span-7", ratio: "aspect-4/3", offset: "" };
    case 1:
      return { span: "md:col-span-5", ratio: "aspect-3/4", offset: "md:mt-16" };
    case 2:
      return { span: "md:col-span-5", ratio: "aspect-3/4", offset: "" };
    default:
      return { span: "md:col-span-7", ratio: "aspect-4/3", offset: "md:mt-16" };
  }
}

function Gallery(s: GallerySection & { n: string }) {
  // Şəkli olmayan elementləri at: məzmun yazılanda foto hələ olmaya bilər, və
  // boş `src` səhifənin özünü yenidən yükləməyə çalışır. Heç nə qalmasa bölmə
  // ümumiyyətlə render olunmur.
  const items = (s.items ?? []).filter((it) => it.imageUrl);
  if (items.length === 0) return null;
  s = { ...s, items };

  return (
    <section id="qalereya" className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <Eyebrow n={s.n} />
        {s.heading && (
          <h2
            style={display}
            className="mt-6 max-w-2xl text-3xl font-light leading-tight sm:text-4xl"
          >
            {s.heading}
          </h2>
        )}
        <div className="mt-12 grid grid-cols-1 items-start gap-6 sm:gap-8 md:grid-cols-12">
          {s.items.map((it, i) => {
            const c = galleryCell(i, s.items.length);
            return (
              <figure key={i} className={`${c.span} ${c.offset}`}>
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.imageUrl}
                    alt={it.caption ?? ""}
                    loading="lazy"
                    className={`${c.ratio} w-full object-cover transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none`}
                  />
                </div>
                {it.caption && (
                  <figcaption
                    className="mt-3 text-xs"
                    style={{ ...label, color: "var(--site-muted)" }}
                  >
                    {it.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Əlaqə                                                              */
/* ------------------------------------------------------------------ */

function ContactRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-1 border-t py-5 sm:grid-cols-3 sm:gap-6"
      style={{ borderColor: HAIR }}
    >
      <dt className="text-xs" style={{ ...label, color: "var(--site-muted)" }}>
        {term}
      </dt>
      <dd className="min-w-0 break-words text-base sm:col-span-2">{children}</dd>
    </div>
  );
}

function Contact(s: ContactSection & { n: string; ui: Ui }) {
  const { ui } = s;
  if (!s.phone && !s.email && !s.address && !s.heading) return null;

  return (
    <section
      id="elaqe"
      className="py-20 sm:py-24 lg:py-32"
      style={{ background: "var(--site-surface)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 xl:px-12">
        <div className="lg:col-span-5">
          <Eyebrow n={s.n} />
          <h2
            style={display}
            className="mt-6 text-3xl font-light leading-tight sm:text-4xl lg:text-[2.75rem]"
          >
            {s.heading ?? ui.contact}
          </h2>
          {s.phone && (
            <a
              href={`tel:${s.phone.replace(/\s+/g, "")}`}
              style={{ ...display, color: "var(--site-primary)" }}
              className={`mt-8 inline-block text-3xl font-normal transition-opacity duration-200 hover:opacity-75 motion-reduce:transition-none sm:text-4xl ${focus}`}
            >
              {s.phone}
            </a>
          )}
        </div>

        <dl className="lg:col-span-6 lg:col-start-7">
          {s.phone && (
            <ContactRow term={ui.phone}>
              <a
                href={`tel:${s.phone.replace(/\s+/g, "")}`}
                className={`transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none ${focus}`}
              >
                {s.phone}
              </a>
            </ContactRow>
          )}
          {s.email && (
            <ContactRow term={ui.email}>
              <a
                href={`mailto:${s.email}`}
                className={`transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none ${focus}`}
              >
                {s.email}
              </a>
            </ContactRow>
          )}
          {s.address && (
            <ContactRow term={ui.address}>
              <span>{s.address}</span>
              {s.mapUrl && (
                <a
                  href={s.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 block text-xs underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none ${focus}`}
                  style={{ ...label, color: "var(--site-primary)" }}
                >
                  {ui.map}
                </a>
              )}
            </ContactRow>
          )}
          <div className="border-t" style={{ borderColor: HAIR }} />
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA — tünd, tam enli lövhə                                         */
/* ------------------------------------------------------------------ */

function Cta(s: CtaSection) {
  if (!s.heading && !s.ctaText) return null;

  return (
    <section style={{ background: "#111111", color: "#ffffff" }}>
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28">
        <span
          aria-hidden
          className="mx-auto mb-8 block h-px w-16"
          style={{ background: "var(--site-primary)" }}
        />
        {s.heading && (
          <h2
            style={{ ...display, lineHeight: 1.05 }}
            className="text-balance text-3xl font-light sm:text-5xl"
          >
            {s.heading}
          </h2>
        )}
        {s.subheading && (
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            {s.subheading}
          </p>
        )}
        {s.ctaText && (
          <a
            href={s.ctaUrl ?? "#elaqe"}
            className={`group mt-10 inline-flex items-center gap-4 bg-white px-8 py-4 text-xs font-medium text-[#111111] transition-opacity duration-200 hover:opacity-85 motion-reduce:transition-none ${focus}`}
            style={label}
          >
            <span className="min-w-0">{s.ctaText}</span>
            <span
              aria-hidden
              className="block h-px w-6 bg-current transition-[width] duration-200 group-hover:w-9 motion-reduce:transition-none"
            />
          </a>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Rəylər — böyük redaksiya sitatı + ikinci dərəcəli siyahı           */
/* ------------------------------------------------------------------ */

function Stars({ rating, term }: { rating?: number; term: string }) {
  if (typeof rating !== "number" || !Number.isFinite(rating)) return null;
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  if (n < 1) return null;
  return (
    <span
      role="img"
      aria-label={`${term}: ${n}/5`}
      className="whitespace-nowrap text-sm"
      style={{ color: "var(--site-primary)", letterSpacing: "0.18em" }}
    >
      <span aria-hidden>{"★".repeat(n)}</span>
      <span aria-hidden style={{ opacity: 0.25 }}>
        {"★".repeat(5 - n)}
      </span>
    </span>
  );
}

function Attribution({
  author,
  role,
  avatarUrl,
  rating,
  term,
  large,
}: {
  author: string;
  role?: string;
  avatarUrl?: string;
  rating?: number;
  term: string;
  large?: boolean;
}) {
  return (
    <footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          className={`shrink-0 object-cover ${large ? "h-12 w-12" : "h-9 w-9"}`}
        />
      )}
      <div className="min-w-0">
        <div className={large ? "text-base font-medium" : "text-sm font-medium"}>{author}</div>
        {role && (
          <div className="mt-1 text-xs" style={{ ...label, color: "var(--site-muted)" }}>
            {role}
          </div>
        )}
      </div>
      <Stars rating={rating} term={term} />
    </footer>
  );
}

function Testimonials(s: TestimonialsSection & { n: string; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.quote && it.author);
  if (!items.length) return null;
  const [lead, ...rest] = items;

  return (
    <section className="py-20 sm:py-24 lg:py-32" style={{ background: "var(--site-surface)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <Eyebrow n={s.n} />
        {s.heading ? (
          <h2
            style={display}
            className="mt-6 max-w-2xl text-3xl font-light leading-tight sm:text-4xl"
          >
            {s.heading}
          </h2>
        ) : (
          <h2 className="sr-only">{s.ui.reviews}</h2>
        )}
        {s.subheading && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
            {s.subheading}
          </p>
        )}

        {/* Aparıcı sitat — böyük, redaksiya üslubunda */}
        <figure className="mt-12 lg:grid lg:grid-cols-12 lg:gap-10">
          <span
            aria-hidden
            style={{ ...display, color: "var(--site-primary)" }}
            className="block text-6xl leading-[0.5] opacity-25 lg:col-span-1 lg:text-7xl"
          >
            &ldquo;
          </span>
          <blockquote className="mt-4 lg:col-span-11 lg:mt-0">
            <p
              style={{
                ...display,
                fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
                lineHeight: 1.3,
              }}
              className="font-light italic"
            >
              {lead.quote}
            </p>
            <Attribution
              author={lead.author}
              role={lead.role}
              avatarUrl={lead.avatarUrl}
              rating={lead.rating}
              term={s.ui.rating}
              large
            />
          </blockquote>
        </figure>

        {/* Qalan rəylər — incə xətli iki sütun */}
        {rest.length > 0 && (
          <ul className="mt-16 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {rest.map((it, i) => (
              <li key={i} className="border-t py-8" style={{ borderColor: HAIR_STRONG }}>
                <blockquote>
                  <p className="text-base leading-relaxed">{it.quote}</p>
                  <Attribution
                    author={it.author}
                    role={it.role}
                    avatarUrl={it.avatarUrl}
                    rating={it.rating}
                    term={s.ui.rating}
                  />
                </blockquote>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ — JavaScript olmadan, <details>/<summary>                      */
/* ------------------------------------------------------------------ */

function Faq(s: FaqSection & { n: string; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.question && it.answer);
  if (!items.length) return null;

  /* FAQPage JSON-LD `SiteRenderer.tsx` (buildFaqJsonLd) tərəfindən mərkəzi
     şəkildə verilir — burada təkrarlanmır. */

  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Eyebrow n={s.n} />
            <h2 style={display} className="mt-6 text-3xl font-light leading-tight sm:text-4xl">
              {s.heading ?? s.ui.faq}
            </h2>
            {s.subheading && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {s.subheading}
              </p>
            )}
          </div>

          <div className="mt-10 lg:col-span-8 lg:mt-0">
            {items.map((it, i) => (
              <details
                key={i}
                className="group border-t last:border-b"
                style={{ borderColor: HAIR }}
              >
                <summary
                  className={`flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden ${focus}`}
                >
                  <h3
                    style={display}
                    className="min-w-0 text-xl font-normal leading-snug sm:text-2xl"
                  >
                    {it.question}
                  </h3>
                  {/* + / − göstəricisi: iki 1px xətt, biri açılanda yox olur */}
                  <span aria-hidden className="relative mt-2 block h-3 w-3 shrink-0">
                    <span
                      className="absolute left-0 top-1/2 block h-px w-3"
                      style={{ background: "var(--site-primary)" }}
                    />
                    <span
                      className="absolute left-1/2 top-0 block h-3 w-px origin-center transition-transform duration-200 group-open:rotate-90 group-open:scale-y-0 motion-reduce:transition-none"
                      style={{ background: "var(--site-primary)" }}
                    />
                  </span>
                </summary>
                <div className="pb-7 pr-9 sm:pr-12">
                  <p
                    className="max-w-2xl whitespace-pre-line text-base leading-relaxed"
                    style={{ color: "var(--site-muted)" }}
                  >
                    {it.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Komanda — portret şəbəkəsi                                         */
/* ------------------------------------------------------------------ */

function Team(s: TeamSection & { n: string }) {
  const items = (s.items ?? []).filter((it) => it.name);
  if (!items.length) return null;

  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <Eyebrow n={s.n} />
        {s.heading && (
          <h2
            style={display}
            className="mt-6 max-w-2xl text-3xl font-light leading-tight sm:text-4xl"
          >
            {s.heading}
          </h2>
        )}
        {s.subheading && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
            {s.subheading}
          </p>
        )}
        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <li key={i}>
              {it.imageUrl ? (
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    loading="lazy"
                    className="aspect-3/4 w-full object-cover transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none"
                  />
                </div>
              ) : (
                /* Şəkil yoxdursa — boş çərçivə yerinə incə xətt */
                <span aria-hidden className="block h-px w-16" style={{ background: "var(--site-primary)" }} />
              )}
              <h3 style={display} className="mt-5 text-2xl font-normal leading-snug">
                {it.name}
              </h3>
              {it.role && (
                <p className="mt-2 text-xs" style={{ ...label, color: "var(--site-primary)" }}>
                  {it.role}
                </p>
              )}
              {it.bio && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                  {it.bio}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Qiymətlər — salon qiymət cədvəli (nöqtəli aparıcı xətt)            */
/* ------------------------------------------------------------------ */

function Pricing(s: PricingSection & { n: string; ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.name && it.price);
  if (!items.length) return null;

  return (
    <section
      id="qiymetler"
      className="py-20 sm:py-24 lg:py-32"
      style={{ background: "var(--site-surface)" }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Eyebrow n={s.n} />
            {s.heading && (
              <h2 style={display} className="mt-6 text-3xl font-light leading-tight sm:text-4xl">
                {s.heading}
              </h2>
            )}
            {s.subheading && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {s.subheading}
              </p>
            )}
          </div>

          <div className="mt-10 lg:col-span-8 lg:mt-0">
            <ul>
              {items.map((it, i) => (
                <li
                  key={i}
                  className="border-t last:border-b"
                  style={{ borderColor: HAIR }}
                >
                  <div
                    className="py-6 sm:py-7"
                    style={
                      it.featured
                        ? {
                            borderLeft: "2px solid var(--site-primary)",
                            paddingLeft: "1.25rem",
                            background:
                              "linear-gradient(to right, color-mix(in srgb, var(--site-primary) 5%, transparent), transparent 60%)",
                          }
                        : undefined
                    }
                  >
                    {it.featured && (
                      <p className="mb-2 text-xs" style={{ ...label, color: "var(--site-primary)" }}>
                        {s.ui.featured}
                      </p>
                    )}
                    {/* Ad ....... qiymət — klassik qiymət siyahısı */}
                    <div className="flex items-baseline gap-3">
                      <h3
                        style={display}
                        className="shrink text-xl font-normal leading-snug sm:text-2xl"
                      >
                        {it.name}
                      </h3>
                      <span
                        aria-hidden
                        className="hidden min-w-6 flex-1 border-b border-dotted sm:block"
                        style={{ borderColor: HAIR_STRONG }}
                      />
                      <p className="ml-auto shrink-0 text-right sm:ml-0">
                        <span
                          style={{ ...display, fontVariantNumeric: "tabular-nums" }}
                          className="text-xl font-medium sm:text-2xl"
                        >
                          {it.price}
                        </span>
                        {it.unit && (
                          <span
                            className="ml-2 text-xs"
                            style={{ ...label, color: "var(--site-muted)" }}
                          >
                            {it.unit}
                          </span>
                        )}
                      </p>
                    </div>
                    {it.desc && (
                      <p
                        className="mt-3 max-w-xl text-sm leading-relaxed"
                        style={{ color: "var(--site-muted)" }}
                      >
                        {it.desc}
                      </p>
                    )}
                    {it.features && it.features.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8">
                        {it.features.map((f, j) => (
                          <li key={j} className="flex items-baseline gap-2 text-sm">
                            <span
                              aria-hidden
                              className="mt-2 block h-px w-3 shrink-0"
                              style={{ background: "var(--site-primary)" }}
                            />
                            <span style={{ color: "var(--site-muted)" }}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {s.note && (
              <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {s.note}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Proses — nömrələnmiş mərhələlər                                    */
/* ------------------------------------------------------------------ */

/** Mərhələ sayına görə sütun sayı — 2 addım 4 sütunda itmir. */
function processCols(n: number) {
  if (n <= 2) return "sm:grid-cols-2";
  if (n === 3) return "sm:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

function Process(s: ProcessSection & { n: string }) {
  const items = (s.items ?? []).filter((it) => it.title);
  if (!items.length) return null;

  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 xl:px-12">
        <Eyebrow n={s.n} />
        {s.heading && (
          <h2
            style={display}
            className="mt-6 max-w-2xl text-3xl font-light leading-tight sm:text-4xl"
          >
            {s.heading}
          </h2>
        )}
        {s.subheading && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
            {s.subheading}
          </p>
        )}
        {/* Hər hüceyrənin üst xətti birləşərək kəsilməz zaman xətti verir */}
        <ol className={`mt-14 grid gap-x-8 gap-y-10 ${processCols(items.length)}`}>
          {items.map((it, i) => (
            <li key={i} className="border-t pt-6" style={{ borderColor: HAIR_STRONG }}>
              <span
                aria-hidden
                style={{ ...display, color: "var(--site-primary)" }}
                className="block text-4xl font-light leading-none sm:text-5xl"
              >
                {ord(i)}
              </span>
              <h3 style={display} className="mt-4 text-xl font-normal leading-snug sm:text-2xl">
                {it.title}
              </h3>
              {it.text && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
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

/* ------------------------------------------------------------------ */
/*  İş saatları — sürətli oxunan cədvəl                                */
/* ------------------------------------------------------------------ */

function Hours(s: HoursSection & { ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.days && it.hours);
  if (!items.length) return null;

  return (
    <section id="is-saatlari" className="px-5 py-20 sm:px-8 sm:py-24 xl:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="border p-7 sm:p-10" style={{ borderColor: HAIR_STRONG }}>
          <div className="flex items-baseline gap-4">
            <h2 style={display} className="text-2xl font-light leading-tight sm:text-3xl">
              {s.heading ?? s.ui.hours}
            </h2>
            <span aria-hidden className="h-px flex-1" style={{ background: HAIR }} />
          </div>

          <dl className="mt-7">
            {items.map((it, i) => {
              const closed = CLOSED.test(it.hours);
              return (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-4 border-b py-4 last:border-b-0"
                  style={{ borderColor: HAIR }}
                >
                  <dt className="min-w-0 text-sm font-medium sm:text-base">{it.days}</dt>
                  <dd
                    className="shrink-0 text-right text-sm sm:text-base"
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.02em",
                      color: closed ? "var(--site-muted)" : "var(--site-text)",
                      fontWeight: closed ? 400 : 500,
                    }}
                  >
                    {it.hours}
                  </dd>
                </div>
              );
            })}
          </dl>

          {s.note && (
            <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--site-muted)" }}>
              {s.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Partnyor loqoları                                                  */
/* ------------------------------------------------------------------ */

function Logos(s: LogosSection & { ui: Ui }) {
  const items = (s.items ?? []).filter((it) => it.name);
  if (!items.length) return null;

  return (
    <section className="px-5 sm:px-8 xl:px-12">
      <div className="mx-auto max-w-6xl border-t py-14 sm:py-16" style={{ borderColor: HAIR }}>
        {s.heading ? (
          <h2
            className="text-center text-xs"
            style={{ ...label, color: "var(--site-muted)" }}
          >
            {s.heading}
          </h2>
        ) : (
          <h2 className="sr-only">{s.ui.partners}</h2>
        )}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-center">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  loading="lazy"
                  className="h-8 w-auto max-w-[9rem] object-contain opacity-70 transition-opacity duration-200 hover:opacity-100 motion-reduce:transition-none sm:h-9"
                />
              ) : (
                <span
                  style={{ ...display, color: "var(--site-muted)" }}
                  className="text-lg font-normal sm:text-xl"
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

/* ------------------------------------------------------------------ */
/*  Alt hissə                                                          */
/* ------------------------------------------------------------------ */

function Footer({ siteName, content }: { siteName: string; content: SiteContent }) {
  const year = new Date().getFullYear();
  const socials = content.footer?.socials ?? [];

  return (
    <footer className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16 xl:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p style={display} className="text-3xl font-light leading-none sm:text-4xl">
            {siteName}
          </p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {socials.map((sc, i) => (
                <li key={i}>
                  <a
                    href={sc.href}
                    className={`text-xs transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none ${focus}`}
                    style={{ ...label, color: "var(--site-muted)" }}
                  >
                    {sc.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p
          className="mt-12 border-t pt-6 text-xs"
          style={{ ...label, borderColor: HAIR, color: "var(--site-muted)" }}
        >
          {content.footer?.text ?? `© ${year} ${siteName}`}
        </p>
      </div>
    </footer>
  );
}
