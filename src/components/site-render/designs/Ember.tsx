/**
 * "ember" dizaynı — restoran / kafe / bar.
 *
 * İdeya: qaranlıq, isti yemək zalı. Səhifənin fonu tünd və istidir (tenant
 * rəngi ilə çalarlanır), menyu isə həmin tünd fonun üzərinə qoyulmuş krem
 * rəngli ÇAP OLUNMUŞ KART kimi görünür — nöqtəli leader-lər, düzülmüş
 * qiymətlər, geniş sətir aralığı. Bu inversiya səhifənin imza anıdır.
 *
 * Bütün rənglər tema CSS dəyişənlərindən törəyir (color-mix), ona görə tenant
 * rəngi dəyişəndə bütün sayt dəyişir. Kontrast zəmanətlidir: tenant rəngi
 * yalnız işıq/xətt kimi işlənir, mətn rəngi kimi yox.
 */
import type {
  SiteContent,
  SiteTheme,
  Page,
  Section,
  Locale,
  HeroSection,
  MenuSection,
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

// ── UI mətnləri ────────────────────────────────────────────────────────────
type EmberUi = {
  reserve: string;
  nav: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  viewMap: string;
  skip: string;
  home: string;
  // İkinci nəsil bölmələr — yalnız başlıq yoxdursa gizli (aria) ad kimi işlənir,
  // görünən mətn kimi heç nə uydurulmur. `hours` istisnadır: cədvəlin adı olmalı.
  hours: string;
  faq: string;
  testimonials: string;
  team: string;
  setMenus: string;
  steps: string;
  partners: string;
  rating: string;
  featured: string;
};

const UI: Record<Locale, EmberUi> = {
  az: {
    reserve: "Rezervasiya",
    nav: "Əsas naviqasiya",
    contact: "Əlaqə",
    phone: "Telefon",
    email: "E-poçt",
    address: "Ünvan",
    viewMap: "Xəritədə bax",
    skip: "Əsas məzmuna keç",
    home: "Ana səhifə",
    hours: "İş saatları",
    faq: "Tez-tez verilən suallar",
    testimonials: "Qonaqların rəyləri",
    team: "Komandamız",
    setMenus: "Set menyular",
    steps: "Necə işləyir",
    partners: "Partnyorlar",
    rating: "Reytinq",
    featured: "Seçilmiş",
  },
  en: {
    reserve: "Book a table",
    nav: "Main navigation",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    address: "Address",
    viewMap: "View on map",
    skip: "Skip to main content",
    home: "Home",
    hours: "Opening hours",
    faq: "Frequently asked questions",
    testimonials: "What guests say",
    team: "Our team",
    setMenus: "Set menus",
    steps: "How it works",
    partners: "Partners",
    rating: "Rating",
    featured: "Featured",
  },
  ru: {
    reserve: "Забронировать",
    nav: "Основная навигация",
    contact: "Контакты",
    phone: "Телефон",
    email: "Эл. почта",
    address: "Адрес",
    viewMap: "Посмотреть на карте",
    skip: "Перейти к содержанию",
    home: "Главная",
    hours: "Часы работы",
    faq: "Частые вопросы",
    testimonials: "Отзывы гостей",
    team: "Наша команда",
    setMenus: "Сет-меню",
    steps: "Как это работает",
    partners: "Партнёры",
    rating: "Оценка",
    featured: "Выбранный",
  },
};

// ── Tipoqrafiya ────────────────────────────────────────────────────────────
// Newsreader — isti, redaksiya ruhlu display serif (optik ölçü oxu ilə).
// Azərbaycan hərfləri (ə, ğ, ş...) üçün fallback zənciri var: hərf yoxdursa
// brauzer avtomatik növbəti şrifti götürür, ona görə heç bir simvol itmir.
const display: React.CSSProperties = {
  fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
  fontVariationSettings: "'opsz' 24",
};
// Böyük başlıqlar üçün: optik ölçü maksimuma qaldırılır — incə serif-lər,
// daha sıx tərtibat. Bu, display ölçüdə şriftin əsl xarakterini açır.
const displayLarge: React.CSSProperties = {
  ...display,
  fontVariationSettings: "'opsz' 72",
};

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--em-accent-soft)]";

