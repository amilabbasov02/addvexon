// Generate AdVexa-Strategy.docx — competitive analysis, monetization
// timeline and global expansion playbook. Run:
//   node scripts/build-strategy-doc.mjs
import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  PageOrientation,
  Footer,
  Header,
  PageNumber,
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "AdVexa-Strategy.docx");

// ---------- Theme tokens (Material-style) ----------
const COLOR = {
  ink: "1A1A1A",
  ink2: "4A4A4A",
  primary: "5516BE",
  primaryDim: "8B5CF6",
  accent: "00A0A9",
  ok: "10B981",
  warn: "F59E0B",
  err: "DC2626",
  surface: "FFFFFF",
  surfaceAlt: "F4F2FA",
  border: "E2E0EA",
};

// ---------- Paragraph helpers ----------
const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({ text, bold: true, color: COLOR.primary, size: 36 }),
    ],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({ text, bold: true, color: COLOR.ink, size: 28 }),
    ],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({ text, bold: true, color: COLOR.primaryDim, size: 22 }),
    ],
  });

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 120, line: 300 },
    alignment: opts.align ?? AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        color: opts.color ?? COLOR.ink,
        size: opts.size ?? 22,
        bold: opts.bold,
        italics: opts.italics,
      }),
    ],
  });

const callout = (text) =>
  new Paragraph({
    spacing: { before: 120, after: 120, line: 300 },
    indent: { left: 360, right: 360 },
    shading: { type: ShadingType.SOLID, color: COLOR.surfaceAlt },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: COLOR.primary },
    },
    children: [
      new TextRun({ text, color: COLOR.ink2, italics: true, size: 22 }),
    ],
  });

const bullet = (text, opts = {}) =>
  new Paragraph({
    bullet: { level: opts.level ?? 0 },
    spacing: { after: 60, line: 280 },
    children: opts.runs ?? [new TextRun({ text, size: 22, color: COLOR.ink })],
  });

const numbered = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "default-numbering", level },
    spacing: { after: 60, line: 280 },
    children: [new TextRun({ text, size: 22, color: COLOR.ink })],
  });

const richBullet = (parts) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60, line: 280 },
    children: parts.map(
      (p) =>
        new TextRun({
          text: p.text,
          bold: p.bold,
          color: p.color ?? COLOR.ink,
          size: 22,
        }),
    ),
  });

// ---------- Table helpers ----------
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: COLOR.border };
const thickBorder = { style: BorderStyle.SINGLE, size: 8, color: COLOR.primary };

function cell(content, opts = {}) {
  const text = Array.isArray(content) ? content : [content];
  const paragraphs = text.map((t) =>
    typeof t === "string"
      ? new Paragraph({
          spacing: { after: 60, line: 260 },
          alignment: opts.align ?? AlignmentType.LEFT,
          children: [
            new TextRun({
              text: t,
              size: opts.size ?? 20,
              bold: opts.bold,
              color: opts.color ?? COLOR.ink,
            }),
          ],
        })
      : t,
  );
  return new TableCell({
    children: paragraphs,
    shading: opts.fill
      ? { type: ShadingType.SOLID, color: opts.fill }
      : undefined,
    width: opts.width
      ? { size: opts.width, type: WidthType.PERCENTAGE }
      : undefined,
    verticalAlign: opts.vAlign ?? "center",
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
  });
}

function headerRow(cells, fill = COLOR.primary) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((c) =>
      typeof c === "string"
        ? cell(c, {
            fill,
            color: "FFFFFF",
            bold: true,
            size: 20,
            align: AlignmentType.LEFT,
          })
        : c,
    ),
  });
}

function dataRow(cells, opts = {}) {
  return new TableRow({
    children: cells.map((c, i) =>
      typeof c === "string"
        ? cell(c, {
            fill: opts.alt && i === 0 ? COLOR.surfaceAlt : undefined,
            bold: i === 0 && opts.boldFirst !== false,
          })
        : c,
    ),
  });
}

function fullWidthTable(rows) {
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
      insideHorizontal: thinBorder,
      insideVertical: thinBorder,
    },
  });
}

const score = (n) => {
  // Visual dot rating cell, 0..5
  const dots = "●".repeat(n) + "○".repeat(5 - n);
  const color = n >= 4 ? COLOR.ok : n >= 2 ? COLOR.warn : COLOR.err;
  return cell(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: dots, color, size: 22 })],
    }),
  );
};

// ============================================================
//  DOCUMENT CONTENT
// ============================================================
const blocks = [];

