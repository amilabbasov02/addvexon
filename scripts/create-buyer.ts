import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

async function run() {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const { eq } = await import("drizzle-orm");
  const { users, tenants, tenantContent, tenantIntegrations, siteTemplates } = await import("../src/db/schema");
  const { auth } = await import("../src/lib/auth");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { users, tenants, tenantContent, tenantIntegrations, siteTemplates } });
  const EMAIL = "musteri@addvoxen.com", PASSWORD = "musteri1234", NAME = "Müştəri Test", SUB = "menimsayt";
  const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36).slice(-4)}`;

  const HERO = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";
  const build = (t: any) => ({
    design: "care", siteName: t.name,
    nav: [ { label: t.nServices, href: "#xidmetler" }, { label: t.nContact, href: "#elaqe" } ],
    pages: [ { slug: "", title: t.nHome, sections: [
      { type: "hero", heading: t.heroH, subheading: t.heroSub, ctaText: t.heroCta, ctaUrl: "#elaqe", imageUrl: HERO },
      { type: "stats", items: [ { value: "5+", label: t.st1 }, { value: "500+", label: t.st2 }, { value: "24/7", label: t.st3 }, { value: "100%", label: t.st4 } ] },
      { type: "features", heading: t.fHead, items: [ { icon: "verified", title: t.s1t, text: t.s1d }, { icon: "schedule", title: t.s2t, text: t.s2d }, { icon: "support_agent", title: t.s3t, text: t.s3d } ] },
      { type: "contact", heading: t.cH, phone: "+994 50 000 00 00", email: "info@menimsayt.az", address: t.addr },
    ] } ],
    footer: { text: t.footer },
  });
  const S = {
    az: { name: "Mənim Biznesim", nHome: "Ana səhifə", nServices: "Xidmətlər", nContact: "Əlaqə", heroH: "Xoş gəlmisiniz!", heroSub: "Bu sizin saytınızdır — paneldən mətni, rəngləri, logonu və şəkilləri istədiyiniz kimi dəyişin.", heroCta: "Əlaqə saxla", st1: "il", st2: "müştəri", st3: "dəstək", st4: "keyfiyyət", fHead: "Xidmətlərimiz", s1t: "Keyfiyyət", s1d: "Yüksək standartlar.", s2t: "Sürət", s2d: "Vaxtında və etibarlı.", s3t: "Dəstək", s3d: "Hər zaman yanınızdayıq.", cH: "Əlaqə", addr: "Bakı", footer: "© Mənim Biznesim" },
    en: { name: "Mənim Biznesim", nHome: "Home", nServices: "Services", nContact: "Contact", heroH: "Welcome!", heroSub: "This is your website — change text, colors, logo and images from the panel.", heroCta: "Contact us", st1: "years", st2: "clients", st3: "support", st4: "quality", fHead: "Our services", s1t: "Quality", s1d: "High standards.", s2t: "Speed", s2d: "On time, reliable.", s3t: "Support", s3d: "Always by your side.", cH: "Contact", addr: "Baku", footer: "© Mənim Biznesim" },
    ru: { name: "Mənim Biznesim", nHome: "Главная", nServices: "Услуги", nContact: "Контакт", heroH: "Добро пожаловать!", heroSub: "Это ваш сайт — меняйте текст, цвета, логотип и изображения в панели.", heroCta: "Связаться", st1: "лет", st2: "клиентов", st3: "поддержка", st4: "качество", fHead: "Наши услуги", s1t: "Качество", s1d: "Высокие стандарты.", s2t: "Скорость", s2d: "Вовремя и надёжно.", s3t: "Поддержка", s3d: "Всегда рядом.", cH: "Контакт", addr: "Баку", footer: "© Mənim Biznesim" },
  };
  const CONTENT = { defaultLocale: "az", locales: { az: build(S.az), en: build(S.en), ru: build(S.ru) } };
  const THEME = { colors: { primary: "#6366f1", bg: "#ffffff", surface: "#f8fafc", text: "#0f172a", muted: "#64748b" }, fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" } };

  let userId = (await db.select({ id: users.id }).from(users).where(eq(users.email, EMAIL)).limit(1))[0]?.id;
  if (!userId) { try { await auth.api.signUpEmail({ body: { email: EMAIL, password: PASSWORD, name: NAME } }); } catch (e: any) { console.log("note:", e?.message); } userId = (await db.select({ id: users.id }).from(users).where(eq(users.email, EMAIL)).limit(1))[0]?.id; }
  if (!userId) { console.error("user yox"); await pool.end(); process.exit(1); }
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));

  const tpl = (await db.select({ id: siteTemplates.id }).from(siteTemplates).where(eq(siteTemplates.slug, "klinika-landing")).limit(1))[0];
  const ex = (await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.subdomain, SUB)).limit(1))[0];
  if (!ex) {
    const tid = uid("tnt");
    await db.insert(tenants).values({ id: tid, ownerId: userId, siteTemplateId: tpl.id, name: "Mənim Biznesim", subdomain: SUB, status: "active", deliveryType: "hosted" });
    await db.insert(tenantIntegrations).values({ tenantId: tid });
    await db.insert(tenantContent).values({ tenantId: tid, content: CONTENT as any, theme: THEME as any });
  } else {
    await db.update(tenantContent).set({ content: CONTENT as any, theme: THEME as any }).where(eq(tenantContent.tenantId, ex.id));
  }
  console.log("ALICI: email", EMAIL, "parol", PASSWORD, "sayt http://" + SUB + ".localhost:3000");
  await pool.end();
}
run().catch((e) => { console.error(e); process.exit(1); });
