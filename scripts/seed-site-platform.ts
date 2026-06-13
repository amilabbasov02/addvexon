/**
 * Sayt platforması seed-i (v3): 3 siteTemplate + 3 demo, hər biri AZ/EN/RU.
 * - Distinct dizayn (care/bistro/corporate)
 * - Çoxsəhifəli (restoran/biznes) + BÖYÜDÜLMÜŞ ana səhifələr
 * - LocalizedBundle: { defaultLocale, locales: { az, en, ru } }
 * Builder pattern: struktur bir dəfə, mətnlər dil başına.
 *
 * Run: npx tsx scripts/seed-site-platform.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { siteTemplates, tenants, tenantContent, tenantIntegrations, users } from "../src/db/schema";
import type { SiteContent, SiteTheme, Locale } from "../src/lib/site-content";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { siteTemplates, tenants, tenantContent, tenantIntegrations, users } });
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const LANGS: Locale[] = ["az", "en", "ru"];

// ── Şəkillər (dildən asılı deyil) ──
const IMG = {
  klHero: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80",
  klAbout: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1000&q=80",
  rsHero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
  rsGal: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80","https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80","https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"],
  bzHero: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  bzAbout: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80",
  bzProj: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80","https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80","https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80","https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80","https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80"],
};

const THEME_KL: SiteTheme = { colors: { primary: "#0ea5e9", bg: "#ffffff", surface: "#f0f9ff", text: "#0f172a", muted: "#64748b" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };
const THEME_RS: SiteTheme = { colors: { primary: "#c9a45c", bg: "#17110d", surface: "#1f1813", text: "#f3ece1", muted: "#b8a98f" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };
const THEME_BZ: SiteTheme = { colors: { primary: "#4f46e5", bg: "#ffffff", surface: "#f8fafc", text: "#0b1220", muted: "#64748b" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };

// ════════ KLİNİKA (care) ════════
function klinika(t: any): SiteContent {
  return {
    design: "care", siteName: t.name,
    nav: [ { label: t.nServices, href: "#xidmetler" }, { label: t.nContact, href: "#elaqe" } ],
    pages: [ { slug: "", title: t.nHome, sections: [
      { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "#elaqe", imageUrl: IMG.klHero },
      { type: "stats", items: [ { value: "15+", label: t.st1 }, { value: "10 000+", label: t.st2 }, { value: "25", label: t.st3 }, { value: "6", label: t.st4 } ] },
      { type: "features", heading: t.fHead, subheading: t.fSub, items: [
        { icon: "stethoscope", title: t.s1t, text: t.s1d }, { icon: "cardiology", title: t.s2t, text: t.s2d },
        { icon: "dentistry", title: t.s3t, text: t.s3d }, { icon: "vaccines", title: t.s4t, text: t.s4d },
        { icon: "child_care", title: t.s5t, text: t.s5d }, { icon: "radiology", title: t.s6t, text: t.s6d },
      ] },
      { type: "about", heading: t.abH, body: t.abB, imageUrl: IMG.klAbout },
      { type: "cta", heading: t.ctaH, subheading: t.ctaSub, ctaText: t.ctaC, ctaUrl: "#elaqe" },
      { type: "contact", heading: t.cH, phone: "+994 12 555 00 00", email: "info@saglam-klinika.az", address: t.addr },
    ] } ],
    footer: { text: t.footer },
  };
}
const KL: Record<Locale, any> = {
  az: { name: "Sağlam Klinika", nHome: "Ana səhifə", nServices: "Xidmətlər", nContact: "Əlaqə",
    heroH: "Sağlamlığınız bizim prioritetimizdir", heroSub: "Müasir avadanlıq və təcrübəli həkim komandası ilə hər zaman yanınızdayıq. Onlayn növbə alın, gözləmədən qəbula gəlin.", heroCta: "Onlayn növbə al",
    st1: "il təcrübə", st2: "pasiyent", st3: "həkim", st4: "şöbə", fHead: "Xidmətlərimiz", fSub: "Geniş profilli tibbi xidmətlər bir məkanda",
    s1t: "Ümumi müayinə", s1d: "Tam diaqnostik müayinə və konsultasiya.", s2t: "Kardiologiya", s2d: "Ürək-damar sağlamlığının peşəkar idarəsi.", s3t: "Stomatologiya", s3d: "Müasir diş müalicəsi və profilaktika.",
    s4t: "Laboratoriya", s4d: "Sürətli və dəqiq analiz nəticələri.", s5t: "Pediatriya", s5d: "Uşaqlar üçün qayğılı tibbi yanaşma.", s6t: "Radiologiya", s6d: "USM, rentgen və müasir görüntüləmə.",
    abH: "15 ildən artıq təcrübə", abB: "Minlərlə pasiyentə xidmət göstərmişik. Komandamız daim inkişaf edən tibbi standartları izləyir, hər pasiyentə fərdi yanaşır.",
    ctaH: "Bu gün növbə alın", ctaSub: "Bir neçə klik ilə onlayn qeydiyyat — telefonsuz.", ctaC: "Qeydiyyatdan keç", cH: "Əlaqə", addr: "Bakı, Nəsimi rayonu, Səbail küçəsi 12", footer: "© Sağlam Klinika — bütün hüquqlar qorunur" },
  en: { name: "Saglam Clinic", nHome: "Home", nServices: "Services", nContact: "Contact",
    heroH: "Your health is our priority", heroSub: "Modern equipment and an experienced medical team — always by your side. Book online and skip the wait.", heroCta: "Book online",
    st1: "years of experience", st2: "patients", st3: "doctors", st4: "departments", fHead: "Our services", fSub: "Comprehensive medical care under one roof",
    s1t: "General checkup", s1d: "Full diagnostic examination and consultation.", s2t: "Cardiology", s2d: "Professional cardiovascular care.", s3t: "Dentistry", s3d: "Modern dental treatment and prevention.",
    s4t: "Laboratory", s4d: "Fast and accurate test results.", s5t: "Pediatrics", s5d: "Caring medical approach for children.", s6t: "Radiology", s6d: "Ultrasound, X-ray and modern imaging.",
    abH: "Over 15 years of experience", abB: "We have served thousands of patients. Our team follows the latest medical standards and treats every patient individually.",
    ctaH: "Book an appointment today", ctaSub: "Online registration in a few clicks — no phone needed.", ctaC: "Register", cH: "Contact", addr: "Baku, Nasimi district, Sabail str. 12", footer: "© Saglam Clinic — all rights reserved" },
  ru: { name: "Клиника Саглам", nHome: "Главная", nServices: "Услуги", nContact: "Контакт",
    heroH: "Ваше здоровье — наш приоритет", heroSub: "Современное оборудование и опытная команда врачей всегда рядом. Запишитесь онлайн и приходите без ожидания.", heroCta: "Записаться онлайн",
    st1: "лет опыта", st2: "пациентов", st3: "врачей", st4: "отделений", fHead: "Наши услуги", fSub: "Полный спектр медицинских услуг в одном месте",
    s1t: "Общий осмотр", s1d: "Полная диагностика и консультация.", s2t: "Кардиология", s2d: "Профессиональная забота о сердце.", s3t: "Стоматология", s3d: "Современное лечение и профилактика.",
    s4t: "Лаборатория", s4d: "Быстрые и точные результаты анализов.", s5t: "Педиатрия", s5d: "Заботливый подход к детям.", s6t: "Радиология", s6d: "УЗИ, рентген и современная визуализация.",
    abH: "Более 15 лет опыта", abB: "Мы обслужили тысячи пациентов. Наша команда следует современным медицинским стандартам и индивидуально подходит к каждому.",
    ctaH: "Запишитесь сегодня", ctaSub: "Онлайн-запись за пару кликов — без звонков.", ctaC: "Регистрация", cH: "Контакт", addr: "Баку, Насиминский р-н, ул. Сабаил 12", footer: "© Клиника Саглам — все права защищены" },
};

// ════════ RESTORAN (bistro, çoxsəhifəli, böyük ana səhifə) ════════
function restoran(t: any): SiteContent {
  return {
    design: "bistro", siteName: t.name,
    nav: [ { label: t.nHome, href: "/" }, { label: t.nMenu, href: "/menyu" }, { label: t.nGallery, href: "/qalereya" }, { label: t.nContact, href: "/elaqe" } ],
    pages: [
      { slug: "", title: t.nHome, sections: [
        { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "/elaqe", imageUrl: IMG.rsHero },
        { type: "features", heading: t.hHead, items: [ { icon: "eco", title: t.h1t, text: t.h1d }, { icon: "restaurant", title: t.h2t, text: t.h2d }, { icon: "favorite", title: t.h3t, text: t.h3d } ] },
        { type: "about", heading: t.abH, body: t.abB },
        { type: "gallery", heading: t.galH, items: IMG.rsGal.slice(0, 3).map((u: string) => ({ imageUrl: u })) },
        { type: "cta", heading: t.ctaH, ctaText: t.heroCta, ctaUrl: "/elaqe" },
      ] },
      { slug: "menyu", title: t.nMenu, sections: [ { type: "menu", heading: t.menuH, groups: [
        { name: t.gStart, items: [ { name: t.i1, desc: t.i1d, price: "8 ₼" }, { name: t.i2, price: "6 ₼" }, { name: t.i3, price: "5 ₼" } ] },
        { name: t.gMain, items: [ { name: t.i4, desc: t.i4d, price: "18 ₼" }, { name: t.i5, desc: t.i5d, price: "14 ₼" }, { name: t.i6, price: "11 ₼" } ] },
        { name: t.gSweet, items: [ { name: t.i7, price: "4 ₼" }, { name: t.i8, price: "3 ₼" } ] },
        { name: t.gDrink, items: [ { name: t.i9, price: "5 ₼" }, { name: t.i10, price: "4 ₼" } ] },
      ] } ] },
      { slug: "qalereya", title: t.nGallery, sections: [ { type: "gallery", heading: t.galH, items: IMG.rsGal.map((u: string) => ({ imageUrl: u })) } ] },
      { slug: "elaqe", title: t.nContact, sections: [ { type: "contact", heading: t.cH, phone: "+994 50 333 22 11", email: "salam@serq-metbexi.az", address: t.addr } ] },
    ],
    footer: { text: t.footer },
  };
}
const RS: Record<Locale, any> = {
  az: { name: "Şərq Mətbəxi", nHome: "Ana səhifə", nMenu: "Menyu", nGallery: "Qalereya", nContact: "Əlaqə",
    heroH: "Doğma dadlar, isti atmosfer", heroSub: "Ənənəvi Azərbaycan mətbəxi müasir təqdimatda — ailə və dostlarınızla unudulmaz axşamlar.", heroCta: "Masa rezerv et",
    hHead: "Niyə biz?", h1t: "Təzə məhsullar", h1d: "Hər gün bazardan təzə.", h2t: "Milli mətbəx", h2d: "Ənənəvi reseptlər.", h3t: "Rahat mühit", h3d: "Ailəvi, isti atmosfer.",
    abH: "Bizim hekayəmiz", abB: "2010-cu ildən bəri qonaqlarımıza ən yaxşı milli yeməkləri təqdim edirik. Hər yemək təzə məhsullardan, sevgi ilə hazırlanır.",
    galH: "Qalereya", ctaH: "Bu axşam bizə qonaq olun", menuH: "Menyumuz",
    gStart: "Başlanğıclar", gMain: "Əsas yeməklər", gSweet: "Şirniyyat", gDrink: "İçkilər",
    i1: "Düşbərə", i1d: "Ənənəvi xırda düşbərə", i2: "Kükü", i3: "Mərci şorbası", i4: "Quzu kababı", i4d: "Odda bişmiş quzu", i5: "Plov", i5d: "Şah plov, ət ilə", i6: "Dolma", i7: "Paxlava", i8: "Şəkərbura", i9: "Çay (çaynik)", i10: "Ev limonadı",
    cH: "Rezervasiya & Əlaqə", addr: "Bakı, Fəvvarələr meydanı yaxınlığı", footer: "© Şərq Mətbəxi — hər gün 11:00–24:00" },
  en: { name: "Sharg Cuisine", nHome: "Home", nMenu: "Menu", nGallery: "Gallery", nContact: "Contact",
    heroH: "Authentic flavors, warm atmosphere", heroSub: "Traditional Azerbaijani cuisine with a modern touch — unforgettable evenings with family and friends.", heroCta: "Reserve a table",
    hHead: "Why us?", h1t: "Fresh produce", h1d: "Fresh from the market daily.", h2t: "National cuisine", h2d: "Traditional recipes.", h3t: "Cozy setting", h3d: "Warm, family atmosphere.",
    abH: "Our story", abB: "Since 2010 we have served our guests the finest national dishes. Every dish is made from fresh produce, with love.",
    galH: "Gallery", ctaH: "Be our guest tonight", menuH: "Our menu",
    gStart: "Starters", gMain: "Main dishes", gSweet: "Desserts", gDrink: "Drinks",
    i1: "Dushbara", i1d: "Tiny traditional dumplings", i2: "Kuku", i3: "Lentil soup", i4: "Lamb kebab", i4d: "Flame-grilled lamb", i5: "Plov", i5d: "Shah plov with meat", i6: "Dolma", i7: "Baklava", i8: "Shakarbura", i9: "Tea (pot)", i10: "Homemade lemonade",
    cH: "Reservation & Contact", addr: "Baku, near Fountains Square", footer: "© Sharg Cuisine — daily 11:00–24:00" },
  ru: { name: "Кухня Востока", nHome: "Главная", nMenu: "Меню", nGallery: "Галерея", nContact: "Контакт",
    heroH: "Родные вкусы, тёплая атмосфера", heroSub: "Традиционная азербайджанская кухня в современной подаче — незабываемые вечера с семьёй и друзьями.", heroCta: "Забронировать стол",
    hHead: "Почему мы?", h1t: "Свежие продукты", h1d: "Каждый день с рынка.", h2t: "Национальная кухня", h2d: "Традиционные рецепты.", h3t: "Уютная атмосфера", h3d: "Тёплая, семейная обстановка.",
    abH: "Наша история", abB: "С 2010 года мы подаём гостям лучшие национальные блюда. Каждое блюдо готовится из свежих продуктов, с любовью.",
    galH: "Галерея", ctaH: "Будьте нашим гостем сегодня", menuH: "Наше меню",
    gStart: "Закуски", gMain: "Основные блюда", gSweet: "Десерты", gDrink: "Напитки",
    i1: "Дюшбара", i1d: "Маленькие пельмени", i2: "Кюкю", i3: "Чечевичный суп", i4: "Кебаб из ягнёнка", i4d: "На углях", i5: "Плов", i5d: "Шах-плов с мясом", i6: "Долма", i7: "Пахлава", i8: "Шакербура", i9: "Чай (чайник)", i10: "Домашний лимонад",
    cH: "Бронь и контакт", addr: "Баку, у Площади фонтанов", footer: "© Кухня Востока — ежедневно 11:00–24:00" },
};

// ════════ BİZNES (corporate, çoxsəhifəli, böyük ana səhifə) ════════
function biznes(t: any): SiteContent {
  const serv = [ { icon: "insights", title: t.sv1t, text: t.sv1d }, { icon: "code", title: t.sv2t, text: t.sv2d }, { icon: "campaign", title: t.sv3t, text: t.sv3d }, { icon: "design_services", title: t.sv4t, text: t.sv4d }, { icon: "cloud", title: t.sv5t, text: t.sv5d }, { icon: "support_agent", title: t.sv6t, text: t.sv6d } ];
  return {
    design: "corporate", siteName: t.name,
    nav: [ { label: t.nHome, href: "/" }, { label: t.nServices, href: "/xidmetler" }, { label: t.nProjects, href: "/layiheler" }, { label: t.nContact, href: "/elaqe" } ],
    pages: [
      { slug: "", title: t.nHome, sections: [
        { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "/elaqe", imageUrl: IMG.bzHero },
        { type: "stats", items: [ { value: "200+", label: t.st1 }, { value: "12", label: t.st2 }, { value: "45", label: t.st3 }, { value: "98%", label: t.st4 } ] },
        { type: "features", heading: t.fHead, subheading: t.fSub, items: serv.slice(0, 3) },
        { type: "about", heading: t.abH, body: t.abB, imageUrl: IMG.bzAbout },
        { type: "cta", heading: t.ctaH, ctaText: t.heroCta, ctaUrl: "/elaqe" },
      ] },
      { slug: "xidmetler", title: t.nServices, sections: [
        { type: "features", heading: t.servHead, subheading: t.servSub, items: serv },
        { type: "about", heading: t.abH, body: t.abB, imageUrl: IMG.bzAbout },
      ] },
      { slug: "layiheler", title: t.nProjects, sections: [ { type: "gallery", heading: t.projHead, items: IMG.bzProj.map((u: string, i: number) => ({ imageUrl: u, caption: t.proj[i] })) } ] },
      { slug: "elaqe", title: t.nContact, sections: [ { type: "contact", heading: t.cH, phone: "+994 12 444 55 66", email: "info@vega.az", address: t.addr } ] },
    ],
    footer: { text: t.footer },
  };
}
const BZ: Record<Locale, any> = {
  az: { name: "Vega Solutions", nHome: "Ana səhifə", nServices: "Xidmətlər", nProjects: "Layihələr", nContact: "Əlaqə",
    heroH: "Biznesinizi növbəti səviyyəyə qaldırırıq", heroSub: "Konsaltinq, rəqəmsal transformasiya və proqram həlləri. 200-dən çox şirkətə etibarlı tərəfdaş olmuşuq.", heroCta: "Bizimlə əlaqə",
    st1: "müştəri", st2: "il bazarda", st3: "mütəxəssis", st4: "məmnunluq", fHead: "Nə təklif edirik", fSub: "Uçtan-uca biznes həlləri",
    sv1t: "Biznes konsaltinq", sv1d: "Strateji planlaşdırma və optimallaşdırma.", sv2t: "Proqram təminatı", sv2d: "Veb, mobil və korporativ həllər.", sv3t: "Marketinq", sv3d: "Rəqəmsal marketinq və brendinq.",
    sv4t: "UX/UI dizayn", sv4d: "İstifadəçi yönümlü interfeys.", sv5t: "Cloud həllər", sv5d: "İnfrastruktur miqrasiyası.", sv6t: "7/24 dəstək", sv6d: "Daimi texniki müşayiət.",
    abH: "Niyə Vega Solutions?", abB: "Təcrübəli komanda, sübut olunmuş metodologiya və nəticəyönümlü yanaşma. Biznesinizin böyüməsi bizim uğurumuzdur.",
    ctaH: "Layihənizi danışaq", servHead: "Xidmətlərimiz", servSub: "Hər ehtiyaca uyğun peşəkar həllər", projHead: "Son layihələrimiz",
    proj: ["Analitika platforması", "Komanda portalı", "Korporativ sayt", "Fintex tətbiqi", "ERP sistemi", "E-ticarət"], cH: "Bizimlə əlaqə", addr: "Bakı, Port Baku Towers, 14-cü mərtəbə", footer: "© Vega Solutions MMC" },
  en: { name: "Vega Solutions", nHome: "Home", nServices: "Services", nProjects: "Projects", nContact: "Contact",
    heroH: "We take your business to the next level", heroSub: "Consulting, digital transformation and software solutions. Trusted partner to 200+ companies.", heroCta: "Contact us",
    st1: "clients", st2: "years in market", st3: "specialists", st4: "satisfaction", fHead: "What we offer", fSub: "End-to-end business solutions",
    sv1t: "Business consulting", sv1d: "Strategic planning and optimization.", sv2t: "Software", sv2d: "Web, mobile and enterprise solutions.", sv3t: "Marketing", sv3d: "Digital marketing and branding.",
    sv4t: "UX/UI design", sv4d: "User-focused interfaces.", sv5t: "Cloud solutions", sv5d: "Infrastructure migration.", sv6t: "24/7 support", sv6d: "Continuous technical support.",
    abH: "Why Vega Solutions?", abB: "An experienced team, proven methodology and a results-driven approach. Your growth is our success.",
    ctaH: "Let's discuss your project", servHead: "Our services", servSub: "Professional solutions for every need", projHead: "Our recent projects",
    proj: ["Analytics platform", "Team portal", "Corporate site", "Fintech app", "ERP system", "E-commerce"], cH: "Contact us", addr: "Baku, Port Baku Towers, 14th floor", footer: "© Vega Solutions LLC" },
  ru: { name: "Vega Solutions", nHome: "Главная", nServices: "Услуги", nProjects: "Проекты", nContact: "Контакт",
    heroH: "Выводим ваш бизнес на новый уровень", heroSub: "Консалтинг, цифровая трансформация и программные решения. Надёжный партнёр для 200+ компаний.", heroCta: "Связаться с нами",
    st1: "клиентов", st2: "лет на рынке", st3: "специалистов", st4: "довольных", fHead: "Что мы предлагаем", fSub: "Комплексные бизнес-решения",
    sv1t: "Бизнес-консалтинг", sv1d: "Стратегическое планирование и оптимизация.", sv2t: "ПО", sv2d: "Веб, мобильные и корпоративные решения.", sv3t: "Маркетинг", sv3d: "Цифровой маркетинг и брендинг.",
    sv4t: "UX/UI дизайн", sv4d: "Интерфейсы для пользователя.", sv5t: "Облачные решения", sv5d: "Миграция инфраструктуры.", sv6t: "Поддержка 24/7", sv6d: "Постоянное техническое сопровождение.",
    abH: "Почему Vega Solutions?", abB: "Опытная команда, проверенная методология и ориентация на результат. Ваш рост — наш успех.",
    ctaH: "Обсудим ваш проект", servHead: "Наши услуги", servSub: "Профессиональные решения для любых задач", projHead: "Наши недавние проекты",
    proj: ["Платформа аналитики", "Портал для команды", "Корпоративный сайт", "Финтех-приложение", "ERP-система", "E-commerce"], cH: "Связаться с нами", addr: "Баку, Port Baku Towers, 14 этаж", footer: "© Vega Solutions ООО" },
};

function bundle(builder: (t: any) => SiteContent, strings: Record<Locale, any>) {
  return { defaultLocale: "az" as Locale, locales: { az: builder(strings.az), en: builder(strings.en), ru: builder(strings.ru) } };
}

const CATALOG = [
  { slug: "klinika-landing", name: "Klinika — Landing", type: "landing", category: "Səhiyyə", tagline: "Tibb klinikaları üçün etibarlı tək səhifəli sayt", description: "Statistika, xidmətlər, həkim komandası və onlayn qeydiyyat. AZ/EN/RU dilli.", thumbnailUrl: "/templates/klinika-landing.png", previewSubdomain: "demo", priceSetupAzn: 10000, priceMonthlyAzn: 5000, priceExportAzn: 100000, sortOrder: 1 },
  { slug: "restoran-multipage", name: "Restoran — Çoxsəhifəli", type: "multipage", category: "Restoran", tagline: "Menyu, qalereya və rezervasiya — elegant tünd dizayn", description: "Full-bleed hero, serif başlıqlar, ayrıca menyu/qalereya səhifələri. AZ/EN/RU dilli.", thumbnailUrl: "/templates/restoran-multipage.png", previewSubdomain: "demo-restoran", priceSetupAzn: 15000, priceMonthlyAzn: 6000, priceExportAzn: 120000, sortOrder: 2 },
  { slug: "biznes-multipage", name: "Biznes — Korporativ", type: "multipage", category: "Korporativ", tagline: "Cəsarətli korporativ sayt — xidmətlər və layihələr", description: "Böyük tipoqrafiya, statistika zolağı, ayrıca səhifələr. AZ/EN/RU dilli.", thumbnailUrl: "/templates/biznes-multipage.png", previewSubdomain: "demo-biznes", priceSetupAzn: 15000, priceMonthlyAzn: 6000, priceExportAzn: 120000, sortOrder: 3 },
] as const;

const DEMOS = [
  { slug: "klinika-landing", subdomain: "demo", name: "Sağlam Klinika", content: bundle(klinika, KL), theme: THEME_KL },
  { slug: "restoran-multipage", subdomain: "demo-restoran", name: "Şərq Mətbəxi", content: bundle(restoran, RS), theme: THEME_RS },
  { slug: "biznes-multipage", subdomain: "demo-biznes", name: "Vega Solutions", content: bundle(biznes, BZ), theme: THEME_BZ },
];

async function main() {
  const idBySlug = new Map<string, string>();
  for (const c of CATALOG) {
    const ex = (await db.select({ id: siteTemplates.id }).from(siteTemplates).where(eq(siteTemplates.slug, c.slug)).limit(1))[0];
    const v = { name: c.name, type: c.type, category: c.category, tagline: c.tagline, description: c.description, thumbnailUrl: c.thumbnailUrl, previewSubdomain: c.previewSubdomain, priceSetupAzn: c.priceSetupAzn, priceMonthlyAzn: c.priceMonthlyAzn, priceExportAzn: c.priceExportAzn, sortOrder: c.sortOrder };
    if (ex) { await db.update(siteTemplates).set(v).where(eq(siteTemplates.id, ex.id)); idBySlug.set(c.slug, ex.id); console.log("↻", c.slug); }
    else { const id = uid("tpl"); await db.insert(siteTemplates).values({ id, slug: c.slug, supportsExport: true, published: true, ...v }); idBySlug.set(c.slug, id); console.log("✓", c.slug); }
  }

  const adminEmail = (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim().toLowerCase();
  let owner = adminEmail ? (await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1))[0] : undefined;
  if (!owner) owner = (await db.select({ id: users.id }).from(users).limit(1))[0];
  if (!owner) { console.log("⚠ user yox"); await pool.end(); return; }

  for (const d of DEMOS) {
    const ex = (await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.subdomain, d.subdomain)).limit(1))[0];
    if (ex) { await db.update(tenantContent).set({ content: d.content as any, theme: d.theme }).where(eq(tenantContent.tenantId, ex.id)); console.log("↻ demo", d.subdomain); }
    else {
      const tid = uid("tnt");
      await db.insert(tenants).values({ id: tid, ownerId: owner.id, siteTemplateId: idBySlug.get(d.slug)!, name: d.name, subdomain: d.subdomain, status: "active", deliveryType: "hosted" });
      await db.insert(tenantContent).values({ tenantId: tid, content: d.content as any, theme: d.theme });
      await db.insert(tenantIntegrations).values({ tenantId: tid });
      console.log("✓ demo", d.subdomain);
    }
  }
  console.log("\nDemolar (AZ/EN/RU): demo / demo-restoran / demo-biznes .localhost:3000");
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