// ── Kök komponent ──────────────────────────────────────────────────────────
export function EmberDesign({
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
  const ui = UI[lang] ?? UI.az;
  const name = content.siteName?.trim() || "Restoran";
  const links = navLinks(content);
  const reserveHref = findReserveHref(links);

  const vars: Record<string, string> = {
    // Tünd, isti zəmin — tenant rəngindən bir az çalar götürür.
    "--em-ink": "color-mix(in srgb, var(--site-primary) 7%, #14100d)",
    "--em-ink-soft": "color-mix(in srgb, var(--site-primary) 9%, #1f1916)",
    // Çap kartı — krem kağız.
    "--em-paper": "#f7f1e6",
    "--em-paper-ink": "#1a1411",
    "--em-paper-muted": "#6d5f50",
    "--em-paper-line": "#d9cdb9",
    // Tünd fonda mətn rəngləri.
    "--em-cream": "#f4ece0",
    "--em-cream-dim": "#c6b7a4",
    "--em-line": "color-mix(in srgb, #f4ece0 15%, transparent)",
    // Vurğu: xam tenant rəngi yalnız işıq/xətt üçün, "soft" variant mətn üçün
    // (istənilən tenant rəngini açıqlaşdırır → tünd fonda AA zəmanətlidir).
    "--em-accent": "var(--site-primary)",
    "--em-accent-soft": "color-mix(in srgb, var(--site-primary) 55%, #ffe6c4)",
    // Kağız düyməsinin hover fonu: krem bir az isinir, brend rənginə çevrilmir.
    // Belə olanda üstündəki tünd mətn istənilən tenant rəngində AA saxlayır.
    "--em-paper-hover": "color-mix(in srgb, var(--em-paper) 88%, var(--em-accent))",
    // İşıq: əvvəlcə mürəkkəbə qarışdırılır, sonra şəffaflaşdırılır. Ən parlaq
    // nöqtəsində belə zəmin kremi mətni AA-dan aşağı sala bilmir (ən pis hal —
    // ağ/açıq sarı tenant rəngi — ~4.9:1).
    "--em-glow": "color-mix(in srgb, color-mix(in srgb, var(--site-primary) 70%, #14100d) 30%, transparent)",
  };

  return (
    <div
      style={{ ...(vars as React.CSSProperties), background: "var(--em-ink)", color: "var(--em-cream)", fontFamily: "var(--site-font-body)" }}
      className="overflow-x-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..700&display=swap"
      />

      <a
        href="#main"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:px-4 focus:py-2 focus:text-sm focus:font-semibold ${FOCUS}`}
        style={{ background: "var(--em-paper)", color: "var(--em-paper-ink)" }}
      >
        {ui.skip}
      </a>

      <SiteHeader name={name} logoUrl={theme.logoUrl} links={links} reserveHref={reserveHref} ui={ui} />

      <main id="main">
        {page.sections.map((s, i) => (
          <SectionView key={i} section={s} idx={i} ui={ui} reserveHref={reserveHref} />
        ))}
      </main>

      <SiteFooter name={name} content={content} />
    </div>
  );
}

// ── Köməkçilər ─────────────────────────────────────────────────────────────
function navHref(slug: string) {
  return slug === "" ? "/" : `/${slug}`;
}

function navLinks(content: SiteContent): { label: string; href: string }[] {
  const fromNav = (content.nav ?? []).filter((n) => n?.label && n?.href);
  if (fromNav.length > 0) return fromNav;
  return (content.pages ?? [])
    .filter((p) => p?.title)
    .map((p) => ({ label: p.title, href: navHref(p.slug) }));
}

function findReserveHref(links: { label: string; href: string }[]) {
  const hit = links.find((l) => /elaqe|contact|kontakt|rezerv|book/i.test(l.href));
  return hit?.href ?? "#elaqe";
}

function has(v?: string | null): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// ── Naviqasiya ─────────────────────────────────────────────────────────────
function SiteHeader({
  name,
  logoUrl,
  links,
  reserveHref,
  ui,
}: {
  name: string;
  logoUrl?: string;
  links: { label: string; href: string }[];
  reserveHref: string;
  ui: EmberUi;
}) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "var(--em-line)",
        background: "color-mix(in srgb, var(--em-ink) 88%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6 md:py-4">
        <a href="/" aria-label={ui.home} className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xs ${FOCUS}`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-8 w-auto max-w-[11rem] object-contain sm:h-9" />
          ) : (
            <span
              style={display}
              className="truncate text-xl leading-tight font-semibold tracking-[-0.01em] sm:text-2xl"
            >
              {name}
            </span>
          )}
        </a>

        <div className="flex items-center gap-6">
          <nav aria-label={ui.nav} className="hidden md:block">
            <ul className="flex items-center gap-7">
              {links.map((n, i) => (
                <li key={i}>
                  <a
                    href={n.href}
                    className={`inline-flex min-h-11 items-center rounded-xs text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-colors duration-200 motion-reduce:transition-none hover:text-[color:var(--em-cream)] ${FOCUS}`}
                    style={{ color: "var(--em-cream-dim)" }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={reserveHref}
            className={`inline-flex min-h-11 items-center rounded-xs border px-4 text-[0.75rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-200 motion-reduce:transition-none sm:px-5 sm:text-[0.8125rem] ${FOCUS}`}
            style={{ borderColor: "var(--em-accent-soft)", color: "var(--em-accent-soft)" }}
          >
            {ui.reserve}
          </a>
        </div>
      </div>

      {/* Mobil: JS-siz açılan menyu mümkün deyil, ona görə linklər ikinci
          sətirdə sarılaraq görünür — gizlətmək əvəzinə. */}
      {links.length > 0 && (
        <nav aria-label={ui.nav} className="md:hidden" style={{ borderTop: "1px solid var(--em-line)" }}>
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2 sm:px-6">
            {links.map((n, i) => (
              <li key={i}>
                <a
                  href={n.href}
                  className={`inline-flex min-h-9 items-center rounded-xs text-[0.7rem] font-medium tracking-[0.14em] uppercase ${FOCUS}`}
                  style={{ color: "var(--em-cream-dim)" }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

// ── Bölmə seçici ───────────────────────────────────────────────────────────
function SectionView({
  section,
  idx,
  ui,
  reserveHref,
}: {
  section: Section;
  idx: number;
  ui: EmberUi;
  reserveHref: string;
}) {
  switch (section.type) {
    case "hero":
      return <Hero {...(section as HeroSection)} reserveHref={reserveHref} />;
    case "menu":
      return <Menu {...(section as MenuSection)} />;
    case "features":
      return <Features {...(section as FeaturesSection)} />;
    case "about":
      return <About {...(section as AboutSection)} />;
    case "gallery":
      return <Gallery {...(section as GallerySection)} />;
    case "stats":
      return <Stats {...(section as StatsSection)} />;
    case "contact":
      return <Contact {...(section as ContactSection)} ui={ui} />;
    case "cta":
      return <Cta {...(section as CtaSection)} reserveHref={reserveHref} />;
    case "hours":
      return <Hours {...(section as HoursSection)} ui={ui} idx={idx} />;
    case "pricing":
      return <Pricing {...(section as PricingSection)} ui={ui} idx={idx} />;
    case "testimonials":
      return <Testimonials {...(section as TestimonialsSection)} ui={ui} idx={idx} />;
    case "faq":
      return <Faq {...(section as FaqSection)} ui={ui} idx={idx} />;
    case "team":
      return <Team {...(section as TeamSection)} ui={ui} idx={idx} />;
    case "process":
      return <Process {...(section as ProcessSection)} ui={ui} idx={idx} />;
    case "logos":
      return <Logos {...(section as LogosSection)} ui={ui} idx={idx} />;
    default:
      return null;
  }
}

// ── Ümumi hissəciklər ──────────────────────────────────────────────────────
function Grain({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: NOISE, opacity, mixBlendMode: "overlay" }}
    />
  );
}

/** Aşağıdan qalxan isti işıq — tenant rəngi burada mətn deyil, işıqdır. */
function EmberGlow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          "radial-gradient(120% 85% at 50% 118%, var(--em-glow) 0%, transparent 62%)",
      }}
    />
  );
}

function CreamButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xs px-7 text-[0.8125rem] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 motion-reduce:transition-none hover:bg-[color:var(--em-paper-hover)] ${FOCUS}`}
      style={{ background: "var(--em-paper)", color: "var(--em-paper-ink)" }}
    >
      {children}
    </a>
  );
}

/**
 * "Kağız" səthi — Ember-in mərkəzi ideyası: yazılı olan hər şey (menyu, set
 * menyular, qonaq sözləri) tünd divarın üzərinə qoyulmuş krem kağız kimidir.
 * Bu qayda kremi dekorasiya deyil, məna daşıyıcısı edir.
 */
const paperSurface: React.CSSProperties = {
  background: "var(--em-paper)",
  color: "var(--em-paper-ink)",
  boxShadow: "0 28px 70px -28px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)",
};
const paperSurfaceSm: React.CSSProperties = {
  background: "var(--em-paper)",
  color: "var(--em-paper-ink)",
  boxShadow: "0 16px 38px -20px rgba(0,0,0,0.7)",
};

/** Tünd fonda bölmə başlığı. Başlıq yoxdursa heç nə uydurulmur. */
function SectionHead({
  id,
  heading,
  subheading,
  center = false,
}: {
  id: string;
  heading?: string;
  subheading?: string;
  center?: boolean;
}) {
  if (!has(heading) && !has(subheading)) return null;
  return (
    <header className={`mb-10 sm:mb-14 ${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {has(heading) && (
        <h2
          id={id}
          style={display}
          className="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance"
        >
          {heading}
        </h2>
      )}
      {has(subheading) && (
        <p className="mt-4 max-w-[60ch] leading-relaxed" style={{ color: "var(--em-cream-dim)" }}>
          {subheading}
        </p>
      )}
    </header>
  );
}

/** Bölmənin əlçatan adı: başlıq varsa ona bağlanır, yoxsa gizli ad verilir. */
function labelProps(hasHeading: boolean, id: string, fallback: string) {
  return hasHeading ? { "aria-labelledby": id } : { "aria-label": fallback };
}

function Tick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5l3.1 3.1L13 4.9" />
    </svg>
  );
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${label}: ${r}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill={i <= r ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        >
          <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.5L10 14.6 5 17.2l1-5.5-4-3.9L7.6 7z" />
        </svg>
      ))}
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero(s: HeroSection & { reserveHref: string }) {
  if (!has(s.heading)) return null;
  const cta = has(s.ctaText) ? s.ctaText : null;

  return (
    // Foto varsa hero demək olar ki, bütün ekranı tutur — restoranda ilk an
    // iştahdır, mətn deyil. Foto yoxdursa bölmə qəsdən alçalır: boş tünd
    // sahəni uzatmaq mətn hissini gücləndirir.
    <section
      className={`relative isolate flex items-end overflow-hidden ${
        has(s.imageUrl)
          ? "min-h-[34rem] sm:min-h-[44rem] lg:min-h-[92svh] lg:max-h-[64rem]"
          : "min-h-[28rem] sm:min-h-[34rem] lg:min-h-[68svh] lg:max-h-[50rem]"
      }`}
    >
      {has(s.imageUrl) ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--em-ink) 72%, transparent) 0%, color-mix(in srgb, var(--em-ink) 34%, transparent) 38%, color-mix(in srgb, var(--em-ink) 92%, transparent) 88%, var(--em-ink) 100%)",
            }}
          />
        </>
      ) : (
        <EmberGlow className="-z-10" />
      )}
      <Grain opacity={0.06} />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 pb-14 sm:px-6 sm:pt-32 sm:pb-20 lg:pb-24">
        <h1
          style={displayLarge}
          className="max-w-[16ch] text-[clamp(2.5rem,8.5vw,6rem)] leading-[0.94] font-semibold tracking-[-0.025em] text-balance"
        >
          {s.heading}
        </h1>

        {has(s.subheading) && (
          <p
            className="mt-6 max-w-[46ch] text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--em-cream-dim)" }}
          >
            {s.subheading}
          </p>
        )}

        {cta && (
          <div className="mt-9 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <CreamButton href={s.ctaUrl ?? s.reserveHref}>{cta}</CreamButton>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Menyu — səhifənin ürəyi: tünd masanın üstündə krem çap kartı ───────────
function Menu(s: MenuSection) {
  const groups = (s.groups ?? []).filter((g) => g && (has(g.name) || (g.items ?? []).length > 0));
  if (groups.length === 0) return null;
  const single = groups.length === 1;
  // Atmosfer fotosu varsa kart onun üstünə oturur: əvvəlcə zal görünür,
  // sonra kağız. Şəkilsiz halda köhnə davranış — kart tünd fonda dayanır.
  const band = has(s.imageUrl);

  return (
    <section
      id="menyu"
      className={`relative overflow-hidden ${band ? "pb-16 sm:pb-24 lg:pb-32" : "py-16 sm:py-24 lg:py-32"}`}
    >
      {band ? (
        <div className="relative h-64 sm:h-80 lg:h-[26rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, var(--em-ink) 0%, color-mix(in srgb, var(--em-ink) 40%, transparent) 26%, color-mix(in srgb, var(--em-ink) 30%, transparent) 55%, color-mix(in srgb, var(--em-ink) 85%, transparent) 100%)",
            }}
          />
        </div>
      ) : (
        <EmberGlow />
      )}

      <div
        className={`relative mx-auto max-w-5xl px-4 sm:px-6 ${
          band ? "-mt-24 sm:-mt-32 lg:-mt-44" : ""
        }`}
      >
        <article
          className="relative overflow-hidden rounded-xs px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
          style={paperSurface}
        >
          <Grain opacity={0.035} />

          <div className="relative">
            {has(s.heading) && (
              <header className="mb-12 text-center sm:mb-16">
                <h2
                  style={display}
                  className="text-[clamp(1.875rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance"
                >
                  {s.heading}
                </h2>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-7 block h-0.5 w-16"
                  style={{ background: "var(--em-accent)" }}
                />
              </header>
            )}

            <div
              className={
                single
                  ? "mx-auto max-w-2xl"
                  : "grid gap-x-14 gap-y-12 sm:gap-y-14 lg:grid-cols-2 lg:gap-x-20"
              }
            >
              {groups.map((g, i) => (
                <MenuGroup key={i} name={g.name} items={g.items ?? []} />
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MenuGroup({ name, items }: { name?: string; items: MenuSection["groups"][number]["items"] }) {
  const list = (items ?? []).filter((it) => has(it?.name));
  if (list.length === 0 && !has(name)) return null;

  return (
    <section className="break-inside-avoid">
      {has(name) && (
        <h3
          className="mb-6 flex items-center gap-4 text-[0.75rem] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "var(--em-paper-ink)" }}
        >
          <span>{name}</span>
          <span aria-hidden="true" className="h-px flex-1" style={{ background: "var(--em-paper-line)" }} />
        </h3>
      )}

      {list.length > 0 && (
        <dl className="space-y-6">
          {list.map((it, j) => {
            const shot = has(it.imageUrl);
            return (
              <div key={j} className="break-inside-avoid">
                {/* İmza yeməklərdə sətir foto ilə açılır. Foto `dt`-nin
                    daxilindədir — beləliklə `dl` quruluşu pozulmur və ad,
                    leader, qiymət eyni sətirdə qalır. */}
                <dt className={shot ? "flex items-center gap-4 sm:gap-5" : "flex"}>
                  {shot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      // Yeməyin adı elə yanındadır — şəkil onu təkrarlamamalıdır.
                      alt=""
                      loading="lazy"
                      className="h-24 w-24 shrink-0 rounded-xs object-cover sm:h-32 sm:w-32"
                      style={{ boxShadow: "0 0 0 1px var(--em-paper-line)" }}
                    />
                  )}

                  <span className="flex min-w-0 flex-1 items-baseline gap-2 sm:gap-3">
                    <span
                      className={`min-w-0 leading-snug font-medium break-words ${
                        shot ? "text-[1.125rem] sm:text-xl" : "text-[1.0625rem]"
                      }`}
                    >
                      {it.name}
                    </span>
                    {has(it.price) && (
                      <>
                        {/* Nöqtəli leader — yalnız qiymət varsa mənalıdır. */}
                        <span
                          aria-hidden="true"
                          className="hidden h-[0.6em] min-w-8 flex-1 sm:block"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 1.5px 100%, var(--em-paper-muted) 1.1px, transparent 1.6px)",
                            backgroundSize: "7px 100%",
                            backgroundRepeat: "repeat-x",
                            opacity: 0.5,
                          }}
                        />
                        <span
                          style={display}
                          className={`ml-auto shrink-0 font-semibold tabular-nums sm:ml-0 ${
                            shot ? "text-[1.125rem] sm:text-xl" : "text-[1.0625rem]"
                          }`}
                        >
                          {it.price}
                        </span>
                      </>
                    )}
                  </span>
                </dt>

                {has(it.desc) && (
                  <dd
                    className={`mt-1.5 max-w-[54ch] text-[0.9375rem] leading-relaxed ${
                      shot ? "pl-28 sm:pl-[9.25rem]" : ""
                    }`}
                    style={{ color: "var(--em-paper-muted)" }}
                  >
                    {it.desc}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

// ── Xüsusiyyətlər — kart yox, incə xətlərlə ayrılmış mətn sütunları ────────
function Features(s: FeaturesSection) {
  const items = (s.items ?? []).filter((it) => has(it?.title));
  if (items.length === 0) return null;
  // Bir dənə də olsa foto varsa bölmə kadr şəbəkəsinə keçir; heç biri yoxdursa
  // əvvəlki incə xətli mətn sütunları qalır (zərif geri çəkilmə).
  const withShots = items.some((it) => has(it.imageUrl));

  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: "var(--em-ink-soft)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {(has(s.heading) || has(s.subheading)) && (
          <header className="mb-12 max-w-2xl sm:mb-16">
            {has(s.heading) && (
              <h2
                style={display}
                className="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance"
              >
                {s.heading}
              </h2>
            )}
            {has(s.subheading) && (
              <p className="mt-4 max-w-[60ch] leading-relaxed" style={{ color: "var(--em-cream-dim)" }}>
                {s.subheading}
              </p>
            )}
          </header>
        )}

        <ul
          className={`grid gap-y-10 sm:grid-cols-2 lg:grid-cols-3 ${
            withShots ? "gap-x-6" : "gap-x-12"
          }`}
        >
          {items.map((it, i) => (
            <li
              key={i}
              className={withShots ? "" : "pt-6"}
              style={withShots ? undefined : { borderTop: "1px solid var(--em-line)" }}
            >
              {withShots &&
                (has(it.imageUrl) ? (
                  <div className="overflow-hidden rounded-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.imageUrl}
                      // Başlıq dərhal altındadır — təkrar oxunmasın.
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-[250ms] ease-out will-change-transform hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </div>
                ) : (
                  // Bir neçə elementin fotosu yoxdursa şəbəkə dağılmır:
                  // eyni nisbətdə sakit lövhə yerini tutur.
                  <div
                    aria-hidden="true"
                    className="aspect-[4/3] w-full rounded-xs"
                    style={{ background: "var(--em-ink)", border: "1px solid var(--em-line)" }}
                  />
                ))}

              <h3
                style={display}
                className={`text-xl leading-snug font-semibold tracking-[-0.01em] ${
                  withShots ? "mt-5" : ""
                }`}
              >
                {it.title}
              </h3>
              {has(it.text) && (
                <p
                  className="mt-2.5 max-w-[46ch] text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--em-cream-dim)" }}
                >
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

// ── Haqqımızda — asimmetrik, drop cap ilə ──────────────────────────────────
function About(s: AboutSection) {
  if (!has(s.heading) && !has(s.body) && !has(s.imageUrl)) return null;
  const withImage = has(s.imageUrl);

  return (
    <section id="haqqimizda" className="py-16 sm:py-20 lg:py-28">
      <div
        className={`mx-auto max-w-6xl px-5 sm:px-6 ${withImage ? "grid items-start gap-10 lg:grid-cols-12 lg:gap-16" : ""}`}
      >
        {withImage && (
          // Şəkil mətnlə bərabər çəkidədir (6/6) — "yazının yanındakı kiçik
          // kadr" yox, cüt. Kiçik yuxarı boşluq redaksiya ritmini saxlayır.
          <figure className="overflow-hidden rounded-xs lg:col-span-6 lg:mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.heading ?? ""}
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
          </figure>
        )}

        <div className={withImage ? "lg:col-span-6" : "max-w-3xl"}>
          {has(s.heading) && (
            <h2
              style={display}
              className="text-[clamp(1.875rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance"
            >
              {s.heading}
            </h2>
          )}
          {has(s.body) && (
            <p
              className="mt-7 max-w-[68ch] text-[1.0625rem] leading-[1.75] whitespace-pre-line first-letter:[font-family:'Newsreader',Georgia,serif] first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:text-[3.5rem] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-[color:var(--em-accent-soft)]"
              style={{ color: "var(--em-cream-dim)" }}
            >
              {s.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Qalereya — bərabər kvadratlar yox, redaksiya mozaikası ─────────────────
// İlk kadr bölmənin "açılışıdır" — tam enli, geniş nisbətdə. Qalanları
// redaksiya mozaikası kimi növbələşir. Beləliklə qalereya səhifənin ən böyük
// bölmələrindən birinə çevrilir, kiçik kvadratlar sırasına yox.
const GALLERY_PATTERN = [
  { col: "lg:col-span-5", ratio: "aspect-[4/5]" },
  { col: "lg:col-span-7", ratio: "aspect-[4/3]" },
  { col: "lg:col-span-7", ratio: "aspect-[4/3]" },
  { col: "lg:col-span-5", ratio: "aspect-[4/5]" },
];

function Gallery(s: GallerySection) {
  const items = (s.items ?? []).filter((it) => has(it?.imageUrl));
  if (items.length === 0) return null;

  return (
    <section id="qalereya" className="py-16 sm:py-24 lg:py-32" style={{ background: "var(--em-ink-soft)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {has(s.heading) && (
          <h2
            style={display}
            className="mb-10 max-w-[20ch] text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:mb-14"
          >
            {s.heading}
          </h2>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12">
          {items.map((it, i) => {
            const lead = i === 0;
            const p = GALLERY_PATTERN[(i - 1) % GALLERY_PATTERN.length];
            return (
              <li
                key={i}
                className={`self-start ${
                  lead ? "sm:col-span-2 lg:col-span-12" : `sm:col-span-1 ${p?.col ?? "lg:col-span-6"}`
                }`}
              >
                <figure>
                  <div className="overflow-hidden rounded-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.imageUrl}
                      alt={it.caption ?? ""}
                      loading="lazy"
                      className={`w-full object-cover transition-transform duration-[250ms] ease-out will-change-transform hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none ${
                        lead ? "aspect-[16/9] lg:aspect-[21/9]" : (p?.ratio ?? "aspect-[4/3]")
                      }`}
                    />
                  </div>
                  {has(it.caption) && (
                    <figcaption
                      className="mt-2.5 text-[0.8125rem] leading-relaxed"
                      style={{ color: "var(--em-cream-dim)" }}
                    >
                      {it.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ── Statistika — nazik zolaq, 1px hairline ayırıcılarla ────────────────────
function Stats(s: StatsSection) {
  const items = (s.items ?? []).filter((it) => has(it?.value) || has(it?.label));
  if (items.length === 0) return null;
  const cols = items.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-4";
  const shot = has(s.imageUrl);

  return (
    // Foto varsa rəqəmlər şüşə kimi onun üstündə dayanır: xanalar yarışəffaf
    // tünddür, ona görə hansı foto qoyulsa da mətn AA-dan aşağı düşmür.
    <section className={`relative isolate px-5 sm:px-6 ${shot ? "py-16 sm:py-20" : "py-12 sm:py-16"}`}>
      {shot && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{ background: "color-mix(in srgb, var(--em-ink) 55%, transparent)" }}
          />
        </>
      )}
      <div className="mx-auto max-w-6xl">
        <ul
          className={`grid grid-cols-2 gap-px ${cols}`}
          style={{ background: "var(--em-line)", border: "1px solid var(--em-line)" }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              className="px-5 py-8 text-center sm:px-6 sm:py-10"
              style={{
                background: shot
                  ? "color-mix(in srgb, var(--em-ink) 80%, transparent)"
                  : "var(--em-ink)",
              }}
            >
              {has(it.value) && (
                <p
                  style={display}
                  className="text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-semibold tracking-[-0.02em] tabular-nums"
                >
                  {it.value}
                </p>
              )}
              {has(it.label) && (
                <p
                  className="mt-3 text-[0.75rem] font-medium tracking-[0.16em] uppercase"
                  style={{ color: "var(--em-cream-dim)" }}
                >
                  {it.label}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Əlaqə ──────────────────────────────────────────────────────────────────
function Contact(s: ContactSection & { ui: EmberUi }) {
  const ui = s.ui;
  const rows: { label: string; value: string; href?: string }[] = [];
  if (has(s.phone)) rows.push({ label: ui.phone, value: s.phone, href: `tel:${s.phone.replace(/\s+/g, "")}` });
  if (has(s.email)) rows.push({ label: ui.email, value: s.email, href: `mailto:${s.email}` });
  if (has(s.address)) rows.push({ label: ui.address, value: s.address });
  if (rows.length === 0 && !has(s.mapUrl)) return null;

  return (
    <section id="elaqe" className="py-16 sm:py-20 lg:py-28" style={{ background: "var(--em-ink-soft)" }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2
            style={display}
            className="text-[clamp(1.875rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance"
          >
            {s.heading ?? ui.contact}
          </h2>
          <span aria-hidden="true" className="mt-7 block h-0.5 w-16" style={{ background: "var(--em-accent)" }} />
        </div>

        <div className="lg:col-span-7">
          <dl>
            {rows.map((r, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-8"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--em-line)" }}
              >
                <dt
                  className="text-[0.7rem] font-medium tracking-[0.18em] uppercase sm:w-28 sm:shrink-0"
                  style={{ color: "var(--em-cream-dim)" }}
                >
                  {r.label}
                </dt>
                <dd className="text-lg leading-snug break-words">
                  {r.href ? (
                    <a
                      href={r.href}
                      className={`inline-flex min-h-11 items-center rounded-xs transition-colors duration-200 motion-reduce:transition-none hover:text-[color:var(--em-cream)] ${FOCUS}`}
                      style={{ color: "var(--em-accent-soft)" }}
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

          {has(s.mapUrl) && (
            <a
              href={s.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex min-h-11 items-center rounded-xs text-[0.8125rem] font-semibold tracking-[0.14em] uppercase underline decoration-1 underline-offset-[6px] transition-colors duration-200 motion-reduce:transition-none hover:text-[color:var(--em-cream)] ${FOCUS}`}
              style={{ color: "var(--em-accent-soft)" }}
            >
              {ui.viewMap}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────
function Cta(s: CtaSection & { reserveHref: string }) {
  if (!has(s.heading) && !has(s.ctaText)) return null;
  const shot = has(s.imageUrl);

  return (
    // Foto varsa CTA tam enli fotoşəritdir: rezervasiya qərarı iştahın
    // üstündə verilir. Foto yoxdursa köhnə isti işıqlı lövhə qalır.
    <section
      className={`relative isolate flex items-center overflow-hidden ${
        shot
          ? "min-h-[26rem] py-24 sm:min-h-[32rem] sm:py-28 lg:min-h-[38rem] lg:py-36"
          : "py-20 sm:py-24 lg:py-32"
      }`}
    >
      {shot ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* Mətn fotonun üstündədir — ona görə örtük tünddür və zəmanətlidir:
              ən açıq nöqtədə belə krem mətn AA-nı saxlayır. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, var(--em-ink) 0%, color-mix(in srgb, var(--em-ink) 78%, transparent) 24%, color-mix(in srgb, var(--em-ink) 74%, transparent) 76%, var(--em-ink) 100%)",
            }}
          />
        </>
      ) : (
        <EmberGlow />
      )}
      <Grain opacity={0.05} />
      <div className="relative mx-auto w-full max-w-3xl px-5 text-center sm:px-6">
        {has(s.heading) && (
          <h2
            style={displayLarge}
            className="text-[clamp(2rem,6vw,4rem)] leading-[1.02] font-semibold tracking-[-0.025em] text-balance"
          >
            {s.heading}
          </h2>
        )}
        {has(s.subheading) && (
          <p
            className="mx-auto mt-5 max-w-[52ch] leading-relaxed"
            style={{ color: "var(--em-cream-dim)" }}
          >
            {s.subheading}
          </p>
        )}
        {has(s.ctaText) && (
          <div className="mt-9">
            <CreamButton href={s.ctaUrl ?? s.reserveHref}>{s.ctaText}</CreamButton>
          </div>
        )}
      </div>
    </section>
  );
}

// ── İş saatları — restoran üçün ən çox axtarılan məlumat ───────────────────
// "Açıqdırlar?" sualı ən çox verilən sualdır, ona görə bu bölmə divarda öz
// çərçivəsi ilə dayanır: yuxarıda 2px vurğu kənarı, isti işıq, iri sətirlər,
// saatlar tabular rəqəmlərlə düz sütunda. Rəng tək məlumat daşıyıcısı deyil —
// "Bağlıdır" da eyni ölçüdə mətn kimi oxunur.
function Hours(s: HoursSection & { ui: EmberUi; idx: number }) {
  const rows = (s.items ?? []).filter((r) => has(r?.days) || has(r?.hours));
  if (rows.length === 0) return null;
  const hid = `ember-hours-${s.idx}`;
  const heading = has(s.heading) ? s.heading : s.ui.hours;

  return (
    <section
      id="is-saatlari"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
      aria-labelledby={hid}
    >
      <EmberGlow />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
        <div
          className="rounded-xs px-5 py-8 sm:px-10 sm:py-10"
          style={{
            background: "color-mix(in srgb, var(--em-ink-soft) 92%, transparent)",
            border: "1px solid var(--em-line)",
            borderTop: "2px solid var(--em-accent)",
          }}
        >
          <h2
            id={hid}
            style={display}
            className="text-[clamp(1.5rem,4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em] text-balance"
          >
            {heading}
          </h2>

          <dl className="mt-7">
            {rows.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--em-line)" }}
              >
                <dt className="min-w-0 text-[1.0625rem] leading-snug font-medium break-words sm:text-lg">
                  {r.days}
                </dt>
                <dd
                  style={display}
                  className="text-[1.0625rem] leading-snug font-semibold tabular-nums sm:text-lg"
                >
                  {r.hours}
                </dd>
              </div>
            ))}
          </dl>

          {has(s.note) && (
            <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--em-cream-dim)" }}>
              {s.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Set menyular — menyu ilə eyni çap kartı estetikası ─────────────────────
function Pricing(s: PricingSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((it) => has(it?.name) || has(it?.price));
  if (items.length === 0) return null;
  const hid = `ember-pricing-${s.idx}`;
  const cols = items.length === 1 ? "" : items.length % 3 === 0 ? "md:grid-cols-3" : "sm:grid-cols-2";

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24"
      {...labelProps(has(s.heading), hid, s.ui.setMenus)}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <article className="relative overflow-hidden rounded-xs px-4 py-10 sm:px-8 sm:py-14 lg:px-12" style={paperSurface}>
          <Grain opacity={0.035} />
          <div className="relative">
            {(has(s.heading) || has(s.subheading)) && (
              <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
                {has(s.heading) && (
                  <h2
                    id={hid}
                    style={display}
                    className="text-[clamp(1.875rem,5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance"
                  >
                    {s.heading}
                  </h2>
                )}
                {has(s.subheading) && (
                  <p
                    className="mx-auto mt-4 max-w-[56ch] leading-relaxed"
                    style={{ color: "var(--em-paper-muted)" }}
                  >
                    {s.subheading}
                  </p>
                )}
              </header>
            )}

            {/* 1px hairline ayırıcılar: konteyner xətt rəngi, xanalar kağız. */}
            <ul
              className={`grid gap-px ${cols}`}
              style={{ background: "var(--em-paper-line)", border: "1px solid var(--em-paper-line)" }}
            >
              {items.map((it, i) => {
                const featured = it.featured === true;
                const feats = (it.features ?? []).filter((f) => has(f));
                return (
                  <li
                    key={i}
                    className="flex flex-col px-5 py-8 sm:px-7 sm:py-9"
                    style={
                      featured
                        ? { background: "var(--em-ink)", color: "var(--em-cream)" }
                        : { background: "var(--em-paper)" }
                    }
                  >
                    {/* Vurğu yalnız vizual qalmasın — etiket ekran oxuyucusuna da
                        çatır. Populyarlıq iddiası yoxdur, sadəcə neytral qeyd. */}
                    {featured && (
                      <p
                        className="mb-3 inline-flex self-start rounded-xs px-2 py-1 text-[0.625rem] font-semibold tracking-[0.2em] uppercase"
                        style={{ background: "var(--em-line)", color: "var(--em-cream)" }}
                      >
                        {s.ui.featured}
                      </p>
                    )}

                    {has(it.name) && (
                      <h3
                        className="text-[0.75rem] font-semibold tracking-[0.2em] break-words uppercase"
                        style={{ color: featured ? "var(--em-accent-soft)" : "var(--em-paper-muted)" }}
                      >
                        {it.name}
                      </h3>
                    )}

                    {has(it.price) && (
                      <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                        <span
                          style={displayLarge}
                          className="text-[clamp(1.875rem,4.5vw,2.75rem)] leading-none font-semibold tracking-[-0.02em] tabular-nums"
                        >
                          {it.price}
                        </span>
                        {has(it.unit) && (
                          <span
                            className="text-sm"
                            style={{ color: featured ? "var(--em-cream-dim)" : "var(--em-paper-muted)" }}
                          >
                            {it.unit}
                          </span>
                        )}
                      </p>
                    )}

                    {has(it.desc) && (
                      <p
                        className="mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed"
                        style={{ color: featured ? "var(--em-cream-dim)" : "var(--em-paper-muted)" }}
                      >
                        {it.desc}
                      </p>
                    )}

                    {feats.length > 0 && (
                      <ul className="mt-6 space-y-2.5">
                        {feats.map((f, j) => (
                          <li key={j} className="flex gap-2.5 text-[0.9375rem] leading-relaxed">
                            {/* Vurğulanan paketdə vurğu rəngi, digərində sakit ink. */}
                            <span
                              aria-hidden="true"
                              className="mt-[0.35em] shrink-0"
                              style={{ color: featured ? "var(--em-accent-soft)" : "var(--em-paper-muted)" }}
                            >
                              <Tick className="h-3.5 w-3.5" />
                            </span>
                            <span style={{ color: featured ? "var(--em-cream)" : "var(--em-paper-ink)" }}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {has(s.note) && (
              <p
                className="mt-8 text-center text-sm leading-relaxed italic"
                style={{ ...display, color: "var(--em-paper-muted)" }}
              >
                {s.note}
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

// ── Qonaq rəyləri — divara sancılmış kağız qırıntıları ─────────────────────
// İlk rəy iri "pull quote" kimi verilir: bölmə eyni ölçülü kartlar sırası
// olmaqdan çıxır və səhifəyə ritm gəlir.
function Testimonials(s: TestimonialsSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((it) => has(it?.quote));
  if (items.length === 0) return null;
  const hid = `ember-testimonials-${s.idx}`;

  return (
    <section
      className="py-16 sm:py-20 lg:py-28"
      style={{ background: "var(--em-ink-soft)" }}
      {...labelProps(has(s.heading), hid, s.ui.testimonials)}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead id={hid} heading={s.heading} subheading={s.subheading} />

        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {items.map((it, i) => {
            const lead = i === 0 && items.length > 2;
            return (
              <li key={i} className={`self-start ${lead ? "lg:col-span-2" : ""}`}>
                <figure
                  className="flex h-full flex-col rounded-xs px-6 py-7 sm:px-8 sm:py-9"
                  style={paperSurfaceSm}
                >
                  {typeof it.rating === "number" && (
                    <div className="mb-4" style={{ color: "var(--em-paper-ink)" }}>
                      <Stars rating={it.rating} label={s.ui.rating} />
                    </div>
                  )}

                  <blockquote
                    style={lead ? displayLarge : undefined}
                    className={
                      lead
                        ? "text-[clamp(1.25rem,2.6vw,1.875rem)] leading-[1.35] font-medium tracking-[-0.01em] text-balance"
                        : "text-[1.0625rem] leading-relaxed"
                    }
                  >
                    {it.quote}
                  </blockquote>

                  {has(it.author) && (
                    <figcaption className="mt-6 flex items-center gap-3">
                      {has(it.avatarUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.avatarUrl}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                          style={{ border: "1px solid var(--em-paper-line)" }}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{ ...display, background: "var(--em-paper-line)" }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold"
                        >
                          {it.author.trim().charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span style={display} className="block truncate text-[0.9375rem] font-semibold">
                          {it.author}
                        </span>
                        {has(it.role) && (
                          <span
                            className="block truncate text-[0.8125rem]"
                            style={{ color: "var(--em-paper-muted)" }}
                          >
                            {it.role}
                          </span>
                        )}
                      </span>
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ── FAQ — JS-siz, native <details>/<summary> ───────────────────────────────
function Faq(s: FaqSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((it) => has(it?.question) && has(it?.answer));
  if (items.length === 0) return null;
  const hid = `ember-faq-${s.idx}`;

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 lg:py-28"
      {...labelProps(has(s.heading), hid, s.ui.faq)}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <SectionHead id={hid} heading={s.heading} subheading={s.subheading} />

        <div>
          {items.map((it, i) => (
            <details
              key={i}
              className="group"
              style={{ borderTop: i === 0 ? "1px solid var(--em-line)" : "none", borderBottom: "1px solid var(--em-line)" }}
            >
              <summary
                className={`flex cursor-pointer list-none items-start justify-between gap-5 py-5 [&::-webkit-details-marker]:hidden ${FOCUS}`}
              >
                <span
                  style={display}
                  className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em] sm:text-lg"
                >
                  {it.question}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--em-accent-soft)" }}
                >
                  <path d="M3.5 6L8 10.5 12.5 6" />
                </svg>
              </summary>
              <p
                className="max-w-[68ch] pr-9 pb-6 leading-relaxed whitespace-pre-line"
                style={{ color: "var(--em-cream-dim)" }}
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

// ── Komanda — aşpazlar və zal ──────────────────────────────────────────────
function Team(s: TeamSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((m) => has(m?.name));
  if (items.length === 0) return null;
  const hid = `ember-team-${s.idx}`;

  return (
    <section
      className="py-16 sm:py-20 lg:py-28"
      {...labelProps(has(s.heading), hid, s.ui.team)}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead id={hid} heading={s.heading} subheading={s.subheading} />

        <ul className="grid gap-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
          {items.map((m, i) => (
            <li key={i}>
              {has(m.imageUrl) ? (
                <div className="overflow-hidden rounded-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              ) : (
                // Şəkil yoxdursa şəbəkə dağılmır: eyni nisbətdə sakit lövhə.
                <div
                  aria-hidden="true"
                  className="flex aspect-[3/4] w-full items-center justify-center rounded-xs"
                  style={{ background: "var(--em-ink-soft)", border: "1px solid var(--em-line)" }}
                >
                  <span
                    style={{ ...displayLarge, color: "var(--em-line)" }}
                    className="text-6xl font-semibold"
                  >
                    {m.name.trim().charAt(0)}
                  </span>
                </div>
              )}

              <h3 style={display} className="mt-5 text-xl leading-snug font-semibold tracking-[-0.01em]">
                {m.name}
              </h3>
              {has(m.role) && (
                <p
                  className="mt-1.5 text-[0.7rem] font-medium tracking-[0.18em] uppercase"
                  style={{ color: "var(--em-accent-soft)" }}
                >
                  {m.role}
                </p>
              )}
              {has(m.bio) && (
                <p
                  className="mt-3 max-w-[44ch] text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--em-cream-dim)" }}
                >
                  {m.bio}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Proses — nömrələnmə dizayndan gəlir; ardıcıllıq özü məlumatdır ─────────
function Process(s: ProcessSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((st) => has(st?.title));
  if (items.length === 0) return null;
  const hid = `ember-process-${s.idx}`;
  const cols = items.length % 4 === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: "var(--em-ink-soft)" }}
      {...labelProps(has(s.heading), hid, s.ui.steps)}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHead id={hid} heading={s.heading} subheading={s.subheading} />

        <ol className={`grid gap-x-10 gap-y-10 ${cols}`}>
          {items.map((st, i) => (
            <li key={i}>
              <p
                style={{ ...displayLarge, color: "var(--em-accent-soft)" }}
                className="text-[2.5rem] leading-none font-semibold tabular-nums"
              >
                <span className="sr-only">{`${i + 1}. `}</span>
                <span aria-hidden="true">{i + 1}</span>
              </p>
              <div className="mt-4 pt-5" style={{ borderTop: "1px solid var(--em-line)" }}>
                <h3 style={display} className="text-lg leading-snug font-semibold tracking-[-0.01em]">
                  {st.title}
                </h3>
                {has(st.text) && (
                  <p
                    className="mt-2.5 max-w-[44ch] text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--em-cream-dim)" }}
                  >
                    {st.text}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Partnyorlar — sakit zolaq, şəkil yoxdursa ad mətn kimi ─────────────────
function Logos(s: LogosSection & { ui: EmberUi; idx: number }) {
  const items = (s.items ?? []).filter((l) => has(l?.name));
  if (items.length === 0) return null;
  const hid = `ember-logos-${s.idx}`;

  return (
    <section
      className="px-5 py-12 sm:px-6 sm:py-14"
      {...labelProps(has(s.heading), hid, s.ui.partners)}
    >
      <div
        className="mx-auto max-w-6xl py-8 sm:py-10"
        style={{ borderTop: "1px solid var(--em-line)", borderBottom: "1px solid var(--em-line)" }}
      >
        {has(s.heading) && (
          <h2
            id={hid}
            className="mb-8 text-center text-[0.7rem] font-medium tracking-[0.2em] uppercase"
            style={{ color: "var(--em-cream-dim)" }}
          >
            {s.heading}
          </h2>
        )}

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {items.map((l, i) => (
            <li key={i} className="flex items-center">
              {has(l.imageUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.imageUrl}
                  alt={l.name}
                  loading="lazy"
                  className="h-7 w-auto max-w-[9rem] object-contain opacity-75 sm:h-8"
                />
              ) : (
                <span
                  style={{ ...display, color: "var(--em-cream-dim)" }}
                  className="text-lg font-semibold tracking-[0.02em]"
                >
                  {l.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function SiteFooter({ name, content }: { name: string; content: SiteContent }) {
  const year = new Date().getFullYear();
  const socials = (content.footer?.socials ?? []).filter((x) => has(x?.label) && has(x?.href));

  return (
    <footer style={{ borderTop: "1px solid var(--em-line)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
        <div>
          <p style={display} className="text-lg font-semibold tracking-[-0.01em]">
            {name}
          </p>
          <p className="mt-1.5 text-sm" style={{ color: "var(--em-cream-dim)" }}>
            {content.footer?.text ?? `© ${year} ${name}`}
          </p>
        </div>

        {socials.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {socials.map((soc, i) => (
              <li key={i}>
                <a
                  href={soc.href}
                  className={`inline-flex min-h-11 items-center rounded-xs text-[0.75rem] font-medium tracking-[0.16em] uppercase transition-colors duration-200 motion-reduce:transition-none hover:text-[color:var(--em-cream)] ${FOCUS}`}
                  style={{ color: "var(--em-cream-dim)" }}
                >
                  {soc.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
