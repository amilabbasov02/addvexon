/**
 * Platforma (addvoxen) UI-nin çoxdilliliyi — AZ/RU/EN.
 * Tenant saytlarından AYRI: bu, addvoxen marketinq/marketplace səhifələri üçündür.
 * Bu fayl TƏMİZdir (server-only import yoxdur) — həm server, həm client
 * komponentlər import edə bilsin. `getLang()` server helper-i `platform-locale.ts`-dədir.
 */
export type PLang = "az" | "en" | "ru";
export const PLANGS: PLang[] = ["az", "en", "ru"];
export const PLANG_LABELS: Record<PLang, string> = { az: "AZ", en: "EN", ru: "RU" };
export const PLANG_COOKIE = "lang";

type Dict = {
  nav: { templates: string; how: string; pricing: string; support: string; login: string; viewTpl: string };
  home: {
    badge: string; heroH: string; heroSub: string; ctaTpl: string; ctaHow: string; priceLine: string;
    howH: string; howSub: string; s1t: string; s1d: string; s2t: string; s2d: string; s3t: string; s3d: string;
    tplH: string; tplSub: string; tplAll: string; tplEmpty: string;
    priceH: string; priceSub: string; popular: string; subT: string; subDesc: string; giris: string; perAy: string;
    f1: string; f2: string; f3: string; f4: string; chooseTpl: string;
    devAg: string; expT: string; expDesc: string; once: string; e1: string; e2: string; e3: string; e4: string; more: string;
    finalH: string; finalSub: string; finalCta: string;
  };
  market: { title: string; sub: string; all: string; landing: string; multi: string; allCats: string; empty: string; giris: string; ay: string };
  price: { title: string; sub: string; popular: string; subT: string; subDesc: string; giris: string; perAy: string; multiNote: string; f1: string; f2: string; f3: string; f4: string; f5: string; expT: string; expDesc: string; once: string; multiNote2: string; e1: string; e2: string; e3: string; e4: string; orderH: string; orderDesc: string; browse: string };
  detail: { back: string; landing: string; multi: string; preview: string; subT: string; subDesc: string; contact: string; expT: string; expDesc: string; included: string[]; reviewsSoon: string; giris: string; ay: string; once: string };
  footer: { product: string; company: string; legal: string; templates: string; pricing: string; how: string; about: string; support: string; privacy: string; terms: string; refund: string; rights: string };
  common: { perAy: string; giris: string };
  seo: {
    kw: string[];
    home: { t: string; d: string; k: string[] };
    market: { t: string; d: string; k: string[] };
    price: { t: string; d: string; k: string[] };
  };
};