// ---------- Cover ----------
blocks.push(
  new Paragraph({
    spacing: { before: 2000, after: 200 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "AdVexa",
        bold: true,
        size: 96,
        color: COLOR.primary,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: "Beynəlxalq Bazar Müqayisəsi & Qlobal Monetizasiya Strategiyası",
        size: 32,
        color: COLOR.ink,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [
      new TextRun({
        text: "AI-Native Ad Creative Platform vs Canva, Adobe Express, Figma, Creatopy",
        size: 24,
        italics: true,
        color: COLOR.ink2,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Hazırlanma tarixi: 26 May 2026",
        size: 22,
        color: COLOR.ink2,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "Hazırlayan: AdVexa strateji analiz qrupu",
        size: 22,
        color: COLOR.ink2,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- Table of contents (manual) ----------
blocks.push(
  h1("Mündəricat"),
  ...[
    "1. İcraçı Xülasə (Executive Summary)",
    "2. Rəqib Mənzərəsi",
    "3. Detallı Funksiya Müqayisəsi",
    "4. AdVexa-nın Unikal Mövqeyi",
    "5. Kritik Boşluqlar — Nə Çatışmır?",
    "6. Monetizasiya Strategiyası & Vaxt Cədvəli",
    "7. İlk Pulu Nə Vaxt Götürərik (60-90 günlük plan)",
    "8. Qlobal Genişlənmə Planı",
    "9. Texniki Arxitektura — Custom SQL Stack",
    "10. 18-Aylıq Roadmap",
    "11. Risk Analizi",
    "12. KPI-lər & Uğur Metrikası",
    "13. Nəticə və Növbəti Addımlar",
  ].map((t) =>
    new Paragraph({
      spacing: { after: 80, line: 280 },
      children: [new TextRun({ text: t, size: 22, color: COLOR.ink })],
    }),
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 1. Executive Summary ----------
blocks.push(
  h1("1. İcraçı Xülasə"),
  p(
    "AdVexa hazırda Stitch dizaynları üzərində qurulmuş Next.js 16 əsaslı AI-fokuslu reklam yaratma platformasıdır. Bu sənəd üç əsas suala cavab verir:",
  ),
  bullet("Canva və digər nəhənglərlə müqayisədə hardayıq və hara gedirik?"),
  bullet("Pul gətirməyə nə qədər tez başlaya bilərik? (Cavab: 60-90 gün)"),
  bullet("Qlobal bazara necə çıxa bilərik və hansı ölkələrdən başlamaq lazımdır?"),
  h3("Əsas tezislər"),
  callout(
    "Canva-nı düz-üz mübarizədə məğlub edə bilmərik — onların 200M+ aylıq istifadəçisi və 5 milyarddan çox aktivi var. Lakin SPESİFİK olaraq reklam yaratmaq vertikalında AI-native, performans-driven və creator economy modelimizlə diferensiasiya edib niş qalib ola bilərik.",
  ),
  p(
    "Strateji yanaşma: \"AI ilə işləyən reklam yaratma alətləri\" niş bazarında qlobal lider olmaq. Bu bazar 2026-cı ildə təxminən 4.2 milyard USD, 2030-cu ildə 12 milyard USD həcmindədir (Grand View Research proqnozu).",
  ),
  h3("Maliyyə proqnozu (mühafizəkar ssenari)"),
);

blocks.push(
  fullWidthTable([
    headerRow(["Faza", "Müddət", "Aylıq Aktiv İstifadəçi", "Aylıq Gəlir (MRR)"]),
    dataRow(["Beta launch", "Ay 3", "500", "$2,500"]),
    dataRow(["Public launch", "Ay 6", "5,000", "$15,000"]),
    dataRow(["Marketplace açılır", "Ay 9", "20,000", "$60,000"]),
    dataRow(["Qlobal genişlənmə", "Ay 12", "60,000", "$180,000"]),
    dataRow(["İlk milyon ARR", "Ay 18", "200,000", "$1,000,000+"]),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 2. Competitive landscape ----------
blocks.push(
  h1("2. Rəqib Mənzərəsi"),
  p(
    "Beynəlxalq bazarda 5 əsas rəqib var. Hər birinin güclü və zəif tərəfləri var; bizim üçün boşluq onların zəifliklərindədir.",
  ),
);

blocks.push(
  fullWidthTable([
    headerRow([
      "Rəqib",
      "İstifadəçi (M/aylıq)",
      "Qiymət (Pro)",
      "Güclü tərəfi",
      "Zəif tərəfi (BİZİM ŞANS)",
    ]),
    dataRow([
      "Canva",
      "220M+",
      "$14.99/ay",
      "610K+ template, brand kit, Magic Resize, AI suite, mobil tətbiq",
      "Generic — reklam üçün xüsusi optimizasiya yox, ad platforma publish yox",
    ]),
    dataRow([
      "Adobe Express",
      "30M",
      "$9.99/ay",
      "Adobe Firefly AI, Photoshop inteqrasiya, Stock library",
      "Yavaş, UI mürəkkəb, az template, dik öyrənmə əyrisi",
    ]),
    dataRow([
      "Figma",
      "10M",
      "$12/ay",
      "Pro design alətləri, real-time collaboration, plugins",
      "Reklam üçün deyil, animasiya/GIF yox, qeyri-dizaynerlər çətinlik çəkir",
    ]),
    dataRow([
      "VistaCreate (Crello)",
      "20M",
      "$10/ay",
      "Hazır ad sizes, animated templates, ucuz",
      "AI cüzi, marketplace yox, brand güclü deyil",
    ]),
    dataRow([
      "Creatopy",
      "1M",
      "$36/ay",
      "HTML5 ad export, IAB-uyğun, ad-fokuslu",
      "UI köhnə, az template, baha, AI əskik",
    ]),
    dataRow([
      "Snappa",
      "5M",
      "$10/ay",
      "Sadə UI, ucuz, sosial media fokuslu",
      "Stagnasiyada, son 2 ildə yenilik yox, AI yox",
    ]),
    dataRow([
      "Bannersnack (Creatopy)",
      "0.5M",
      "$36/ay",
      "Banner-spesifik, animation",
      "Creatopy ilə birləşdi, müstəqil iş dayandı",
    ]),
    dataRow([
      "AdCreative.ai",
      "0.5M",
      "$29/ay",
      "AI ad generation, CTR proqnozu, biz nə etmək istəyirikə yaxın",
      "Editor zəif, customization az, lock-in çox",
    ]),
  ]),
  callout(
    "AdCreative.ai bizim ən yaxın rəqibimizdir — eyni \"AI-native ad\" niş üçün hədəflənib. Onları superior editor + marketplace + animation ilə keçə bilərik.",
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 3. Feature Comparison ----------
blocks.push(
  h1("3. Detallı Funksiya Müqayisəsi"),
  p(
    "Aşağıdakı cədvəl AdVexa-nı 5 əsas rəqiblə 28 funksiya üzrə müqayisə edir. Reytinq: ● = mövcud və güclü, ○ = yoxdur və ya zəif.",
  ),
);

// Score legend: 0..5 → dots
const featureRows = [
  // [feature, advexa, canva, adobe, figma, creatopy, adcreative.ai]
  ["AI text/headline generation", 0, 4, 5, 0, 2, 5],
  ["AI image generation (background, BG remove)", 0, 5, 5, 1, 2, 4],
  ["Brand kit (colors, fonts, logo)", 0, 5, 4, 4, 3, 3],
  ["Magic Resize (1 dizayn → 20 ölçü)", 0, 5, 4, 2, 4, 3],
  ["Standart IAB ad sizes (30+)", 1, 4, 3, 1, 5, 4],
  ["Template kitabxana (200+ )", 0, 5, 4, 3, 4, 3],
  ["GIF / MP4 animation editor", 0, 4, 4, 0, 5, 2],
  ["HTML5 ad export (Google Ads)", 0, 2, 2, 0, 5, 3],
  ["Custom canvas editor (drag/resize/rotate)", 4, 5, 4, 5, 4, 3],
  ["Layers, z-order, locking", 5, 5, 5, 5, 4, 2],
  ["Undo/Redo with history", 5, 5, 5, 5, 5, 3],
  ["Real-time collaboration", 0, 5, 3, 5, 2, 0],
  ["Comments / version history", 0, 4, 3, 5, 2, 0],
  ["Workspaces / teams / roles", 0, 5, 4, 5, 3, 3],
  ["Stock library (photos, icons, videos)", 0, 5, 5, 2, 4, 3],
  ["Smart guides / snap-to-grid", 0, 4, 4, 5, 4, 2],
  ["Marketplace (creator economy)", 0, 3, 1, 2, 0, 0],
  ["Mobile app (iOS/Android)", 0, 5, 4, 4, 1, 1],
  ["Offline mode / PWA", 0, 3, 2, 3, 0, 0],
  ["Ad platform publish (Meta, Google)", 0, 1, 0, 0, 2, 4],
  ["Performance analytics / CTR prediction", 0, 1, 0, 0, 1, 5],
  ["A/B variant explosion", 0, 1, 1, 0, 1, 4],
  ["Print export (CMYK, bleed)", 0, 5, 5, 1, 0, 0],
  ["Multi-language UI", 0, 5, 5, 5, 4, 4],
  ["Workflow automation / API", 0, 4, 4, 4, 3, 4],
  ["Performans (sürət, böyük dizaynlarda)", 5, 3, 2, 5, 3, 3],
  ["UI/UX modernliyi", 5, 4, 3, 5, 2, 3],
  ["Niş fokus (ad creative)", 5, 2, 1, 1, 4, 5],
];

const compRows = [
  headerRow([
    "Funksiya",
    cell("AdVexa", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
    cell("Canva", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
    cell("Adobe Ex.", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
    cell("Figma", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
    cell("Creatopy", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
    cell("AdCreative", { color: "FFFFFF", bold: true, align: AlignmentType.CENTER, fill: COLOR.primary }),
  ]),
  ...featureRows.map(([feat, adv, can, adb, fig, crt, adc]) =>
    new TableRow({
      children: [
        cell(feat, { size: 18, bold: false }),
        score(adv),
        score(can),
        score(adb),
        score(fig),
        score(crt),
        score(adc),
      ],
    }),
  ),
];

blocks.push(fullWidthTable(compRows));

// Score totals
const totals = (() => {
  const cols = [0, 0, 0, 0, 0, 0];
  for (const row of featureRows) {
    for (let i = 0; i < 6; i++) cols[i] += row[i + 1];
  }
  return cols;
})();

blocks.push(
  h3("Cəmi xal"),
  fullWidthTable([
    headerRow(["AdVexa", "Canva", "Adobe", "Figma", "Creatopy", "AdCreative"]),
    new TableRow({
      children: [
        cell(`${totals[0]} / ${featureRows.length * 5}`, {
          bold: true,
          align: AlignmentType.CENTER,
          color: COLOR.err,
        }),
        cell(`${totals[1]} / ${featureRows.length * 5}`, {
          align: AlignmentType.CENTER,
          color: COLOR.ok,
        }),
        cell(`${totals[2]} / ${featureRows.length * 5}`, {
          align: AlignmentType.CENTER,
        }),
        cell(`${totals[3]} / ${featureRows.length * 5}`, {
          align: AlignmentType.CENTER,
        }),
        cell(`${totals[4]} / ${featureRows.length * 5}`, {
          align: AlignmentType.CENTER,
        }),
        cell(`${totals[5]} / ${featureRows.length * 5}`, {
          align: AlignmentType.CENTER,
        }),
      ],
    }),
  ]),
  callout(
    "AdVexa hazırda 28 funksiyadan 28-i üzrə cəmi 25 xal ilə ən aşağıdadır — lakin bu MVP-dir. Roadmap (bölmə 10) bu balı 12 ayda 120+ səviyyəsinə çatdırır.",
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 4. AdVexa unique positioning ----------
blocks.push(
  h1("4. AdVexa-nın Unikal Mövqeyi"),
  p(
    "Canva ümumi məqsədli dizayn alətidir. AdVexa REKLAM YARATMAQ üçün AI-native platformadır. Bu fərq hər şeyi dəyişir.",
  ),
  h3("Pozitionalama bəyanatı"),
  callout(
    "\"AdVexa AI ilə işləyən reklam yaratma platformasıdır — yüksək konversiyalı reklam bannerlərini saniyələrlə yaradan, ölçüləri avtomatik adaptasiya edən, performansı proqnozlaşdıran və Meta/Google Ads-ə birbaşa publish edən komandalar üçün hazırlanmış həll.\"",
  ),
  h3("5 fərqləndirici sütun"),
);

const pillars = [
  [
    "Performance-driven",
    "Hər banner AI tərəfindən CTR proqnozu ilə qiymətləndirilir. İstifadəçi yaratdığı reklamın ehtimal olunan klik dərəcəsini görür və ən yaxşı variantı seçir.",
  ],
  [
    "Variant explosion",
    "Bir konsept → 20 variant 30 saniyədə. Müxtəlif rəng sxemləri, kopiya, layout — A/B test üçün hazır.",
  ],
  [
    "Ad-platform native",
    "Birbaşa Meta Ads Manager, Google Ads, TikTok Ads-ə publish. Performans datası AdVexa-ya gəlir — feedback loop qapanır.",
  ],
  [
    "Brand DNA mühafizəsi",
    "Komanda üzvləri brand-i qıra bilməz. Locked tokens (rəng, font, logo) hər template-yə avtomatik tətbiq olunur.",
  ],
  [
    "Creator economy",
    "Dizaynerlər template yaradır → satır → AdVexa 30% komissiya götürür. Network effect: nə qədər çox creator, o qədər çox alıcı, və əksinə.",
  ],
];

blocks.push(
  fullWidthTable([
    headerRow(["#", "Sütun", "Təsvir"]),
    ...pillars.map(([name, desc], i) =>
      dataRow([`${i + 1}`, name, desc], { boldFirst: false }),
    ),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 5. Critical gaps ----------
blocks.push(
  h1("5. Kritik Boşluqlar — Nə Çatışmır?"),
  p("Hazırkı vəziyyət və hədəf arasındakı fərqi qrupladıq."),
  h3("Backend & Infrastruktur (CRITICAL)"),
  bullet("Auth/user accounts — yoxdur. Hər istifadəçi anonim, localStorage-də saxlanır."),
  bullet("Database — yoxdur. Custom MySQL/Postgres setup lazımdır."),
  bullet("Cloud storage — yoxdur. Şəkillər data-URL kimi document-də (məhdud)."),
  bullet("Payments — yoxdur. Stripe inteqrasiya lazımdır."),
  bullet("Email/notifications — yoxdur."),
  bullet("CDN & global delivery — yoxdur."),

  h3("Editor funksionalliqı (HIGH)"),
  bullet("Magic Resize (1 dizayn → 20 standart ölçü)"),
  bullet("Brand Kit (rəng/font/logo workspace-də saxlanılır)"),
  bullet("Smart guides / snapping during drag"),
  bullet("Animation / GIF editor (timeline + tweens)"),
  bullet("MP4 / video export"),
  bullet("HTML5 ad export (Google Ads format)"),
  bullet("Stock library inteqrasiyası (Unsplash, Iconify, Lottie)"),
  bullet("Real-time collaboration (Yjs/WebSocket)"),

  h3("AI funksiyaları (HIGH)"),
  bullet("AI text generation — başlıq, copy, CTA (Claude API)"),
  bullet("AI image generation — background, illustration (Flux/SDXL)"),
  bullet("AI background removal"),
  bullet("AI variant explosion (1 → 20)"),
  bullet("CTR proqnozlaşdırma modeli"),

  h3("Content (HIGH)"),
  bullet("200+ template (hazırda 8)"),
  bullet("30+ standart ad sizes preset"),
  bullet("Industry vertical-ları üzrə categorization"),

  h3("Monetizasiya & Marketplace (CRITICAL for revenue)"),
  bullet("Subscription tier-lər (Free/Pro/Team/Enterprise)"),
  bullet("Stripe ödəniş axını"),
  bullet("Premium template gating"),
  bullet("Creator dashboard"),
  bullet("Stripe Connect (split payments)"),
  bullet("License management"),
  bullet("Royalty/payout sistemi"),

  h3("Qlobal & Lokalizasiya (MEDIUM)"),
  bullet("10 dil dəstəyi (EN, RU, TR, ES, PT, DE, FR, AR, ZH, HI)"),
  bullet("Multi-currency Stripe"),
  bullet("Regional ödəniş metodları (Iyzico, MIR, Alipay, UPI, Mercado Pago)"),
  bullet("GDPR / CCPA compliance"),
  bullet("Vergi (1099-K US, VAT MOSS EU)"),

  h3("B2B & Enterprise (LOW priority, future)"),
  bullet("Workspaces & roles"),
  bullet("SSO (SAML, OAuth)"),
  bullet("Audit log"),
  bullet("API & webhooks"),
  bullet("White-label"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 6. Monetization ----------
blocks.push(
  h1("6. Monetizasiya Strategiyası & Vaxt Cədvəli"),
  p(
    "5 gəlir mənbəyi var, hər birinin başlama vaxtı və potensial gəliri fərqlidir.",
  ),
);

blocks.push(
  fullWidthTable([
    headerRow([
      "Model",
      "İlk gəlir",
      "Hədəf ARPU",
      "Potensial (Ay 18)",
      "Risk",
    ]),
    dataRow([
      "Freemium Subscription (Pro $12/ay)",
      "Ay 2-3",
      "$8-12",
      "$600K MRR",
      "Aşağı — sabit gəlir",
    ]),
    dataRow([
      "One-time Export Credits ($5-15)",
      "Ay 1-2",
      "$3-5",
      "$100K MRR",
      "Çox aşağı — sürətli launch",
    ]),
    dataRow([
      "Marketplace Komissiya (30%)",
      "Ay 6-9",
      "$2-4 (təxmin)",
      "$300K MRR",
      "Orta — şəbəkə effekti tələbi",
    ]),
    dataRow([
      "Enterprise / Agency ($99-499/ay)",
      "Ay 4-6",
      "$199-499",
      "$200K MRR",
      "Orta — uzun satış cikli",
    ]),
    dataRow([
      "Sponsored Templates (brand-lər ödəyir)",
      "Ay 9+",
      "$5,000-50,000/promo",
      "$50K MRR",
      "Yüksək — trafik tələbi",
    ]),
  ]),
);

blocks.push(
  h3("Subscription tier-ləri"),
  fullWidthTable([
    headerRow([
      "Tier",
      "Qiymət",
      "Hədəf istifadəçi",
      "Daxildir",
    ]),
    dataRow([
      "Free",
      "$0",
      "Diskovery, viral",
      "5 dizayn/ay, watermark export, free templates, Magic Resize 3 ölçü",
    ]),
    dataRow([
      "Pro",
      "$12/ay",
      "Solo creators, freelancers",
      "Limitsiz dizayn, Brand Kit, AI text/image, premium templates, Magic Resize bütün ölçülər, HD export",
    ]),
    dataRow([
      "Team",
      "$25/ay/user (min 3)",
      "Marketing komandaları",
      "Pro + collaboration, comments, workspaces, brand lock, 1TB cloud, priority support",
    ]),
    dataRow([
      "Enterprise",
      "$99-499/ay",
      "Agentliklər, böyük komandalar",
      "Team + API access, SSO, audit log, white-label seçim, ad platform integrations, dedicated CSM",
    ]),
  ]),
  callout(
    "Canva Pro $14.99/ay; biz $12/ay ilə bir az aşağıda başlamaqla niş bazara mövqe alırıq. ARPU yüksəltmək üçün AI credit paketləri (məs. $5 = 100 AI generation) əlavə oluna bilər.",
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 7. Fastest path to revenue ----------
blocks.push(
  h1("7. İlk Pulu Nə Vaxt Götürə Bilərik?"),
  callout(
    "Realist cavab: 60-90 gün. Bunun üçün lazım olan minimum dəstəyə \"Revenue-Ready MVP\" deyirik.",
  ),
  h3("60-günlük plan — Revenue-Ready MVP"),

  h3("Həftə 1-2: Backend foundation"),
  bullet("PostgreSQL 16 quraşdır (Hetzner, DigitalOcean və ya self-hosted)"),
  bullet("Next.js API routes + Drizzle ORM"),
  bullet("Better-Auth (email + Google OAuth)"),
  bullet("S3-uyğun storage (Cloudflare R2 — çıxış xərci yox)"),
  bullet("Schema: users, workspaces, documents, assets"),

  h3("Həftə 3-4: Cloud document storage"),
  bullet("Mevcut localStorage → DB"),
  bullet("Document save/load/list API"),
  bullet("Workspace per user (Free tier 1 workspace)"),
  bullet("Document thumbnail generation server-side"),

  h3("Həftə 5: Stripe integration"),
  bullet("Stripe checkout subscription flow"),
  bullet("Webhook handler (subscription created/cancelled)"),
  bullet("User.plan field (free | pro)"),
  bullet("Pro tier feature gating (export without watermark, AI features)"),

  h3("Həftə 6: Premium template gating"),
  bullet("Template.tier field (free | pro)"),
  bullet("60-100 hand-crafted premium template (Stitch MCP ilə generate olunur)"),
  bullet("Free istifadəçi premium template-ə baxır amma export edə bilmir"),

  h3("Həftə 7: AI text generation (premium feature)"),
  bullet("Claude API: headline/copy generation"),
  bullet("\"AI Variant\" button — 5 alternative copy yarat"),
  bullet("Pro tier üçün 100 AI generation/ay limit"),

  h3("Həftə 8: Beta launch"),
  bullet("Landing page \"Coming soon\" sign-up list (artıq mövcuddur)"),
  bullet("100 beta istifadəçi dəvət"),
  bullet("Product Hunt, Reddit r/SaaS, X (Twitter) ilə launch"),
  bullet("Erkən qiymət: ilk 100 istifadəçi $6/ay forever (Canva $14.99)"),

  h3("Gəlir proqnozu (mühafizəkar)"),
  fullWidthTable([
    headerRow(["Ay", "Sign-up", "Free", "Pro", "MRR"]),
    dataRow(["Ay 2 (Beta)", "200", "180", "20 ($6)", "$120"]),
    dataRow(["Ay 3", "800", "720", "80 ($6-12)", "$700"]),
    dataRow(["Ay 4", "2,000", "1,800", "200", "$2,000"]),
    dataRow(["Ay 6", "8,000", "7,200", "800", "$8,500"]),
    dataRow(["Ay 9", "25,000", "22,500", "2,500", "$28,000"]),
    dataRow(["Ay 12", "60,000", "53,000", "7,000", "$78,000"]),
  ]),
  callout(
    "Bu cədvəl 11-13% Free→Pro çevrilmə nisbəti ilə hesablanıb (sənaye standartı: SaaS 2-5%, dizayn alətləri 5-8%, niş alətlər 10-15%). AdVexa AI feature-larla bu nisbəti yüksəldə bilər.",
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 8. Global expansion ----------
blocks.push(
  h1("8. Qlobal Genişlənmə Planı"),
  p(
    "Qlobal düşmək üçün 3 mərhələli yanaşma: Tier 1 (ilk 6 ay), Tier 2 (6-12 ay), Tier 3 (12+ ay).",
  ),

  h3("Tier 1: Sürətli qələbə bazarları (Ay 1-6)"),
  p("Yüksək internet penetrasiyası + ingilis dili bilgisi + ödəniş asanlığı:"),
);

const tier1 = [
  ["Türkiyə", "85M", "Sürətli, Iyzico ödəniş, Azərbaycana yaxın, marketing güclü", "Erkən fokus — ana bazar"],
  ["Rusiya & MDB", "200M", "Dizayn bazarı böyük, Canva geri çəkildi (2022)", "MIR/Yandex.Pay, RU lokalizasiya"],
  ["MENA (UAE, Saudi)", "60M", "Premium qiymət tolerasiyası yüksək, ərəbcə marketing artır", "Ərəb dili, sağdan-sola RTL UI"],
  ["Hindistan", "1.4B", "Sürətli artan SaaS, ucuz ARPU amma volume çox", "UPI ödəniş, lokal dillər (Hindi, Bengali)"],
  ["Şərqi Avropa (PL, RO, UA)", "100M", "Texnik istifadəçilər çox, AB ödənişləri", "EUR + RON/PLN qəbulu"],
];
blocks.push(
  fullWidthTable([
    headerRow(["Bazar", "Əhali", "Niyə yaxşı", "Tələblər"]),
    ...tier1.map((r) => dataRow(r, { boldFirst: false })),
  ]),
);

blocks.push(
  h3("Tier 2: Genişlənmə (Ay 6-12)"),
);

const tier2 = [
  ["LATAM (Brazil, Mexico)", "300M", "Sürətli artan dijital marketing, ucuz ARPU", "Mercado Pago, PT/ES dili"],
  ["Cənubi Şərqi Asiya (ID, PH, VN, TH)", "650M", "Mobil-first, sosial media istifadəçiləri çox", "Lokal ödəniş (GoPay, GCash)"],
  ["AB (Almaniya, Fransa, İspaniya)", "200M", "Yüksək ARPU, brand-conscious", "GDPR full compliance, DE/FR/ES lokalizasiya"],
  ["Şimali Amerika (US, Canada)", "370M", "Ən böyük SaaS bazarı, lakin ən rəqabətli", "Marketing investitsiya, brand recognition"],
];
blocks.push(
  fullWidthTable([
    headerRow(["Bazar", "Əhali", "Niyə vacib", "Tələblər"]),
    ...tier2.map((r) => dataRow(r, { boldFirst: false })),
  ]),
);

blocks.push(
  h3("Tier 3: Sənaye liderliyi (Ay 12+)"),
  bullet("Çin — Alipay/WeChat Pay, mandarin lokalizasiya, lokal partnyor zəruri"),
  bullet("Yaponiya — premium ARPU, lakin keyfiyyət gözləntisi yüksək"),
  bullet("Cənubi Koreya — Naver SEO, KakaoPay"),
  bullet("Afrika (Nigeria, Kenya, Cənubi Afrika) — sürətli mobile growth"),

  h3("Hər bazar üçün giriş checklist"),
  numbered("Dil lokalizasiyası (UI + 50 priority template metadata + marketing landing)"),
  numbered("Lokal ödəniş metodu (Stripe + lokal gateway)"),
  numbered("Vergi compliance (VAT/GST registration)"),
  numbered("Mədəni adaptasiya (template-lər bazara uyğun rəng/şəkil)"),
  numbered("Lokal influencer/creator partnyorluqları (10-20 nəfər)"),
  numbered("SEO-optimized landing page lokal dildə"),
  numbered("Discord/Telegram lokal community"),
  numbered("Support — minimum 12 saat coverage o regionda"),

  h3("Bazar girişi xərcləri (təxmini)"),
  fullWidthTable([
    headerRow(["Bazar (Tier 1)", "İlk ay xərc", "İlk 6 ay xərc", "Break-even (təxmini)"]),
    dataRow(["Türkiyə", "$3,000", "$25,000", "Ay 3"]),
    dataRow(["Rusiya & MDB", "$5,000", "$40,000", "Ay 4"]),
    dataRow(["MENA", "$8,000", "$60,000", "Ay 6"]),
    dataRow(["Hindistan", "$10,000", "$80,000", "Ay 8 (volume)"]),
    dataRow(["Şərqi Avropa", "$4,000", "$35,000", "Ay 5"]),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 9. Custom SQL architecture ----------
blocks.push(
  h1("9. Texniki Arxitektura — Custom SQL Stack"),
  p(
    "İstifadəçi qərarı: öz SQL infrastrukturumuzu quracağıq (Supabase deyil). Bu daha çox iş, lakin tam kontrol və xərc effektivliyi verir.",
  ),

  h3("Texnologiya seçimi"),
  fullWidthTable([
    headerRow(["Komponent", "Texnologiya", "Niyə"]),
    dataRow(["Database", "PostgreSQL 16", "JSON dəstəyi, full-text search, GIN index, row-level security mümkün"]),
    dataRow(["ORM", "Drizzle ORM", "Type-safe, sürətli, Prisma-dan yüngül, migration sistemi yaxşı"]),
    dataRow(["API", "Next.js Route Handlers + tRPC (opsional)", "Mövcud Next.js-də inteqrasiya, type safety"]),
    dataRow(["Auth", "Better-Auth (və ya Lucia)", "Self-hosted, açıq mənbə, OAuth + email + magic link dəstəyi"]),
    dataRow(["Job Queue", "BullMQ + Redis", "AI generation, image processing, email kimi async işlər"]),
    dataRow(["Storage", "Cloudflare R2 (S3-uyğun)", "Egress free, ucuz, S3 API-uyğun"]),
    dataRow(["CDN", "Cloudflare", "Free tier yaxşı, edge caching, DDoS protection"]),
    dataRow(["Payments", "Stripe + Stripe Connect", "Marketplace üçün split payments, tax automation"]),
    dataRow(["Email", "Resend (və ya Postmark)", "Modern API, deliverability yaxşı"]),
    dataRow(["Real-time", "Socket.io və ya Pusher Channels", "Real-time collab + presence"]),
    dataRow(["AI Text", "Anthropic Claude API", "Yüksək keyfiyyət, prompt caching ARPU üçün"]),
    dataRow(["AI Image", "Replicate (Flux 1.1 Pro) və ya fal.ai", "Sürətli, ucuz, çoxlu model dəstəyi"]),
    dataRow(["Search", "Postgres FTS (start) → Algolia (scale)", "Free başla, gəlir gələndə Algolia-ya keç"]),
    dataRow(["Analytics", "PostHog (self-hosted)", "Open source, GDPR-compliant"]),
    dataRow(["Error tracking", "Sentry", "Standard"]),
    dataRow(["Deployment", "Vercel (frontend) + Hetzner (db)", "Edge frontend + ucuz dedicated DB"]),
  ]),

  h3("Database schema (yüksək səviyyə)"),
  bullet("users — id, email, name, plan, locale, created_at, stripe_customer_id"),
  bullet("workspaces — id, owner_id, name, slug, brand_kit (jsonb)"),
  bullet("workspace_members — workspace_id, user_id, role (owner/admin/editor/viewer)"),
  bullet("documents — id, workspace_id, title, canvas_size, layers (jsonb), thumbnail_url, created_at"),
  bullet("document_versions — id, document_id, snapshot (jsonb), created_at"),
  bullet("templates — id, name, category, tier (free/pro), document (jsonb), thumbnail_url, downloads, rating"),
  bullet("template_categories — id, name, slug, parent_id"),
  bullet("assets — id, workspace_id, type, url, size, metadata (jsonb)"),
  bullet("ai_jobs — id, user_id, type, prompt, result, status, cost"),
  bullet("subscriptions — id, user_id, stripe_subscription_id, plan, status, period_end"),
  bullet("usage_metrics — user_id, month, ai_credits_used, exports_count, storage_bytes"),

  h3("Marketplace schema (Ay 9-cı faza)"),
  bullet("creator_profiles — user_id, display_name, bio, payout_method, stripe_connect_account_id"),
  bullet("listings — id, creator_id, template_id, price_cents, currency, license_type (single/multi/commercial), status"),
  bullet("purchases — id, buyer_id, listing_id, paid_cents, platform_fee_cents, creator_payout_cents, created_at"),
  bullet("payouts — id, creator_id, amount_cents, stripe_payout_id, status, period"),
  bullet("reviews — id, purchase_id, rating (1-5), comment, created_at"),

  h3("İnfrastruktur xərcləri (təxmini)"),
  fullWidthTable([
    headerRow(["Mərhələ", "İstifadəçi", "Aylıq xərc", "Detail"]),
    dataRow(["Beta", "<1,000", "$60", "Hetzner CPX21 + R2 free tier"]),
    dataRow(["Launch", "10,000", "$300", "Hetzner CCX22 + R2 + Cloudflare Pro"]),
    dataRow(["Growth", "100,000", "$2,500", "Dedicated DB cluster + Redis + AI API"]),
    dataRow(["Scale", "1,000,000", "$15,000", "Multi-region DB + CDN + sponsored AI"]),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 10. Roadmap ----------
blocks.push(
  h1("10. 18-Aylıq Roadmap"),

  fullWidthTable([
    headerRow(["Faza", "Aylar", "Əsas çatdırılma", "Beklənən nəticə"]),
    dataRow([
      "Phase 0 — Foundation",
      "1-2",
      "Custom SQL backend, auth, cloud documents, Stripe checkout",
      "Pul almağa hazır texnologiya",
    ]),
    dataRow([
      "Phase 1 — Revenue MVP",
      "2-3",
      "60+ premium template, AI text gen, paid Pro tier, Magic Resize MVP",
      "İlk MRR ($500-2,000)",
    ]),
    dataRow([
      "Phase 2 — Magic Resize + 200 Templates",
      "3-5",
      "30 standart ad sizes + anchor-based auto-layout + 200 template",
      "Canva-vari core complete",
    ]),
    dataRow([
      "Phase 3 — AI Image & Variants",
      "5-7",
      "AI background gen, BG remove, variant explosion (1→20), Brand Kit",
      "AI niş liderliyi, Pro conversion artımı",
    ]),
    dataRow([
      "Phase 4 — Animation/GIF",
      "7-9",
      "Timeline UI, Konva Tween, GIF/MP4 export, HTML5 ad bundle",
      "Creatopy-ni keçmə",
    ]),
    dataRow([
      "Phase 5 — Marketplace",
      "9-12",
      "Creator dashboard, Stripe Connect, licenses, 30% komissiya",
      "Network effect başlayır, MRR $50K+",
    ]),
    dataRow([
      "Phase 6 — Global Tier 1",
      "12-14",
      "5 dil (EN+TR+RU+AR+ES), lokal ödəniş, regional template",
      "MRR 3-4x artım",
    ]),
    dataRow([
      "Phase 7 — Ad Platform Publish",
      "14-16",
      "Meta/Google Ads OAuth + direct publish + performance fetch",
      "AdCreative.ai-ı keçmə",
    ]),
    dataRow([
      "Phase 8 — Collaboration & Enterprise",
      "16-18",
      "Yjs real-time, comments, version history, SSO, audit log",
      "Enterprise tier launch, $1M ARR",
    ]),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 11. Risk ----------
blocks.push(
  h1("11. Risk Analizi"),

  fullWidthTable([
    headerRow(["Risk", "Ehtimal", "Təsir", "Mitigation"]),
    dataRow([
      "Canva bizim niş-i kopyaladı",
      "Orta",
      "Yüksək",
      "Sürətlə hərəkət, AI keyfiyyəti, creator economy moat",
    ]),
    dataRow([
      "AI generation xərcləri ARPU-nu yeyir",
      "Yüksək",
      "Orta",
      "Anthropic prompt caching, per-user credit limitləri, AI Pro tier",
    ]),
    dataRow([
      "Yüksək rəqabətli SaaS bazarı",
      "Yüksək",
      "Yüksək",
      "Niş fokus (ad creative), AdCreative.ai-dan üstün UX",
    ]),
    dataRow([
      "Lokal compliance (GDPR cərimələri)",
      "Aşağı",
      "Çox yüksək",
      "GDPR-day-one design, Privacy Policy, DPO, Cookiebot",
    ]),
    dataRow([
      "Creator marketplace çatdırmamaq",
      "Orta",
      "Yüksək",
      "İlk 100 creator-a 50% subsidiya, hand-pick quality",
    ]),
    dataRow([
      "Stripe Connect approval gecikməsi",
      "Aşağı",
      "Yüksək",
      "Ay 6-da başlat (Ay 9-da launch), Lemon Squeezy fallback",
    ]),
    dataRow([
      "Komandanın kiçik olması",
      "Yüksək",
      "Yüksək",
      "Phase 2-də 2 nəfər back-end, Phase 4-də designer + marketing",
    ]),
    dataRow([
      "Canva-ya satılmaq təklifi",
      "Aşağı",
      "Çox yüksək (müsbət)",
      "Strateji opsiya — $5M+ ARR-da düşünmək",
    ]),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 12. KPI ----------
blocks.push(
  h1("12. KPI-lər & Uğur Metrikası"),

  h3("Şimal ulduzu metrikası"),
  callout(
    "İllik aktiv kommersial istifadəçilər (paid + free with export) — bu metrika bizim hekayəni ən düzgün təsvir edir.",
  ),

  h3("Birinci dərəcəli KPI-lər"),
  fullWidthTable([
    headerRow(["KPI", "Ay 3 hədəf", "Ay 6 hədəf", "Ay 12 hədəf", "Ay 18 hədəf"]),
    dataRow(["MAU", "500", "5K", "60K", "200K"]),
    dataRow(["Paid users", "50", "500", "7,000", "25,000"]),
    dataRow(["MRR", "$700", "$8.5K", "$78K", "$300K+"]),
    dataRow(["Free→Pro conversion", "10%", "10-12%", "12-15%", "12-15%"]),
    dataRow(["Churn (aylıq)", "<8%", "<5%", "<3%", "<3%"]),
    dataRow(["Activation rate", "40%", "55%", "65%", "70%"]),
    dataRow(["NPS", ">30", ">40", ">50", ">60"]),
  ]),

  h3("İkinci dərəcəli KPI-lər"),
  bullet("Dizaynların orta export sayı / istifadəçi / ay"),
  bullet("AI generation aktivasiya nisbəti (% istifadəçi AI-ı istifadə edir)"),
  bullet("Template population (creator-lar tərəfindən əlavə)"),
  bullet("Marketplace GMV (Gross Merchandise Value)"),
  bullet("Average revenue per creator"),
  bullet("Time-to-first-export (yeni istifadəçi)"),
  bullet("Browser/mobile/tablet dağılımı"),
  bullet("Top template kategoriyaları"),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- 13. Conclusion ----------
blocks.push(
  h1("13. Nəticə və Növbəti Addımlar"),

  p(
    "AdVexa hazırda gücü güclü editor texnologiyasına və müasir UI-yə əsaslanan startup mərhələsindədir. Canva-ı tamamən əvəzləmək hədəfi real deyil — lakin reklam yaratma niş bazarında AI-native lider olmaq tamamilə əldə edilə bilər.",
  ),

  h3("Üç dərhal qərar"),
  numbered("Phase 0 üçün backend yığmağa BAŞLA (Postgres + Drizzle + Better-Auth + Stripe) — bu, hər şey üçün ön-şərtdir."),
  numbered("Stitch MCP ilə paralel olaraq 200 template generate et — Phase 2-də hazır olsun."),
  numbered("Beta launch list-i bu gün açıq qoy — landing page-də email capture, ilk 100 nəfər üçün lifetime deal."),

  h3("İlk 90 günlük məhsul artıqlığı"),
  bullet("Ay 1: Backend foundation + auth + cloud documents"),
  bullet("Ay 2: Stripe + premium gating + 60 premium template + AI text gen"),
  bullet("Ay 3: Beta launch (100 user), ilk MRR ($500-2,000)"),

  h3("12 aylıq hədəf"),
  callout(
    "Ay 12: 60,000 MAU, 7,000 paid, $78K MRR, 5 dildə UI, marketplace live, ilk 200K USD ARR. Bu vaxtdan Series A seed (1-2M USD) investisiyaya hazır olarıq.",
  ),

  h3("18 aylıq hədəf"),
  callout(
    "Ay 18: 200K MAU, 25,000 paid, $300K MRR, $1M+ ARR. Beynəlxalq əməliyyat (5+ ölkə), AdCreative.ai-ın bazar payını yarmış, Canva-ya satılmaq və ya Series A ($5-10M) opsiyaları açıqdır.",
  ),

  p("Sənəd sonu. Müzakirə və düzəlişlər üçün açıqdır.", { italics: true, color: COLOR.ink2 }),
);

// ============================================================
//  BUILD DOCUMENT
// ============================================================
const doc = new Document({
  creator: "AdVexa Strategy",
  title: "AdVexa — Beynəlxalq Bazar Analizi & Monetizasiya Strategiyası",
  description:
    "Competitive analysis vs Canva, Adobe Express, Figma, Creatopy + monetization timeline + global expansion playbook.",
  numbering: {
    config: [
      {
        reference: "default-numbering",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "%1.",
            alignment: AlignmentType.START,
            style: {
              paragraph: { indent: { left: 360, hanging: 260 } },
            },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT },
          margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "AdVexa Strategy · Confidential",
                  size: 18,
                  color: COLOR.ink2,
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Səhifə ", size: 18, color: COLOR.ink2 }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: COLOR.ink2,
                }),
                new TextRun({ text: " / ", size: 18, color: COLOR.ink2 }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 18,
                  color: COLOR.ink2,
                }),
              ],
            }),
          ],
        }),
      },
      children: blocks,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
await writeFile(OUT, buffer);
console.log(`OK: wrote ${OUT} (${buffer.length} bytes)`);
