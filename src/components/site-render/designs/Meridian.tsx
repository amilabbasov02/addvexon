/**
 * "meridian" dizaynı — klinika / diş / sağlamlıq.
 *
 * İdeya: dekorasiya yox, dəqiqlik. Səhifə boyu davam edən nazik şaquli xətt
 * ("meridian") məzmun sütununu işarələyir; xidmətlər kartlar şəbəkəsi deyil,
 * sürətlə göz gəzdirilən siyahı (dl) kimi verilir; statistika sakit dəlil
 * kimi oxunur. Böyük mətn ölçüləri — pasiyentlər çox vaxt yaşlı olur.
 * Sabit "zəng et / növbə al" paneli mobil ekranda həmişə əlçatandır.
 *
 * Foto haqqında: səhiyyədə etibarın bir hissəsi vizualdır — təmiz otaq, real
 * avadanlıq, həkimin üzü. Ona görə dizayn FOTO VAR fərziyyəsi ilə qurulur:
 * hero, komanda, xidmətlər, qalereya, haqqında və çağırış zolağı şəkil üçün
 * real yer ayırır. Foto yoxdursa hər bölmə sadələşir (monoqram, ikon, tünd
 * lövhə) — amma bu, ehtiyat variantdır, hədəf deyil.
 *
 * Uydurma qadağandır: demo saytlarda həkim portretləri boş qalır, çünki yad
 * adamın stok fotosunu adı çəkilən həkim kimi göstərmək saxtakarlıqdır.
 * Portret yerinə ad monoqramı verilir — bilərəkdən boşluq, sınıq şəkil yox.
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
  TestimonialsSection,
  FaqSection,
  TeamSection,
  PricingSection,
  ProcessSection,
  HoursSection,
  LogosSection,
} from "@/lib/site-content";

// ---------------------------------------------------------------- i18n

type Strings = {
  book: string;
  bookShort: string;
  call: string;
  phone: string;
  email: string;
  address: string;
  services: string;
  about: string;
  gallery: string;
  contact: string;
  numbers: string;
  nav: string;
  footerNav: string;
  skip: string;
  map: string;
  testimonials: string;
  faq: string;
  team: string;
  pricing: string;
  process: string;
  hours: string;
  logos: string;
  step: string;
  rating: string;
};

const UI: Record<Locale, Strings> = {
  az: {
    book: "Növbəyə yazılın",
    bookShort: "Növbə al",
    call: "Zəng et",
    phone: "Telefon",
    email: "E-poçt",
    address: "Ünvan",
    services: "Xidmətlər",
    about: "Klinika haqqında",
    gallery: "Klinikadan görüntülər",
    contact: "Əlaqə",
    numbers: "Rəqəmlərlə",
    nav: "Əsas naviqasiya",
    footerNav: "Alt naviqasiya",
    skip: "Əsas məzmuna keç",
    map: "Klinikanın xəritədəki yeri",
    testimonials: "Pasiyent rəyləri",
    faq: "Tez-tez verilən suallar",
    team: "Həkimlərimiz",
    pricing: "Qiymətlər",
    process: "Qəbul necə keçir",
    hours: "İş saatları",
    logos: "Tərəfdaşlar",
    step: "Addım",
    rating: "Reytinq",
  },
  en: {
    book: "Book an appointment",
    bookShort: "Book",
    call: "Call",
    phone: "Phone",
    email: "Email",
    address: "Address",
    services: "Services",
    about: "About the clinic",
    gallery: "Inside the clinic",
    contact: "Contact",
    numbers: "In numbers",
    nav: "Main navigation",
    footerNav: "Footer navigation",
    skip: "Skip to main content",
    map: "Clinic location on the map",
    testimonials: "Patient reviews",
    faq: "Frequently asked questions",
    team: "Our doctors",
    pricing: "Prices",
    process: "How a visit works",
    hours: "Opening hours",
    logos: "Partners",
    step: "Step",
    rating: "Rating",
  },
  ru: {
    book: "Записаться на приём",
    bookShort: "Записаться",
    call: "Позвонить",
    phone: "Телефон",
    email: "Эл. почта",
    address: "Адрес",
    services: "Услуги",
    about: "О клинике",
    gallery: "Клиника изнутри",
    contact: "Контакты",
    numbers: "В цифрах",
    nav: "Основная навигация",
    footerNav: "Навигация в подвале",
    skip: "Перейти к содержимому",
    map: "Расположение клиники на карте",
    testimonials: "Отзывы пациентов",
    faq: "Частые вопросы",
    team: "Наши врачи",
    pricing: "Цены",
    process: "Как проходит приём",
    hours: "Часы работы",
    logos: "Партнёры",
    step: "Шаг",
    rating: "Рейтинг",
  },
};

// ---------------------------------------------------------------- tokens

/** Başlıq üzü — Meridian-ın kimliyi; tema başlığı ehtiyat variant kimi qalır. */
const display: React.CSSProperties = {
  fontFamily: "'Newsreader', var(--site-font-heading), Georgia, serif",
};