export const PT: Record<PLang, Dict> = {
  az: {
    nav: { templates: "Şablonlar", how: "Necə işləyir", pricing: "Qiymətlər", support: "Dəstək", login: "Giriş", viewTpl: "Şablona bax" },
    home: {
      badge: "Kod yazmadan, dəqiqələr içində", heroH: "Hazır saytlar, dəqiqələr içində canlı.",
      heroSub: "Hazır sayt şablonu seç, ödə, biz host edək. Öz domenini qoş, öz panelindən idarə et — kod yazmadan.",
      ctaTpl: "Şablonlara bax", ctaHow: "Necə işləyir?", priceLine: "Abunə: {a} giriş + {b}/ay · və ya export {c}",
      howH: "Necə işləyir?", howSub: "Üç sadə addım — qalanını biz edirik.",
      s1t: "1. Şablon seç", s1d: "Marketdən bəyəndiyin hazır saytı seç, canlı önizləməyə bax.",
      s2t: "2. Ödə və təsdiqlə", s2d: "Ödənişdən sonra saytın bizim serverdə aktivləşir — heç bir quraşdırma yoxdur.",
      s3t: "3. Domenini qoş, idarə et", s3d: "Öz domenini qoş, panellə mətn/rəng/logonu dəyiş — istədiyin kimi.",
      tplH: "Hazır şablonlar", tplSub: "Sənayəyə uyğun, peşəkar dizaynlar.", tplAll: "Hamısına bax →", tplEmpty: "Hələ şablon əlavə olunmayıb.",
      priceH: "Sadə qiymət", priceSub: "Gizli xərc yoxdur. İstədiyin modeli seç.", popular: "Ən populyar",
      subT: "Abunə (hosted)", subDesc: "Saytı biz host edirik, sən idarə edirsən.", giris: "giriş", perAy: "/ ay",
      f1: "Managed hosting + SSL", f2: "Öz domenini qoş", f3: "Panellə tam idarə", f4: "Texniki dəstək", chooseTpl: "Şablon seç",
      devAg: "Developer / Agentlik", expT: "Export (self-host)", expDesc: "Kodu, admini və SQL dump-ı al — öz serverinə qur.", once: "bir dəfəlik",
      e1: "Tam mənbə kodu (zip)", e2: "Admin panel daxil", e3: "SQL dump + install README", e4: "Aylıq ödəniş yoxdur", more: "Ətraflı",
      finalH: "Saytını bu gün canlandır", finalSub: "Şablonu seç, qalanını biz edək. Bir neçə dəqiqəyə öz domenində canlı sayt.", finalCta: "İndi başla",
    },
    market: { title: "Hazır sayt şablonları", sub: "Sənayəyə uyğun, peşəkar dizaynlar. Birini seç — qalanını biz edək.", all: "Hamısı", landing: "Landing", multi: "Çoxsəhifəli", allCats: "Bütün kateqoriyalar", empty: "Bu filtrə uyğun şablon tapılmadı.", giris: "giriş", ay: "/ay" },
    price: { title: "Qiymətlər", sub: "Sadə və şəffaf. Aşağıdakı qiymətlər məlumat xarakterlidir — dəqiq təklif və sifariş üçün bizimlə əlaqə saxlayın.", popular: "Ən populyar", subT: "Abunə (hosted)", subDesc: "Saytı biz host edirik, sən idarə edirsən.", giris: "giriş", perAy: "/ ay", multiNote: "Çoxsəhifəli saytlar üçün giriş və aylıq bir az yüksəkdir.", f1: "Managed hosting + SSL", f2: "Öz domenini qoş", f3: "Panellə tam idarə (mətn/rəng/logo)", f4: "GA4 / GTM / Pixel inteqrasiyası", f5: "Texniki dəstək", expT: "Export (self-host)", expDesc: "Kodu, admini və SQL dump-ı al — öz serverinə qur.", once: "bir dəfəlik", multiNote2: "Çoxsəhifəli saytlar üçün qiymət dəyişir.", e1: "Tam mənbə kodu (zip)", e2: "Admin panel daxil", e3: "SQL dump + install README", e4: "Aylıq ödəniş yoxdur", orderH: "Sifariş vermək istəyirsiniz?", orderDesc: "Şablon seçin və bizimlə əlaqə saxlayın — qalanını biz edək. Sualınız varsa, e-poçt yazın.", browse: "Şablonlara bax" },
    detail: { back: "Şablonlar", landing: "Landing", multi: "Çoxsəhifəli", preview: "Canlı önizləmə", subT: "Abunə (hosted)", subDesc: "Biz host edirik, sən idarə edirsən. Öz domenini qoş.", contact: "Əlaqəyə keç", expT: "Export (self-host)", expDesc: "Kod + admin + SQL dump — öz serverinə qur.", included: ["Responsive dizayn", "SEO hazır", "Sürətli yüklənmə", "Panellə idarə", "SSL sertifikat", "Texniki dəstək"], reviewsSoon: "Rəylər və şərhlər tezliklə əlavə olunacaq.", giris: "giriş", ay: "/ay", once: "bir dəfəlik" },
    footer: { product: "Məhsul", company: "Şirkət", legal: "Hüquqi", templates: "Şablonlar", pricing: "Qiymətlər", how: "Necə işləyir", about: "Haqqımızda", support: "Dəstək", privacy: "Məxfilik", terms: "İstifadə şərtləri", refund: "Geri qaytarma", rights: "Bütün hüquqlar qorunur." },
    common: { perAy: "/ay", giris: "giriş" },
    seo: {
      kw: ["hazır sayt", "sayt şablonları", "veb sayt hazırlamaq", "managed hosting", "landing page Azərbaycan", "domen qoşma", "onlayn mağaza sayt", "korporativ sayt", "restoran sayt", "klinika sayt", "addvoxen"],
      home: { t: "Hazır saytlar marketi + managed hosting", d: "Hazır sayt şablonu seç, ödə, biz host edək. Öz domenini qoş, panellə idarə et — kod yazmadan, dəqiqələr içində canlı sayt.", k: ["hazır sayt", "sayt qurmaq", "veb sayt hazırlamaq", "managed hosting Azərbaycan"] },
      market: { t: "Hazır sayt şablonları — marketplace", d: "Səhiyyə, restoran, biznes, mağaza, gözəllik və agentlik üçün peşəkar hazır sayt şablonları. AZ/RU/EN. Seç, ödə, canlı.", k: ["sayt şablonları", "hazır landing page", "çoxsəhifəli sayt", "şablon marketi"] },
      price: { t: "Qiymətlər — abunə və export", d: "Hazır sayt qiymətləri: aylıq abunə (managed hosting) və ya bir dəfəlik export. Şəffaf, gizli xərc yoxdur.", k: ["sayt qiyməti", "hosting qiyməti", "sayt abunəsi", "veb sayt qiyməti Azərbaycan"] },
    },
  },
  en: {
    nav: { templates: "Templates", how: "How it works", pricing: "Pricing", support: "Support", login: "Sign in", viewTpl: "View templates" },
    home: {
      badge: "No code, in minutes", heroH: "Ready-made sites, live in minutes.",
      heroSub: "Pick a ready site template, pay, and we host it. Connect your domain, manage from your own panel — no code.",
      ctaTpl: "Browse templates", ctaHow: "How it works?", priceLine: "Subscription: {a} setup + {b}/mo · or export {c}",
      howH: "How it works?", howSub: "Three simple steps — we do the rest.",
      s1t: "1. Pick a template", s1d: "Choose a ready site from the market and view the live preview.",
      s2t: "2. Pay & approve", s2d: "After payment your site goes live on our server — zero setup.",
      s3t: "3. Connect domain, manage", s3d: "Connect your domain, edit text/colors/logo from the panel — your way.",
      tplH: "Ready templates", tplSub: "Professional designs for every industry.", tplAll: "View all →", tplEmpty: "No templates yet.",
      priceH: "Simple pricing", priceSub: "No hidden costs. Choose your model.", popular: "Most popular",
      subT: "Subscription (hosted)", subDesc: "We host it, you manage it.", giris: "setup", perAy: "/ mo",
      f1: "Managed hosting + SSL", f2: "Connect your domain", f3: "Full panel control", f4: "Technical support", chooseTpl: "Choose a template",
      devAg: "Developer / Agency", expT: "Export (self-host)", expDesc: "Get the code, admin and SQL dump — host on your own server.", once: "one-time",
      e1: "Full source code (zip)", e2: "Admin panel included", e3: "SQL dump + install README", e4: "No monthly fee", more: "Learn more",
      finalH: "Launch your site today", finalSub: "Pick a template, we do the rest. A live site on your domain in minutes.", finalCta: "Get started",
    },
    market: { title: "Ready site templates", sub: "Professional designs for every industry. Pick one — we do the rest.", all: "All", landing: "Landing", multi: "Multi-page", allCats: "All categories", empty: "No templates match this filter.", giris: "setup", ay: "/mo" },
    price: { title: "Pricing", sub: "Simple and transparent. Prices below are informational — contact us for an exact quote and to order.", popular: "Most popular", subT: "Subscription (hosted)", subDesc: "We host it, you manage it.", giris: "setup", perAy: "/ mo", multiNote: "Setup and monthly are slightly higher for multi-page sites.", f1: "Managed hosting + SSL", f2: "Connect your domain", f3: "Full panel control (text/colors/logo)", f4: "GA4 / GTM / Pixel integration", f5: "Technical support", expT: "Export (self-host)", expDesc: "Get the code, admin and SQL dump — host on your own server.", once: "one-time", multiNote2: "Price varies for multi-page sites.", e1: "Full source code (zip)", e2: "Admin panel included", e3: "SQL dump + install README", e4: "No monthly fee", orderH: "Want to order?", orderDesc: "Choose a template and contact us — we do the rest. Questions? Email us.", browse: "Browse templates" },
    detail: { back: "Templates", landing: "Landing", multi: "Multi-page", preview: "Live preview", subT: "Subscription (hosted)", subDesc: "We host it, you manage it. Connect your domain.", contact: "Contact us", expT: "Export (self-host)", expDesc: "Code + admin + SQL dump — host on your own server.", included: ["Responsive design", "SEO ready", "Fast loading", "Panel control", "SSL certificate", "Technical support"], reviewsSoon: "Reviews and comments coming soon.", giris: "setup", ay: "/mo", once: "one-time" },
    footer: { product: "Product", company: "Company", legal: "Legal", templates: "Templates", pricing: "Pricing", how: "How it works", about: "About", support: "Support", privacy: "Privacy", terms: "Terms", refund: "Refund", rights: "All rights reserved." },
    common: { perAy: "/mo", giris: "setup" },
    seo: {
      kw: ["ready-made website", "website templates", "managed hosting", "landing page", "connect domain", "online store website", "corporate website", "restaurant website", "clinic website", "addvoxen"],
      home: { t: "Ready-made sites marketplace + managed hosting", d: "Pick a ready site template, pay, and we host it. Connect your domain, manage from your panel — no code, live in minutes.", k: ["ready-made website", "build a website", "managed hosting", "website templates"] },
      market: { t: "Ready site templates — marketplace", d: "Professional ready-made site templates for healthcare, restaurants, business, retail, beauty and agencies. AZ/RU/EN. Pick, pay, go live.", k: ["website templates", "landing page templates", "multi-page website", "template marketplace"] },
      price: { t: "Pricing — subscription and export", d: "Ready site pricing: monthly subscription (managed hosting) or one-time export. Transparent, no hidden costs.", k: ["website price", "hosting price", "website subscription", "web design cost"] },
    },
  },
  ru: {
    nav: { templates: "Шаблоны", how: "Как это работает", pricing: "Цены", support: "Поддержка", login: "Вход", viewTpl: "К шаблонам" },
    home: {
      badge: "Без кода, за минуты", heroH: "Готовые сайты, запуск за минуты.",
      heroSub: "Выберите готовый шаблон, оплатите — мы захостим. Подключите домен, управляйте из своей панели — без кода.",
      ctaTpl: "Смотреть шаблоны", ctaHow: "Как это работает?", priceLine: "Подписка: {a} установка + {b}/мес · или экспорт {c}",
      howH: "Как это работает?", howSub: "Три простых шага — остальное за нами.",
      s1t: "1. Выберите шаблон", s1d: "Выберите готовый сайт и посмотрите живое превью.",
      s2t: "2. Оплата и подтверждение", s2d: "После оплаты сайт запускается на нашем сервере — без настройки.",
      s3t: "3. Подключите домен", s3d: "Подключите домен, меняйте текст/цвета/логотип в панели — как хотите.",
      tplH: "Готовые шаблоны", tplSub: "Профессиональные дизайны для любой сферы.", tplAll: "Смотреть все →", tplEmpty: "Шаблонов пока нет.",
      priceH: "Простые цены", priceSub: "Без скрытых расходов. Выберите модель.", popular: "Популярное",
      subT: "Подписка (хостинг)", subDesc: "Мы хостим, вы управляете.", giris: "установка", perAy: "/ мес",
      f1: "Хостинг + SSL", f2: "Свой домен", f3: "Полное управление", f4: "Техподдержка", chooseTpl: "Выбрать шаблон",
      devAg: "Разработчик / Агентство", expT: "Экспорт (self-host)", expDesc: "Получите код, админку и SQL дамп — разместите на своём сервере.", once: "разово",
      e1: "Полный исходный код (zip)", e2: "Админ-панель включена", e3: "SQL дамп + README", e4: "Без ежемесячной платы", more: "Подробнее",
      finalH: "Запустите сайт сегодня", finalSub: "Выберите шаблон, остальное за нами. Живой сайт на вашем домене за минуты.", finalCta: "Начать",
    },
    market: { title: "Готовые шаблоны сайтов", sub: "Профессиональные дизайны для любой сферы. Выберите — остальное за нами.", all: "Все", landing: "Лендинг", multi: "Многостраничный", allCats: "Все категории", empty: "Нет шаблонов по этому фильтру.", giris: "установка", ay: "/мес" },
    price: { title: "Цены", sub: "Просто и прозрачно. Цены ниже информационные — свяжитесь с нами для точного предложения и заказа.", popular: "Популярное", subT: "Подписка (хостинг)", subDesc: "Мы хостим, вы управляете.", giris: "установка", perAy: "/ мес", multiNote: "Для многостраничных сайтов установка и месяц чуть выше.", f1: "Хостинг + SSL", f2: "Свой домен", f3: "Полное управление (текст/цвета/логотип)", f4: "Интеграция GA4 / GTM / Pixel", f5: "Техподдержка", expT: "Экспорт (self-host)", expDesc: "Получите код, админку и SQL дамп — на своём сервере.", once: "разово", multiNote2: "Цена для многостраничных сайтов отличается.", e1: "Полный исходный код (zip)", e2: "Админ-панель включена", e3: "SQL дамп + README", e4: "Без ежемесячной платы", orderH: "Хотите заказать?", orderDesc: "Выберите шаблон и свяжитесь с нами — остальное за нами. Вопросы? Напишите.", browse: "Смотреть шаблоны" },
    detail: { back: "Шаблоны", landing: "Лендинг", multi: "Многостраничный", preview: "Живое превью", subT: "Подписка (хостинг)", subDesc: "Мы хостим, вы управляете. Подключите домен.", contact: "Связаться", expT: "Экспорт (self-host)", expDesc: "Код + админка + SQL дамп — на своём сервере.", included: ["Адаптивный дизайн", "Готов к SEO", "Быстрая загрузка", "Управление в панели", "SSL сертификат", "Техподдержка"], reviewsSoon: "Отзывы и комментарии скоро.", giris: "установка", ay: "/мес", once: "разово" },
    footer: { product: "Продукт", company: "Компания", legal: "Правовое", templates: "Шаблоны", pricing: "Цены", how: "Как это работает", about: "О нас", support: "Поддержка", privacy: "Конфиденциальность", terms: "Условия", refund: "Возврат", rights: "Все права защищены." },
    common: { perAy: "/мес", giris: "установка" },
    seo: {
      kw: ["готовый сайт", "шаблоны сайтов", "управляемый хостинг", "лендинг", "подключение домена", "сайт интернет-магазина", "корпоративный сайт", "сайт ресторана", "сайт клиники", "addvoxen"],
      home: { t: "Маркетплейс готовых сайтов + хостинг", d: "Выберите готовый шаблон, оплатите — мы захостим. Подключите домен, управляйте из панели — без кода, запуск за минуты.", k: ["готовый сайт", "создать сайт", "управляемый хостинг", "шаблоны сайтов"] },
      market: { t: "Готовые шаблоны сайтов — маркетплейс", d: "Профессиональные готовые шаблоны для медицины, ресторанов, бизнеса, магазинов, красоты и агентств. AZ/RU/EN.", k: ["шаблоны сайтов", "шаблоны лендингов", "многостраничный сайт", "маркетплейс шаблонов"] },
      price: { t: "Цены — подписка и экспорт", d: "Цены на готовые сайты: ежемесячная подписка (хостинг) или разовый экспорт. Прозрачно, без скрытых расходов.", k: ["цена сайта", "цена хостинга", "подписка на сайт", "стоимость веб-дизайна"] },
    },
  },
};
