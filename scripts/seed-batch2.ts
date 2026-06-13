/**
 * 2-ci partiya seed: retail (Mağaza) / bloom (Gözəllik) / studio (Agentlik).
 * Hər biri trilingual (AZ/EN/RU). Run: npx tsx scripts/seed-batch2.ts
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

const PIMG = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80","https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80","https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80","https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80","https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80","https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80"];
const BIMG = ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80","https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80","https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80","https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80","https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80","https://images.unsplash.com/photo-1503236823255-94609f598e71?w=600&q=80"];
const SIMG = ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80","https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80","https://images.unsplash.com/photo-1545235617-9465d2a55698?w=900&q=80","https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&q=80"];

function retail(t: any): SiteContent {
  const prices = ["49 ₼","89 ₼","129 ₼","59 ₼","199 ₼","75 ₼","149 ₼","39 ₼"];
  const names = [t.p1,t.p2,t.p3,t.p4,t.p5,t.p6,t.p7,t.p8];
  return { design: "retail", siteName: t.name, nav: [{ label: t.nProd, href: "#mehsullar" }, { label: t.nContact, href: "#elaqe" }], pages: [{ slug: "", title: t.nHome, sections: [
    { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "#mehsullar", imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80" },
    { type: "features", items: [{ icon: "local_shipping", title: t.f1t, text: t.f1d }, { icon: "verified_user", title: t.f2t, text: t.f2d }, { icon: "sync", title: t.f3t, text: t.f3d }] },
    { type: "products", heading: t.prodH, items: names.map((n: string, i: number) => ({ name: n, price: prices[i], imageUrl: PIMG[i], tag: i === 0 ? t.tagNew : i === 4 ? t.tagHot : undefined })) },
    { type: "cta", heading: t.ctaH, ctaText: t.heroCta, ctaUrl: "#mehsullar" },
    { type: "contact", heading: t.cH, phone: "+994 12 200 30 40", email: "info@modabutik.az", address: t.addr },
  ] }], footer: { text: t.footer } };
}
const RT: Record<Locale, any> = {
  az: { name: "Moda Butik", nHome: "Ana səhifə", nProd: "Məhsullar", nContact: "Əlaqə", heroH: "Yeni kolleksiya gəldi", heroSub: "Stil və keyfiyyət bir arada. Pulsuz çatdırılma 100 ₼-dən yuxarı.", heroCta: "İndi al", f1t: "Pulsuz çatdırılma", f1d: "100 ₼-dən yuxarı", f2t: "Zəmanət", f2d: "Orijinal məhsul", f3t: "Geri qaytarma", f3d: "14 gün ərzində", prodH: "Populyar məhsullar", tagNew: "YENİ", tagHot: "HİT", p1: "Klassik köynək", p2: "Dəri çanta", p3: "Qış gödəkçəsi", p4: "İdman ayaqqabı", p5: "Qol saatı", p6: "Eynək", p7: "Trikotaj sviter", p8: "Kəmər", ctaH: "Endirimləri qaçırma!", cH: "Əlaqə", addr: "Bakı, 28 Mall", footer: "© Moda Butik" },
  en: { name: "Moda Butik", nHome: "Home", nProd: "Products", nContact: "Contact", heroH: "New collection is here", heroSub: "Style and quality together. Free delivery over 100 ₼.", heroCta: "Shop now", f1t: "Free delivery", f1d: "over 100 ₼", f2t: "Warranty", f2d: "Authentic goods", f3t: "Returns", f3d: "within 14 days", prodH: "Popular products", tagNew: "NEW", tagHot: "HOT", p1: "Classic shirt", p2: "Leather bag", p3: "Winter jacket", p4: "Sneakers", p5: "Wristwatch", p6: "Sunglasses", p7: "Knit sweater", p8: "Belt", ctaH: "Do not miss the sale!", cH: "Contact", addr: "Baku, 28 Mall", footer: "© Moda Butik" },
  ru: { name: "Moda Butik", nHome: "Главная", nProd: "Товары", nContact: "Контакт", heroH: "Новая коллекция уже здесь", heroSub: "Стиль и качество вместе. Бесплатная доставка от 100 ₼.", heroCta: "Купить", f1t: "Бесплатная доставка", f1d: "от 100 ₼", f2t: "Гарантия", f2d: "Оригинальный товар", f3t: "Возврат", f3d: "в течение 14 дней", prodH: "Популярные товары", tagNew: "НОВОЕ", tagHot: "ХИТ", p1: "Классическая рубашка", p2: "Кожаная сумка", p3: "Зимняя куртка", p4: "Кроссовки", p5: "Наручные часы", p6: "Очки", p7: "Вязаный свитер", p8: "Ремень", ctaH: "Не упустите скидки!", cH: "Контакт", addr: "Баку, 28 Mall", footer: "© Moda Butik" },
};

function bloom(t: any): SiteContent {
  return { design: "bloom", siteName: t.name, nav: [{ label: t.nServices, href: "#xidmetler" }, { label: t.nContact, href: "#elaqe" }], pages: [{ slug: "", title: t.nHome, sections: [
    { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "#elaqe", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80" },
    { type: "features", heading: t.servH, items: [{ icon: "content_cut", title: t.s1t, text: t.s1d }, { icon: "face_retouching_natural", title: t.s2t, text: t.s2d }, { icon: "spa", title: t.s3t, text: t.s3d }, { icon: "colorize", title: t.s4t, text: t.s4d }, { icon: "front_hand", title: t.s5t, text: t.s5d }, { icon: "self_improvement", title: t.s6t, text: t.s6d }] },
    { type: "gallery", heading: t.galH, items: BIMG.map((u) => ({ imageUrl: u })) },
    { type: "about", heading: t.abH, body: t.abB },
    { type: "contact", heading: t.cH, phone: "+994 55 700 80 90", email: "salam@glamour.az", address: t.addr },
  ] }], footer: { text: t.footer } };
}
const BL: Record<Locale, any> = {
  az: { name: "Glamour Studio", nHome: "Ana səhifə", nServices: "Xidmətlər", nContact: "Əlaqə", heroH: "Gözəlliyinizə qayğı", heroSub: "Peşəkar ustalar, müasir avadanlıq və rahat mühit. Özünüzə vaxt ayırın.", heroCta: "Qeydiyyat", servH: "Xidmətlərimiz", s1t: "Saç düzümü", s1d: "Kəsim, rəng, ştapel.", s2t: "Makiyaj", s2d: "Gündəlik və gəlin.", s3t: "Spa & qulluq", s3d: "Üz və bədən.", s4t: "Manikür", s4d: "Klassik və gel.", s5t: "Pedikür", s5d: "Tam qulluq.", s6t: "Kosmetologiya", s6d: "Müasir prosedurlar.", galH: "İşlərimizdən", abH: "Niyə biz?", abB: "10 ildən artıq təcrübə, sertifikatlı ustalar və yalnız keyfiyyətli məhsullar. Hər müştəriyə fərdi yanaşma.", cH: "Qeydiyyat & Əlaqə", addr: "Bakı, Nizami küç. 45", footer: "© Glamour Studio" },
  en: { name: "Glamour Studio", nHome: "Home", nServices: "Services", nContact: "Contact", heroH: "Care for your beauty", heroSub: "Professional masters, modern equipment and a cozy space. Take time for yourself.", heroCta: "Book now", servH: "Our services", s1t: "Hair styling", s1d: "Cut, color, treatment.", s2t: "Makeup", s2d: "Everyday and bridal.", s3t: "Spa & care", s3d: "Face and body.", s4t: "Manicure", s4d: "Classic and gel.", s5t: "Pedicure", s5d: "Full care.", s6t: "Cosmetology", s6d: "Modern procedures.", galH: "Our work", abH: "Why us?", abB: "Over 10 years of experience, certified masters and only quality products. An individual approach to every client.", cH: "Booking & Contact", addr: "Baku, Nizami str. 45", footer: "© Glamour Studio" },
  ru: { name: "Glamour Studio", nHome: "Главная", nServices: "Услуги", nContact: "Контакт", heroH: "Забота о вашей красоте", heroSub: "Профессиональные мастера, современное оборудование и уютная атмосфера. Найдите время для себя.", heroCta: "Запись", servH: "Наши услуги", s1t: "Прически", s1d: "Стрижка, цвет, уход.", s2t: "Макияж", s2d: "Дневной и свадебный.", s3t: "Спа и уход", s3d: "Лицо и тело.", s4t: "Маникюр", s4d: "Классика и гель.", s5t: "Педикюр", s5d: "Полный уход.", s6t: "Косметология", s6d: "Современные процедуры.", galH: "Наши работы", abH: "Почему мы?", abB: "Более 10 лет опыта, сертифицированные мастера и только качественные продукты. Индивидуальный подход к каждому.", cH: "Запись и контакт", addr: "Баку, ул. Низами 45", footer: "© Glamour Studio" },
};

function studio(t: any): SiteContent {
  return { design: "studio", siteName: t.name, nav: [{ label: t.nServices, href: "#xidmetler" }, { label: t.nWork, href: "#layiheler" }, { label: t.nContact, href: "#elaqe" }], pages: [{ slug: "", title: t.nHome, sections: [
    { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "#elaqe" },
    { type: "stats", items: [{ value: "120+", label: t.st1 }, { value: "8", label: t.st2 }, { value: "15", label: t.st3 }, { value: "30+", label: t.st4 }] },
    { type: "features", heading: t.servH, items: [{ title: t.s1t, text: t.s1d }, { title: t.s2t, text: t.s2d }, { title: t.s3t, text: t.s3d }, { title: t.s4t, text: t.s4d }] },
    { type: "gallery", heading: t.workH, items: SIMG.map((u, i) => ({ imageUrl: u, caption: [t.w1, t.w2, t.w3, t.w4][i] })) },
    { type: "contact", heading: t.cH, phone: "+994 51 900 10 20", email: "hello@pixelstudio.az", address: t.addr },
    { type: "cta", heading: t.ctaH, ctaText: t.heroCta, ctaUrl: "#elaqe" },
  ] }], footer: { text: t.footer } };
}
const ST: Record<Locale, any> = {
  az: { name: "Pixel Studio", nHome: "Ana", nServices: "Xidmətlər", nWork: "İşlər", nContact: "Əlaqə", heroH: "Brendinizi unudulmaz edirik", heroSub: "Kreativ agentlik", heroCta: "Layihə danışaq", st1: "layihə", st2: "il təcrübə", st3: "komanda", st4: "mükafat", servH: "Nə edirik", s1t: "Brendinq", s1d: "Logo, identika, brend kitabı.", s2t: "Veb dizayn", s2d: "Sayt və tətbiq dizaynı.", s3t: "Marketinq", s3d: "SMM və reklam kampaniyaları.", s4t: "Video", s4d: "Motion və prodakşn.", workH: "Seçilmiş işlər", w1: "Aurora rebrendinq", w2: "Nova app", w3: "Kanvas kampaniya", w4: "Flux veb", cH: "Layihə danışaq", addr: "Bakı, Sahil", ctaH: "Növbəti böyük ideya sizdə?", footer: "© Pixel Studio" },
  en: { name: "Pixel Studio", nHome: "Home", nServices: "Services", nWork: "Work", nContact: "Contact", heroH: "We make brands unforgettable", heroSub: "Creative agency", heroCta: "Let us talk", st1: "projects", st2: "years", st3: "team", st4: "awards", servH: "What we do", s1t: "Branding", s1d: "Logo, identity, brand book.", s2t: "Web design", s2d: "Website and app design.", s3t: "Marketing", s3d: "SMM and ad campaigns.", s4t: "Video", s4d: "Motion and production.", workH: "Selected work", w1: "Aurora rebrand", w2: "Nova app", w3: "Canvas campaign", w4: "Flux web", cH: "Let us talk", addr: "Baku, Sahil", ctaH: "Got the next big idea?", footer: "© Pixel Studio" },
  ru: { name: "Pixel Studio", nHome: "Главная", nServices: "Услуги", nWork: "Работы", nContact: "Контакт", heroH: "Делаем бренды незабываемыми", heroSub: "Креативное агентство", heroCta: "Обсудим проект", st1: "проектов", st2: "лет", st3: "команда", st4: "наград", servH: "Что мы делаем", s1t: "Брендинг", s1d: "Логотип, айдентика, брендбук.", s2t: "Веб-дизайн", s2d: "Дизайн сайтов и приложений.", s3t: "Маркетинг", s3d: "SMM и рекламные кампании.", s4t: "Видео", s4d: "Моушн и продакшн.", workH: "Избранные работы", w1: "Ребрендинг Aurora", w2: "Приложение Nova", w3: "Кампания Canvas", w4: "Веб Flux", cH: "Обсудим проект", addr: "Баку, Сахиль", ctaH: "Есть следующая большая идея?", footer: "© Pixel Studio" },
};

const THEME_RT: SiteTheme = { colors: { primary: "#ec4899", bg: "#ffffff", surface: "#fdf2f8", text: "#0f172a", muted: "#64748b" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };
const THEME_BL: SiteTheme = { colors: { primary: "#c0708a", bg: "#fffaf7", surface: "#fbeef0", text: "#4a3640", muted: "#9b8088" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };
const THEME_ST: SiteTheme = { colors: { primary: "#c4ff4d", bg: "#0d0d0f", surface: "#16161a", text: "#f4f4f5", muted: "#8a8a93" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };

const bundle = (b: (t: any) => SiteContent, s: Record<Locale, any>) => ({ defaultLocale: "az" as Locale, locales: { az: b(s.az), en: b(s.en), ru: b(s.ru) } });

const CATALOG = [
  { slug: "magaza-landing", name: "Mağaza — E-ticarət", type: "landing", category: "Mağaza", tagline: "Məhsul kataloqu ilə onlayn mağaza", description: "Məhsul grid-i, qiymət etiketləri, çatdırılma üstünlükləri. AZ/EN/RU.", thumbnailUrl: "/templates/magaza-landing.png", previewSubdomain: "demo-magaza", priceSetupAzn: 12000, priceMonthlyAzn: 5500, priceExportAzn: 110000, sortOrder: 4 },
  { slug: "salon-landing", name: "Gözəllik Salonu", type: "landing", category: "Gözəllik", tagline: "Salon/spa üçün zərif pastel dizayn", description: "Yumşaq pastel, xidmət kartları, qalereya. AZ/EN/RU.", thumbnailUrl: "/templates/salon-landing.png", previewSubdomain: "demo-salon", priceSetupAzn: 10000, priceMonthlyAzn: 5000, priceExportAzn: 100000, sortOrder: 5 },
  { slug: "studiya-landing", name: "Kreativ Agentlik", type: "landing", category: "Agentlik", tagline: "Tünd editorial portfolio dizaynı", description: "Nəhəng tipoqrafiya, layihə showcase, statistika. AZ/EN/RU.", thumbnailUrl: "/templates/studiya-landing.png", previewSubdomain: "demo-studiya", priceSetupAzn: 14000, priceMonthlyAzn: 6000, priceExportAzn: 120000, sortOrder: 6 },
];
const DEMOS = [
  { slug: "magaza-landing", subdomain: "demo-magaza", name: "Moda Butik", content: bundle(retail, RT), theme: THEME_RT },
  { slug: "salon-landing", subdomain: "demo-salon", name: "Glamour Studio", content: bundle(bloom, BL), theme: THEME_BL },
  { slug: "studiya-landing", subdomain: "demo-studiya", name: "Pixel Studio", content: bundle(studio, ST), theme: THEME_ST },
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
  for (const d of DEMOS) {
    const ex = (await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.subdomain, d.subdomain)).limit(1))[0];
    if (ex) { await db.update(tenantContent).set({ content: d.content as any, theme: d.theme }).where(eq(tenantContent.tenantId, ex.id)); console.log("↻ demo", d.subdomain); }
    else { const tid = uid("tnt"); await db.insert(tenants).values({ id: tid, ownerId: owner!.id, siteTemplateId: idBySlug.get(d.slug)!, name: d.name, subdomain: d.subdomain, status: "active", deliveryType: "hosted" }); await db.insert(tenantContent).values({ tenantId: tid, content: d.content as any, theme: d.theme }); await db.insert(tenantIntegrations).values({ tenantId: tid }); console.log("✓ demo", d.subdomain); }
  }
  console.log("\nYeni demolar: demo-magaza / demo-salon / demo-studiya .localhost:3000");
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