/** Nazik struktur xətləri — tema mətn rəngindən törəyir, ona görə hər temada işləyir. */
const HAIR = "color-mix(in srgb, var(--site-text) 14%, transparent)";
const HAIR_SOFT = "color-mix(in srgb, var(--site-text) 8%, transparent)";
const TINT = "color-mix(in srgb, var(--site-primary) 10%, transparent)";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-primary)]";
/** Hər tema rəngi üçün etibarlı hover qaralması — opacity oyunu deyil. */
const darken =
  "transition-shadow duration-200 ease-out hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.14)] motion-reduce:transition-none";

// ---------------------------------------------------------------- root

export function MeridianDesign({
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
  const siteName = content.siteName?.trim() || "Klinika";
  const sections = page.sections ?? [];

  // Sabit CTA üçün real məlumat — uydurma yoxdur, yalnız məzmunda olan.
  const contact = sections.find((s): s is ContactSection => s.type === "contact");
  const hero = sections.find((s): s is HeroSection => s.type === "hero");
  const phone = contact?.phone?.trim() || undefined;
  const bookHref = hero?.ctaUrl?.trim() || (contact ? "#elaqe" : undefined);
  const hasBar = Boolean(phone || bookHref);

  return (
    <div
      className="overflow-x-clip selection:bg-[color-mix(in_srgb,var(--site-primary)_20%,transparent)]"
      style={{
        background: "var(--site-bg)",
        color: "var(--site-text)",
        fontFamily: "var(--site-font-body)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
      />

      <a
        href="#main"
        className={`sr-only rounded-md px-4 py-3 text-base font-semibold text-[var(--site-on-primary)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] ${focus}`}
        style={{ background: "var(--site-primary)" }}
      >
        {ui.skip}
      </a>

      <Header siteName={siteName} logoUrl={theme.logoUrl} content={content} ui={ui} phone={phone} bookHref={bookHref} />
      <MobileNav content={content} ui={ui} />

      <main id="main" className={hasBar ? "pb-24 md:pb-0" : undefined}>
        {sections.map((s, i) => (
          <SectionView key={i} section={s} ui={ui} bookHref={bookHref} />
        ))}
      </main>

      <Footer siteName={siteName} content={content} ui={ui} />
      {hasBar && <ActionBar ui={ui} phone={phone} bookHref={bookHref} />}
    </div>
  );
}

// ---------------------------------------------------------------- chrome

function Header({
  siteName,
  logoUrl,
  content,
  ui,
  phone,
  bookHref,
}: {
  siteName: string;
  logoUrl?: string;
  content: SiteContent;
  ui: Strings;
  phone?: string;
  bookHref?: string;
}) {
  const nav = content.nav ?? [];
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        borderColor: HAIR,
        background: "color-mix(in srgb, var(--site-bg) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-8">
        <a href="/" className={`mr-auto flex min-w-0 items-center gap-2.5 rounded-md ${focus}`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-auto max-w-[10rem] object-contain" />
          ) : (
            <>
              <span aria-hidden="true" className="h-7 w-1 shrink-0 rounded-full" style={{ background: "var(--site-primary)" }} />
              <span style={display} className="truncate text-xl font-semibold tracking-tight sm:text-[1.35rem]">
                {siteName}
              </span>
            </>
          )}
        </a>

        <nav aria-label={ui.nav} className="hidden items-center gap-7 md:flex">
          {nav.map((n, i) => (
            <a
              key={i}
              href={n.href}
              className={`rounded-md text-[15px] font-medium transition-colors duration-200 ease-out hover:text-[var(--site-primary)] motion-reduce:transition-none ${focus}`}
              style={{ color: "var(--site-text)" }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:ml-6">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className={`hidden items-center gap-2 rounded-md border px-4 py-2.5 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none lg:inline-flex ${focus}`}
              style={{ borderColor: HAIR, color: "var(--site-text)" }}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">call</span>
              <span className="tabular-nums">{phone}</span>
            </a>
          )}
          {bookHref && (
            <a
              href={bookHref}
              className={`hidden rounded-md px-5 py-2.5 text-[15px] font-semibold text-[var(--site-on-primary)] md:inline-flex ${darken} ${focus}`}
              style={{ background: "var(--site-primary)" }}
            >
              {ui.bookShort}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNav({ content, ui }: { content: SiteContent; ui: Strings }) {
  const nav = content.nav ?? [];
  if (nav.length === 0) return null;
  return (
    <nav aria-label={ui.nav} className="border-b md:hidden" style={{ borderColor: HAIR_SOFT }}>
      <ul className="flex gap-1 overflow-x-auto px-3 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none]">
        {nav.map((n, i) => (
          <li key={i}>
            <a
              href={n.href}
              className={`block whitespace-nowrap rounded-md px-3 py-3 text-[15px] font-medium transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none ${focus}`}
              style={{ color: "var(--site-text)" }}
            >
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ActionBar({ ui, phone, bookHref }: { ui: Strings; phone?: string; bookHref?: string }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
      style={{
        borderColor: HAIR,
        background: "color-mix(in srgb, var(--site-bg) 92%, transparent)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex gap-2.5 px-4 py-3">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className={`flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-md border text-base font-semibold transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none ${focus}`}
            style={{ borderColor: HAIR, color: "var(--site-text)" }}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[21px]">call</span>
            {ui.call}
          </a>
        )}
        {bookHref && (
          <a
            href={bookHref}
            className={`flex min-h-[3rem] flex-1 items-center justify-center rounded-md text-base font-semibold text-[var(--site-on-primary)] ${darken} ${focus}`}
            style={{ background: "var(--site-primary)" }}
          >
            {ui.bookShort}
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- shell

/**
 * Meridian: lg-dən yuxarı məzmun sütununun solunda nazik şaquli xətt və onun
 * başında qısa vurğu ştrixi. Struktur elementdir — başlıq üstü etiket deyil.
 */
function Shell({
  id,
  tone = "bg",
  label,
  children,
}: {
  id?: string;
  tone?: "bg" | "surface";
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className="py-16 md:py-24"
      style={tone === "surface" ? { background: "var(--site-surface)" } : undefined}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)]">
          <div aria-hidden="true" className="relative hidden lg:block">
            <span className="absolute inset-y-0 left-0 w-px" style={{ background: HAIR }} />
            <span className="absolute left-0 top-0 h-10 w-0.5" style={{ background: "var(--site-primary)" }} />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={display} className="text-balance text-[2rem] leading-[1.15] font-semibold tracking-tight sm:text-[2.5rem]">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------- dispatch

function SectionView({ section, ui, bookHref }: { section: Section; ui: Strings; bookHref?: string }) {
  switch (section.type) {
    case "hero":
      return <Hero {...(section as HeroSection)} ui={ui} />;
    case "stats":
      return <Stats {...(section as StatsSection)} ui={ui} />;
    case "features":
      return <Services {...(section as FeaturesSection)} ui={ui} bookHref={bookHref} />;
    case "about":
      return <About {...(section as AboutSection)} ui={ui} />;
    case "gallery":
      return <Gallery {...(section as GallerySection)} ui={ui} />;
    case "contact":
      return <Contact {...(section as ContactSection)} ui={ui} />;
    case "cta":
      return <Cta {...(section as CtaSection)} />;
    case "team":
      return <Team {...(section as TeamSection)} ui={ui} />;
    case "process":
      return <Process {...(section as ProcessSection)} ui={ui} />;
    case "pricing":
      return <Pricing {...(section as PricingSection)} ui={ui} bookHref={bookHref} />;
    case "testimonials":
      return <Testimonials {...(section as TestimonialsSection)} ui={ui} />;
    case "faq":
      return <Faq {...(section as FaqSection)} ui={ui} />;
    case "hours":
      return <Hours {...(section as HoursSection)} ui={ui} />;
    case "logos":
      return <Logos {...(section as LogosSection)} ui={ui} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------- hero

/**
 * Foto varsa mətn sütunu 5/12-yə yığılır, foto 7/12 tutur və lg-dən yuxarı
 * ekranın sağ kənarına qədər daşır — səhifə ilk ekranda sənəd yox, klinika
 * kimi görünür. `min(0px, …)` sayəsində konteyner enindən kiçik ekranlarda
 * daşma sıfırlanır; kök element onsuz da `overflow-x-clip`-dir.
 */
const BLEED_RIGHT = "lg:mr-[min(0px,calc(-2rem_-_(100vw_-_72rem)/2))]";

function Hero(s: HeroSection & { ui: Strings }) {
  const heading = s.heading?.trim();
  if (!heading) return null;
  const img = s.imageUrl?.trim();

  const text = (
    <>
      <h1
        style={display}
        className="text-balance text-[2.4rem] leading-[1.08] font-semibold tracking-tight sm:text-[3.1rem] lg:text-[3.4rem]"
      >
        {heading}
      </h1>

      {s.subheading && (
        <p className="mt-6 max-w-[38ch] text-pretty text-lg leading-relaxed sm:text-xl sm:leading-[1.65]">
          {s.subheading}
        </p>
      )}

      {s.ctaText && (
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={s.ctaUrl ?? "#elaqe"}
            className={`inline-flex min-h-[3.25rem] items-center gap-2 rounded-md px-7 text-base font-semibold text-[var(--site-on-primary)] ${darken} ${focus}`}
            style={{ background: "var(--site-primary)" }}
          >
            {s.ctaText}
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </a>
        </div>
      )}
    </>
  );

  if (!img) {
    // Ehtiyat variant: foto yoxdursa geniş mətn sütunu — sadə, amma bitmiş.
    return (
      <section className="border-b" style={{ borderColor: HAIR_SOFT }}>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20 lg:py-24">
          <div className="max-w-3xl">{text}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b" style={{ borderColor: HAIR_SOFT }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14 lg:py-0">
          <div className="min-w-0 lg:col-span-5 lg:py-24">{text}</div>

          <div className={`lg:col-span-7 ${BLEED_RIGHT}`}>
            <div
              className="overflow-hidden rounded-xl lg:rounded-r-none"
              style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={heading}
                className="aspect-4/3 w-full object-cover sm:aspect-16/9 lg:aspect-4/3 lg:min-h-[30rem]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- stats

function Stats(s: StatsSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.value);
  if (items.length === 0) return null;

  return (
    <section aria-label={s.ui.numbers} className="border-b" style={{ borderColor: HAIR_SOFT }}>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-10 lg:grid-cols-4">
          {items.map((it, i) => (
            // DOM sırası dl üçün düzgündür (dt → dd); vizual sıra `order` ilə tərsinə çevrilir.
            <div key={i} className="flex min-w-0 flex-col">
              <span aria-hidden="true" className="order-1 h-0.5 w-8" style={{ background: "var(--site-primary)" }} />
              {it.label && (
                <dt className="order-3 mt-2.5 text-[0.95rem] leading-snug break-words" style={{ color: "var(--site-muted)" }}>
                  {it.label}
                </dt>
              )}
              <dd
                style={display}
                className="order-2 mt-4 text-[2.1rem] leading-none font-semibold tabular-nums tracking-tight sm:text-[2.6rem]"
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

// ---------------------------------------------------------------- services

/**
 * Kart şəbəkəsi yox — sətir siyahısı. Narahat adam başlıqları sürətlə göz
 * gəzdirir, yalnız lazım olanın izahını oxuyur. Bu quruluş qalır; dəyişən
 * odur ki, şəkil olanda hər sətrin solunda real ölçüdə foto durur — siyahı
 * ritmi pozulmadan bölmə vizual olur.
 *
 * `<dl>` semantikası saxlanılır: şəkil `<dt>`-nin daxilindədir (dl-in birbaşa
 * övladı yalnız dt/dd ola bilər). Foto başlığın təkrarıdır, ona görə `alt=""`.
 */
function Services(s: FeaturesSection & { ui: Strings; bookHref?: string }) {
  const items = (s.items ?? []).filter((it) => it?.title);
  if (items.length === 0) return null;
  const heading = s.heading?.trim();
  const visual = items.some((it) => it.imageUrl?.trim());

  return (
    <Shell id="xidmetler" label={heading ? undefined : s.ui.services}>
      {heading && (
        <div className="mb-10 max-w-2xl md:mb-12">
          <Heading>{heading}</Heading>
          {s.subheading && <p className="mt-4 text-pretty text-lg leading-relaxed">{s.subheading}</p>}
        </div>
      )}

      <dl className="border-t" style={{ borderColor: HAIR }}>
        {items.map((it, i) => {
          const img = it.imageUrl?.trim();
          return (
            <div
              key={i}
              className={
                visual
                  ? "grid grid-cols-1 gap-x-8 gap-y-4 border-b px-3 py-6 transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:px-4 sm:py-7 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-10"
                  : "grid grid-cols-1 gap-x-8 gap-y-2 border-b px-3 py-6 transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:px-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
              }
              style={{ borderColor: HAIR }}
            >
              <dt className="min-w-0">
                {visual &&
                  (img ? (
                    <div className="mb-3.5 overflow-hidden rounded-lg" style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="aspect-4/3 w-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    // Bu xidmətin fotosu yoxdur: eyni ölçüdə sakit lövhə —
                    // sətir hündürlükləri sıçramasın, sınıq şəkil görünməsin.
                    <div
                      aria-hidden="true"
                      className="mb-3.5 flex aspect-4/3 w-full items-center justify-center rounded-lg"
                      style={{ background: TINT, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
                    >
                      {it.icon && (
                        <span
                          className="material-symbols-outlined text-[34px]"
                          style={{ color: "var(--site-primary)" }}
                        >
                          {it.icon}
                        </span>
                      )}
                    </div>
                  ))}

                <div className="flex min-w-0 items-start gap-3">
                  {it.icon && !visual && (
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{ background: TINT, color: "var(--site-primary)" }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{it.icon}</span>
                    </span>
                  )}
                  <h3 style={display} className="min-w-0 text-xl leading-snug font-semibold tracking-tight break-words">
                    {it.title}
                  </h3>
                </div>
              </dt>
              {it.text && (
                <dd className="min-w-0 text-[1.0625rem] leading-relaxed break-words sm:pt-0.5">{it.text}</dd>
              )}
            </div>
          );
        })}
      </dl>
    </Shell>
  );
}

// ---------------------------------------------------------------- about

function About(s: AboutSection & { ui: Strings }) {
  const heading = s.heading?.trim();
  const body = s.body?.trim();
  if (!heading && !body && !s.imageUrl) return null;

  return (
    <Shell tone="surface" label={heading ? undefined : s.ui.about}>
      <div
        className={
          s.imageUrl
            ? "grid items-center gap-10 lg:grid-cols-[1.15fr_minmax(0,1fr)] lg:gap-14"
            : "max-w-2xl"
        }
      >
        {s.imageUrl && (
          <div className="overflow-hidden rounded-xl" style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={heading ?? ""}
              className="aspect-4/3 w-full object-cover sm:aspect-16/10 lg:aspect-5/4"
              loading="lazy"
            />
          </div>
        )}
        <div className="min-w-0">
          {heading && <Heading>{heading}</Heading>}
          {body && (
            <p className={`${heading ? "mt-5" : ""} max-w-[62ch] text-pretty whitespace-pre-line text-lg leading-[1.7] break-words`}>
              {body}
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- gallery

/**
 * Otaqlar və avadanlıq insanı sakitləşdirir — ona görə qalereya kiçik xanalar
 * şəbəkəsi deyil: üç və daha çox şəkil olanda birincisi geniş zolaq kimi
 * verilir, qalanları onun altında düzülür.
 */
function GalleryFigure({
  imageUrl,
  caption,
  ratio,
}: {
  imageUrl: string;
  caption?: string;
  ratio: string;
}) {
  const text = caption?.trim();
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-xl" style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={text ?? ""} className={`${ratio} w-full object-cover`} loading="lazy" />
      </div>
      {text && (
        <figcaption className="mt-3 text-[0.95rem] leading-snug break-words" style={{ color: "var(--site-muted)" }}>
          {text}
        </figcaption>
      )}
    </figure>
  );
}

function Gallery(s: GallerySection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it): it is { imageUrl: string; caption?: string } =>
    Boolean(it?.imageUrl?.trim()),
  );
  if (items.length === 0) return null;
  const heading = s.heading?.trim();

  const lead = items.length >= 3 ? items[0] : undefined;
  const rest = lead ? items.slice(1) : items;

  return (
    <Shell label={heading ? undefined : s.ui.gallery}>
      {heading && (
        <div className="mb-10 max-w-2xl md:mb-12">
          <Heading>{heading}</Heading>
        </div>
      )}

      <ul className="grid gap-5 sm:gap-6">
        {lead && (
          <li className="min-w-0">
            <GalleryFigure
              imageUrl={lead.imageUrl}
              caption={lead.caption}
              ratio="aspect-4/3 sm:aspect-16/9 lg:aspect-21/9"
            />
          </li>
        )}
        <li className="min-w-0">
          <ul
            className={`grid gap-5 sm:gap-6 ${
              rest.length === 1 ? "" : rest.length === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {rest.map((it, i) => (
              <li key={i} className="min-w-0">
                <GalleryFigure imageUrl={it.imageUrl} caption={it.caption} ratio="aspect-4/3" />
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </Shell>
  );
}

// ---------------------------------------------------------------- contact

function Contact(s: ContactSection & { ui: Strings }) {
  const phone = s.phone?.trim();
  const email = s.email?.trim();
  const address = s.address?.trim();
  const map = s.mapUrl?.trim();
  if (!phone && !email && !address && !map) return null;

  const heading = s.heading?.trim() || s.ui.contact;

  return (
    <Shell id="elaqe" tone="surface">
      <div className={map ? "grid gap-10 lg:grid-cols-2 lg:gap-14" : "max-w-3xl"}>
        <div className="min-w-0">
          <Heading>{heading}</Heading>
          <dl className="mt-8 border-t" style={{ borderColor: HAIR }}>
            {phone && (
              <Row icon="call" label={s.ui.phone} value={phone} href={`tel:${phone.replace(/\s+/g, "")}`} numeric />
            )}
            {email && <Row icon="mail" label={s.ui.email} value={email} href={`mailto:${email}`} />}
            {address && <Row icon="location_on" label={s.ui.address} value={address} />}
          </dl>
        </div>

        {map && (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: HAIR }}>
            <iframe
              src={map}
              title={s.ui.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[20rem] w-full border-0 lg:h-full lg:min-h-[22rem]"
            />
          </div>
        )}
      </div>
    </Shell>
  );
}

function Row({
  icon,
  label,
  value,
  href,
  numeric,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  numeric?: boolean;
}) {
  const body = (
    <div className="flex min-w-0 items-start gap-3.5">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: TINT, color: "var(--site-primary)" }}
      >
        <span className="material-symbols-outlined text-[21px]">{icon}</span>
      </span>
      <div className="min-w-0">
        <dt className="text-[0.9rem] leading-tight" style={{ color: "var(--site-muted)" }}>
          {label}
        </dt>
        <dd className={`mt-1 text-lg leading-snug font-medium break-words ${numeric ? "tabular-nums" : ""}`}>
          {value}
        </dd>
      </div>
    </div>
  );

  return (
    <div className="border-b" style={{ borderColor: HAIR }}>
      {href ? (
        <a
          href={href}
          className={`block rounded-md px-3 py-5 transition-colors duration-200 ease-out hover:bg-[var(--site-bg)] motion-reduce:transition-none ${focus}`}
        >
          {body}
        </a>
      ) : (
        <div className="px-3 py-5">{body}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- cta

/**
 * Mürəkkəb rəngli zolaq — brend rəngindən asılı olmayan zəmanətli kontrast.
 * (Tema mətn rəngi onsuz da fon rəngi ilə kontrast təşkil etməlidir.)
 */
function Cta(s: CtaSection) {
  const heading = s.heading?.trim();
  if (!heading) return null;
  const img = s.imageUrl?.trim();

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl"
        style={{ background: "var(--site-text)" }}
      >
        <div className={img ? "grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}>
          <div className="px-6 py-14 sm:px-12 md:py-16">
            <div className="max-w-2xl">
              <span aria-hidden="true" className="block h-0.5 w-10" style={{ background: "var(--site-primary)" }} />
              <h2
                style={display}
                className="mt-6 text-balance text-[2rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-[2.6rem]"
              >
                {heading}
              </h2>
              {s.subheading && (
                <p className="mt-4 max-w-[46ch] text-pretty text-lg leading-relaxed text-white/85">{s.subheading}</p>
              )}
              {s.ctaText && (
                <a
                  href={s.ctaUrl ?? "#elaqe"}
                  className={`mt-8 inline-flex min-h-[3.25rem] items-center rounded-md bg-white px-7 text-base font-semibold transition-shadow duration-200 ease-out hover:shadow-[inset_0_0_0_999px_rgba(0,0,0,0.08)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                  style={{ color: "var(--site-text)" }}
                >
                  {s.ctaText}
                </a>
              )}
            </div>
          </div>

          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt=""
              className="aspect-16/10 h-full w-full object-cover lg:aspect-auto lg:min-h-[24rem]"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- shared head

/** Bölmə başlığı + izahı. Başlıq yoxdursa heç nə çıxmır (boş başlıq olmasın). */
function SectionHead({ heading, subheading }: { heading?: string; subheading?: string }) {
  const h = heading?.trim();
  const sub = subheading?.trim();
  if (!h) return null;
  return (
    <div className="mb-10 max-w-2xl md:mb-12">
      <Heading>{h}</Heading>
      {sub && <p className="mt-4 text-pretty text-lg leading-relaxed">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- team

/**
 * Ən dəyərli bölmə: pasiyent klinikanı həkimə görə seçir. Portret kiçik avatar
 * deyil — hər kartın yuxarısında tam enli, portret nisbətli (4:5) şəkildir və
 * mobil ekranda da belədir (iki sütun, yan-yana), yəni foto mətnin yanındakı
 * kiçicik damğa deyil, bölmənin özəyidir.
 *
 * Portret yoxdursa: eyni ölçüdə, eyni nisbətdə monoqram lövhəsi. Yad adamın
 * stok fotosunu adı çəkilən həkim kimi göstərmək saxtakarlıqdır — tibbi saytda
 * bu qəti qadağandır. Boşluq bilərəkdən dizayn edilir; klinika öz fotolarını
 * özü verir.
 */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return words.map((w) => Array.from(w)[0] ?? "").join("").toUpperCase();
}

function Team(s: TeamSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.name?.trim());
  if (items.length === 0) return null;
  const cols = items.length === 1 ? "max-w-sm" : "sm:grid-cols-2 lg:grid-cols-3";
  // Mobil: tam enli portret, amma 24rem-dən hündür deyil — beş həkimdə səhifə
  // sonsuz uzanmasın. sm-dən yuxarı məhdudiyyət qalxır, nisbət 4:5 qalır.
  const frame =
    "aspect-4/5 max-h-96 w-full overflow-hidden rounded-xl sm:max-h-none";

  return (
    <Shell id="komanda" label={s.heading?.trim() ? undefined : s.ui.team}>
      <SectionHead heading={s.heading} subheading={s.subheading} />
      <ul className={`grid gap-x-6 gap-y-10 sm:gap-x-7 sm:gap-y-12 ${cols}`}>
        {items.map((it, i) => (
          <li key={i} className="min-w-0">
            {it.imageUrl?.trim() ? (
              <div className={frame} style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className={`${frame} flex flex-col items-center justify-center gap-4`}
                style={{ background: TINT, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
              >
                <span
                  style={{ ...display, color: "var(--site-primary)" }}
                  className="text-[2.5rem] leading-none font-semibold tracking-tight"
                >
                  {initials(it.name)}
                </span>
                <span className="h-0.5 w-8" style={{ background: "var(--site-primary)" }} />
              </div>
            )}

            <div className="mt-4 min-w-0">
              <h3 style={display} className="text-xl leading-snug font-semibold tracking-tight break-words sm:text-[1.35rem]">
                {it.name}
              </h3>
              {it.role?.trim() && (
                <p className="mt-1 text-[1.0625rem] leading-snug break-words" style={{ color: "var(--site-primary)" }}>
                  {it.role}
                </p>
              )}
              {it.bio?.trim() && (
                <p className="mt-2.5 max-w-[46ch] text-[1.0625rem] leading-relaxed break-words">{it.bio}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

// ---------------------------------------------------------------- process

/**
 * "Qəbul necə keçir" — bilinməzlik qorxusunu aradan qaldırır. Nömrələr
 * dizayn tərəfindən verilir; şaquli xətt addımları bir-birinə bağlayır.
 */
function Process(s: ProcessSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.title?.trim());
  if (items.length === 0) return null;

  return (
    <Shell tone="surface" label={s.heading?.trim() ? undefined : s.ui.process}>
      <SectionHead heading={s.heading} subheading={s.subheading} />
      <ol className="max-w-2xl">
        {items.map((it, i) => (
          <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
            {i < items.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[1.375rem] top-12 bottom-0 w-px"
                style={{ background: HAIR }}
              />
            )}
            <span
              aria-hidden="true"
              style={{ ...display, background: TINT, color: "var(--site-primary)" }}
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-semibold tabular-nums"
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-1.5">
              <h3 style={display} className="text-xl leading-snug font-semibold tracking-tight break-words">
                <span className="sr-only">{`${s.ui.step} ${i + 1}: `}</span>
                {it.title}
              </h3>
              {it.text?.trim() && (
                <p className="mt-2 max-w-[54ch] text-[1.0625rem] leading-relaxed break-words">{it.text}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

// ---------------------------------------------------------------- pricing

/**
 * Qiymət paketləri müqayisə olunan paralel obyektlərdir — burada panel
 * düzülüşü doğru seçimdir. `featured` yalnız vizual olaraq fərqlənir:
 * "ən çox seçilən" kimi məzmunda olmayan iddia yazılmır.
 */
function Pricing(s: PricingSection & { ui: Strings; bookHref?: string }) {
  const items = (s.items ?? []).filter((it) => it?.name?.trim() && it?.price?.trim());
  if (items.length === 0) return null;
  const cols =
    items.length === 1
      ? "max-w-md"
      : items.length === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <Shell id="qiymetler" label={s.heading?.trim() ? undefined : s.ui.pricing}>
      <SectionHead heading={s.heading} subheading={s.subheading} />
      <ul className={`grid gap-6 ${cols}`}>
        {items.map((it, i) => (
          <li
            key={i}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl border"
            style={{
              borderColor: it.featured ? "var(--site-primary)" : HAIR,
              borderWidth: it.featured ? 2 : 1,
              background: "var(--site-bg)",
            }}
          >
            <span
              aria-hidden="true"
              className="block h-1"
              style={{ background: it.featured ? "var(--site-primary)" : "transparent" }}
            />
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <h3 style={display} className="text-xl leading-snug font-semibold tracking-tight break-words">
                {it.name}
              </h3>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                <span style={display} className="text-[2.1rem] leading-none font-semibold tabular-nums tracking-tight break-words">
                  {it.price}
                </span>
                {it.unit?.trim() && (
                  <span className="text-[1rem] leading-snug break-words" style={{ color: "var(--site-muted)" }}>
                    {it.unit}
                  </span>
                )}
              </p>

              {it.desc?.trim() && (
                <p className="mt-3.5 text-[1.0625rem] leading-relaxed break-words">{it.desc}</p>
              )}

              {(it.features ?? []).filter(Boolean).length > 0 && (
                <ul className="mt-5 space-y-2.5 border-t pt-5" style={{ borderColor: HAIR_SOFT }}>
                  {(it.features ?? []).filter(Boolean).map((f, j) => (
                    <li key={j} className="flex gap-2.5 text-[1.0625rem] leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined mt-0.5 shrink-0 text-[20px]"
                        style={{ color: "var(--site-primary)" }}
                      >
                        check
                      </span>
                      <span className="min-w-0 break-words">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {s.bookHref && <span aria-hidden="true" className="min-h-7 flex-1" />}

              {s.bookHref && (
                <a
                  href={s.bookHref}
                  className={
                    it.featured
                      ? `inline-flex min-h-[3rem] items-center justify-center rounded-md px-5 text-base font-semibold text-[var(--site-on-primary)] ${darken} ${focus}`
                      : `inline-flex min-h-[3rem] items-center justify-center rounded-md border px-5 text-base font-semibold transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none ${focus}`
                  }
                  style={
                    it.featured
                      ? { background: "var(--site-primary)" }
                      : { borderColor: HAIR, color: "var(--site-text)" }
                  }
                >
                  {s.ui.bookShort}
                  <span className="sr-only">{` — ${it.name}`}</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {s.note?.trim() && (
        <p className="mt-6 max-w-[62ch] text-[1rem] leading-relaxed break-words" style={{ color: "var(--site-muted)" }}>
          {s.note}
        </p>
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------- testimonials

function Stars({ rating, label }: { rating: number; label: string }) {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  if (n === 0) return null;
  return (
    <p className="mb-4 flex items-center gap-0.5">
      <span className="sr-only">{`${label}: ${n}/5`}</span>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="material-symbols-outlined text-[19px]"
          style={
            i < n
              ? { fontVariationSettings: "'FILL' 1", color: "var(--site-primary)" }
              : { fontVariationSettings: "'FILL' 0", color: "var(--site-muted)" }
          }
        >
          star
        </span>
      ))}
    </p>
  );
}

function Testimonials(s: TestimonialsSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.quote?.trim() && it?.author?.trim());
  if (items.length === 0) return null;
  const cols =
    items.length === 1
      ? "max-w-xl"
      : items.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <Shell tone="surface" label={s.heading?.trim() ? undefined : s.ui.testimonials}>
      <SectionHead heading={s.heading} subheading={s.subheading} />
      <ul className={`grid gap-6 ${cols}`}>
        {items.map((it, i) => (
          <li key={i} className="min-w-0">
            <figure
              className="flex h-full flex-col rounded-xl border p-6 sm:p-7"
              style={{ borderColor: HAIR, background: "var(--site-bg)" }}
            >
              {typeof it.rating === "number" && <Stars rating={it.rating} label={s.ui.rating} />}
              <blockquote
                style={display}
                className="flex-1 text-[1.1875rem] leading-[1.6] break-words"
              >
                {it.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t pt-5" style={{ borderColor: HAIR_SOFT }}>
                {it.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.avatarUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-[1.0625rem] font-semibold leading-snug break-words">{it.author}</span>
                  {it.role?.trim() && (
                    <span className="block text-[0.95rem] leading-snug break-words" style={{ color: "var(--site-muted)" }}>
                      {it.role}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

// ---------------------------------------------------------------- faq

// FAQPage JSON-LD SiteRenderer-dəki `buildFaqJsonLd` tərəfindən mərkəzi
// şəkildə verilir — məzmun modeli paylaşılan olduğu üçün bir yerdə saxlanılır.

function Faq(s: FaqSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.question?.trim() && it?.answer?.trim());
  if (items.length === 0) return null;

  return (
    <Shell label={s.heading?.trim() ? undefined : s.ui.faq}>
      <SectionHead heading={s.heading} subheading={s.subheading} />
      <div className="max-w-3xl border-t" style={{ borderColor: HAIR }}>
        {items.map((it, i) => (
          <details key={i} className="group border-b" style={{ borderColor: HAIR }}>
            <summary
              className={`flex cursor-pointer list-none items-start justify-between gap-4 rounded-md px-3 py-5 transition-colors duration-200 ease-out hover:bg-[var(--site-surface)] motion-reduce:transition-none [&::-webkit-details-marker]:hidden ${focus}`}
            >
              <h3 style={display} className="min-w-0 text-lg leading-snug font-semibold tracking-tight break-words sm:text-xl">
                {it.question}
              </h3>
              <span
                aria-hidden="true"
                className="material-symbols-outlined mt-0.5 shrink-0 text-[24px] transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
                style={{ color: "var(--site-primary)" }}
              >
                expand_more
              </span>
            </summary>
            <p className="max-w-[62ch] px-3 pb-6 text-[1.0625rem] leading-relaxed whitespace-pre-line break-words">
              {it.answer}
            </p>
          </details>
        ))}
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- hours

/** İnsanların zəng edib soruşduğu ilk sual. Sadə, dəqiq cədvəl. */
function Hours(s: HoursSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.days?.trim() && it?.hours?.trim());
  if (items.length === 0) return null;

  return (
    <Shell id="is-saatlari" tone="surface" label={s.heading?.trim() ? undefined : s.ui.hours}>
      <div className="max-w-xl">
        <Heading>{s.heading?.trim() || s.ui.hours}</Heading>
        <dl className="mt-8 border-t" style={{ borderColor: HAIR }}>
          {items.map((it, i) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-4"
              style={{ borderColor: HAIR }}
            >
              <dt className="min-w-0 text-[1.0625rem] leading-snug break-words">{it.days}</dt>
              <dd className="min-w-0 text-[1.0625rem] leading-snug font-semibold tabular-nums break-words">
                {it.hours}
              </dd>
            </div>
          ))}
        </dl>
        {s.note?.trim() && (
          <p className="mt-5 text-[1rem] leading-relaxed break-words" style={{ color: "var(--site-muted)" }}>
            {s.note}
          </p>
        )}
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- logos

function Logos(s: LogosSection & { ui: Strings }) {
  const items = (s.items ?? []).filter((it) => it?.name?.trim());
  if (items.length === 0) return null;
  const heading = s.heading?.trim();

  return (
    <section aria-label={heading ? undefined : s.ui.logos} className="border-y" style={{ borderColor: HAIR_SOFT }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {heading && (
          <h2 className="mb-8 text-[1rem] leading-snug" style={{ color: "var(--site-muted)" }}>
            {heading}
          </h2>
        )}
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-7">
          {items.map((it, i) => (
            <li key={i} className="min-w-0">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className="h-9 w-auto max-w-[9rem] object-contain sm:h-10"
                  loading="lazy"
                />
              ) : (
                <span style={display} className="text-lg font-semibold tracking-tight break-words sm:text-xl">
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

// ---------------------------------------------------------------- footer

function Footer({
  siteName,
  content,
  ui,
}: {
  siteName: string;
  content: SiteContent;
  ui: Strings;
}) {
  const year = new Date().getFullYear();
  const nav = content.nav ?? [];
  const socials = content.footer?.socials ?? [];

  return (
    <footer className="border-t" style={{ borderColor: HAIR, background: "var(--site-bg)" }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 max-w-sm">
            <span style={display} className="text-xl font-semibold tracking-tight break-words">
              {siteName}
            </span>
            {content.footer?.text && (
              <p className="mt-3 text-[1.0625rem] leading-relaxed break-words" style={{ color: "var(--site-muted)" }}>
                {content.footer.text}
              </p>
            )}
          </div>

          {(nav.length > 0 || socials.length > 0) && (
            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
              {nav.length > 0 && (
                <nav aria-label={ui.footerNav}>
                  <ul className="space-y-1">
                    {nav.map((n, i) => (
                      <li key={i}>
                        <a
                          href={n.href}
                          className={`-mx-2 block rounded-md px-2 py-1.5 text-[1.0625rem] transition-colors duration-200 ease-out hover:text-[var(--site-primary)] motion-reduce:transition-none ${focus}`}
                        >
                          {n.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {socials.length > 0 && (
                <ul className="space-y-1">
                  {socials.map((so, i) => (
                    <li key={i}>
                      <a
                        href={so.href}
                        className={`-mx-2 block rounded-md px-2 py-1.5 text-[1.0625rem] transition-colors duration-200 ease-out hover:text-[var(--site-primary)] motion-reduce:transition-none ${focus}`}
                      >
                        {so.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <p className="mt-12 border-t pt-6 text-[0.95rem]" style={{ borderColor: HAIR_SOFT, color: "var(--site-muted)" }}>
          © {year} {siteName}
        </p>
      </div>
    </footer>
  );
}
