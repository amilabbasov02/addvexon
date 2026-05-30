// Convert Stitch HTML screens → Next.js (App Router) React pages.
// Run: node scripts/convert-stitch.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "stitch-html");
const APP = resolve(ROOT, "src", "app");

/** name -> { route, exportName }
 *
 *  IMPORTANT: only the landing page is auto-generated from Stitch HTML.
 *  Every other route in the app is hand-authored:
 *    /signin, /signup, /forgot-password      → auth UI (Better-Auth)
 *    /dashboard                              → DB-driven "My Designs"
 *    /editor, /editor/pro                    → Konva canvas editor
 *    /marketplace                            → DB-driven template gallery
 *    /pricing                                → waitlist CTAs + Stripe
 *
 *  We removed the auto-generated mock screens (landing-light, analytics,
 *  creative-engine, marketplace-light, mobile variants) because they
 *  duplicated real routes with non-functional mock data and shipped
 *  layout bugs (overflowing max-w containers from the Stitch export).
 */
const MAP = {
  landing: { route: "page.tsx", name: "LandingPage" },
};

// ============================================================
//  Wiring: AdVexa navigation targets keyed by anchor/button label
//  First match wins — order rules from most-specific to most-generic.
// ============================================================
const NAV_LINK_TARGETS = [
  // Home / brand
  { test: /^advexa$/i, href: "/" },
  { test: /^home$/i, href: "/" },

  // Pro editor (must precede generic /editor)
  { test: /^(pro\s+(editor|banner\s+editor)|advexa\s+pro|upgrade(\s+to\s+pro)?)$/i, href: "/editor/pro" },

  // Dashboard
  { test: /^(dashboard|overview|my\s+dashboard|campaigns?|my\s+campaigns?|user\s+hub|profile|account|my\s+account)$/i, href: "/dashboard" },

  // Analytics
  { test: /^(analytics|analytics\s+overview|reports?|insights?|performance)$/i, href: "/analytics" },

  // Marketplace / Templates
  { test: /^(templates?|template\s+marketplace|marketplace|browse(\s+gallery|\s+templates?)?|gallery)$/i, href: "/marketplace" },

  // Creative engine
  { test: /^(creative\s+engine|ai\s+(creative\s+)?engine|generate(\s+with\s+ai)?)$/i, href: "/creative-engine" },

  // Editor / primary creation CTA
  { test: /^(banner\s+editor|editor|new\s+(banner|design|project)|create(\s+new(\s+banner|\s+design)?)?|design\s+now|use\s+template|customize|open\s+editor)$/i, href: "/editor" },
  { test: /^(get\s+started(\s+free)?|start(\s+creating)?(\s+free)?|try(\s+it)?(\s+free)?|try\s+advexa(\s+free)?|launch\s+(advexa|app))$/i, href: "/editor" },

  // Pricing
  { test: /^(pricing|plans?(\s+&?\s*pricing)?|view\s+pricing|see\s+plans?|choose\s+plan|subscribe|upgrade|start\s+(free\s+)?trial|book\s+(a\s+)?demo)$/i, href: "/pricing" },

  // Stubs (no dedicated page yet) — keep as hash so we don't 404
  { test: /^support$/i, href: "#support" },
  { test: /^(docs?|documentation|help(\s+center)?)$/i, href: "#docs" },
  { test: /^(contact|contact\s+(us|sales))$/i, href: "#contact" },
  { test: /^(watch(\s+showcase|\s+demo|\s+video)?|see\s+(demo|showcase|how\s+it\s+works))$/i, href: "#showcase" },
  { test: /^(blog|changelog|careers|about|company|legal|privacy|terms)$/i, href: "#" },

  // Account / session — stubs
  { test: /^(log\s*out|sign\s*out|exit)$/i, href: "#logout" },
  { test: /^(log\s*in|sign\s*in)$/i, href: "#login" },
  { test: /^(sign\s*up|register|create\s+account)$/i, href: "#signup" },
  { test: /^(settings|preferences)$/i, href: "#settings" },
  { test: /^(notifications?|alerts?)$/i, href: "#notifications" },
];

function findNavTarget(label) {
  if (!label) return null;
  const clean = label.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  for (const t of NAV_LINK_TARGETS) {
    if (t.test.test(clean)) return t.href;
  }
  return null;
}

/** Extract visible text from a JSX fragment, stripping tags AND the literal
 *  contents of Material-Symbols icon spans (the icon name is text in HTML
 *  and would otherwise contaminate the visible label, e.g. "leaderboard Analytics"). */
function extractVisibleText(jsx) {
  return jsx
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<span\b[^>]*material-symbols[^>]*>[\s\S]*?<\/span>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const RESERVED_ATTR_MAP = {
  // HTML
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
  enterkeyhint: "enterKeyHint",
  inputmode: "inputMode",
  crossorigin: "crossOrigin",
  srcset: "srcSet",
  srclang: "srcLang",
  colspan: "colSpan",
  rowspan: "rowSpan",
  usemap: "useMap",
  novalidate: "noValidate",
  formnovalidate: "formNoValidate",
  acceptcharset: "acceptCharset",
  itemprop: "itemProp",
  itemtype: "itemType",
  itemid: "itemId",
  itemref: "itemRef",
  itemscope: "itemScope",
  playsinline: "playsInline",
  // SVG presentation attributes that React requires in camelCase
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "stroke-miterlimit": "strokeMiterlimit",
  "fill-rule": "fillRule",
  "fill-opacity": "fillOpacity",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "text-anchor": "textAnchor",
  "dominant-baseline": "dominantBaseline",
  "alignment-baseline": "alignmentBaseline",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "color-profile": "colorProfile",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "letter-spacing": "letterSpacing",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "pointer-events": "pointerEvents",
  "shape-rendering": "shapeRendering",
  "text-rendering": "textRendering",
  "underline-position": "underlinePosition",
  "underline-thickness": "underlineThickness",
  "unicode-bidi": "unicodeBidi",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
  "vector-effect": "vectorEffect",
  "xlink:href": "xlinkHref",
};

/** Camel-case a CSS property name. */
function cssPropToCamel(prop) {
  return prop
    .trim()
    .toLowerCase()
    .replace(/^-(ms|webkit|moz|o)-/, (_, vendor) => {
      // -webkit-foo → WebkitFoo  ;  -ms-foo → msFoo
      const head = vendor === "ms" ? "ms" : vendor.charAt(0).toUpperCase() + vendor.slice(1);
      return head;
    })
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Parse a CSS declaration string into a JS object literal source. */
function inlineStyleToObjectLiteral(styleStr) {
  // Split on `;` but ignore semicolons inside parens (gradients, etc.)
  const parts = [];
  let buf = "";
  let depth = 0;
  for (const ch of styleStr) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      if (buf.trim()) parts.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf);

  const pairs = [];
  for (const part of parts) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const prop = part.slice(0, idx);
    const value = part.slice(idx + 1).trim();
    if (!value) continue;
    const key = cssPropToCamel(prop);
    // Escape backticks/dollar-braces in value for safe interpolation; quote with backticks to allow apostrophes.
    const safe = value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    pairs.push(`${JSON.stringify(key).replace(/"/g, "'") /* keep keys clean */}: \`${safe}\``);
  }
  return `{ ${pairs.join(", ")} }`;
}

/** Tokenize a tag's attribute string and rewrite for JSX. */
function rewriteAttributes(attrs) {
  // Matches:  name="value" | name='value' | name=value | name (boolean)
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'`<>]+)))?/g;
  const out = [];
  let m;
  while ((m = re.exec(attrs)) !== null) {
    const rawName = m[1];
    const dq = m[3];
    const sq = m[4];
    const bare = m[5];
    const value = dq ?? sq ?? bare; // may be undefined (boolean attr)

    let name = rawName;
    const lower = name.toLowerCase();

    // Drop noisy / unused attrs that just bloat JSX (data-alt is descriptive prose for images)
    if (lower === "data-alt") continue;

    // Map reserved names
    if (RESERVED_ATTR_MAP[lower]) {
      name = RESERVED_ATTR_MAP[lower];
    } else if (lower.startsWith("aria-") || lower.startsWith("data-")) {
      name = lower; // pass through as-is
    } else if (/^on[a-z]+$/.test(lower)) {
      // strip inline event handlers — they’re not meaningful in the static mockup
      continue;
    }

    // Static mockup: prefer `defaultValue` over `value` to avoid controlled-input warnings
    if (name === "value") {
      name = "defaultValue";
    } else if (name === "checked") {
      name = "defaultChecked";
    }

    if (value === undefined) {
      out.push(name);
      continue;
    }

    if (name === "style") {
      out.push(`style={${inlineStyleToObjectLiteral(value)}}`);
      continue;
    }

    // Escape `{` and `}` inside string values so JSX doesn’t interpret them.
    const safeValue = value
      .replace(/"/g, "&quot;")
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;");
    out.push(`${name}="${safeValue}"`);
  }
  return out.join(" ");
}

/** Transform an HTML body fragment into a JSX-safe string. */
function htmlToJsx(html) {
  // 1) Strip inline <script> and <style> blocks (handled globally)
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  // 2) Strip the global noise-overlay div (already rendered in root layout)
  html = html.replace(
    /<div\s+class="noise-overlay[^"]*"[^>]*>\s*<\/div>/gi,
    "",
  );

  // 2b) Strip the page-level top <header>...</header> block — the SiteHeader
  // is rendered globally in app/layout.tsx, so leaving the per-page nav would
  // produce a duplicate. (Only the FIRST <header> is removed; in-page article
  // headers, if any, are preserved.)
  html = html.replace(/<header\b[^>]*>[\s\S]*?<\/header>\s*/i, "");

  // 3) HTML comments → JSX comments
  html = html.replace(/<!--([\s\S]*?)-->/g, (_, body) => {
    const safe = body.replace(/\*\//g, "*\\/");
    return `{/*${safe}*/}`;
  });

  // 4) Rewrite tags
  html = html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)(\/?)>/g,
    (match, tag, attrsRaw, selfClose) => {
      const lower = tag.toLowerCase();
      const attrs = rewriteAttributes(attrsRaw || "");
      const sep = attrs ? " " : "";
      if (VOID_ELEMENTS.has(lower)) {
        return `<${tag}${sep}${attrs} />`;
      }
      if (selfClose) {
        return `<${tag}${sep}${attrs} />`;
      }
      return `<${tag}${sep}${attrs}>`;
    },
  );

  // 5) Wire navigation: rewrite anchor href targets and convert CTA <button>s
  // whose label matches a known route into real <a> links so all in-app
  // navigation actually works.
  html = wireNavigation(html);

  return html.trim();
}

/** Replace placeholder `href` values on anchors AND convert CTA buttons
 *  whose visible text matches a NAV_LINK_TARGETS entry into anchor tags. */
function wireNavigation(jsx) {
  // Pass 1: rewrite anchor href based on visible text.
  jsx = jsx.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (match, attrs, inner) => {
    const text = extractVisibleText(inner);
    const target = findNavTarget(text);
    if (!target) return match;
    let newAttrs;
    if (/\shref="[^"]*"/.test(attrs)) {
      newAttrs = attrs.replace(/\shref="[^"]*"/, ` href="${target}"`);
    } else {
      newAttrs = (attrs.trimEnd() + ` href="${target}"`).replace(/^\s+/, " ");
    }
    return `<a${newAttrs}>${inner}</a>`;
  });

  // Pass 2: CTA buttons → anchor. <button> nested inside <a> is invalid DOM,
  // so we *replace* the button with an anchor (carry over className/style) and
  // drop button-only attrs like `type`.
  jsx = jsx.replace(
    /<button\b([^>]*)>([\s\S]*?)<\/button>/g,
    (match, attrs, inner) => {
      const text = extractVisibleText(inner);
      const target = findNavTarget(text);
      if (!target) return match;
      // Strip `type="..."`, `disabled`, etc. that don't apply to anchors.
      const cleaned = attrs
        .replace(/\s+type="[^"]*"/g, "")
        .replace(/\s+disabled\b/g, "")
        .replace(/\s+form="[^"]*"/g, "")
        .replace(/\s+formAction="[^"]*"/g, "");
      const sep = cleaned.trim() ? " " : " ";
      return `<a${sep}${cleaned.trim()} href="${target}" role="button">${inner}</a>`;
    },
  );

  return jsx;
}

function extractBody(raw) {
  const m = raw.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (!m) throw new Error("No <body> found");
  return m[1];
}

function pageTemplate(exportName, jsxBody, themeOverride) {
  const themeAttr = themeOverride
    ? `data-stitch-theme="${themeOverride}"`
    : `data-stitch-theme="dark"`;
  return `// Auto-generated from stitch-html/. Edit the source HTML and rerun
// \`node scripts/convert-stitch.mjs\` if you need to regenerate.
/* eslint-disable @next/next/no-img-element, react/no-unknown-property, @typescript-eslint/no-unused-vars */
import * as React from "react";

export default function ${exportName}() {
  return (
    <div ${themeAttr} className="advexa-stitch-screen">
${indent(jsxBody, 6)}
    </div>
  );
}
`;
}

function indent(text, n) {
  const pad = " ".repeat(n);
  return text
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

async function ensureDir(p) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function convertOne(slug, meta) {
  const srcPath = resolve(SRC, `${slug}.html`);
  const raw = await readFile(srcPath, "utf8");
  const body = extractBody(raw);
  const jsx = htmlToJsx(body);
  const themeOverride = slug.endsWith("theme-toggle") ? "light" : undefined;
  const out = pageTemplate(meta.name, jsx, themeOverride);
  const target = resolve(APP, meta.route);
  await ensureDir(dirname(target));
  await writeFile(target, out, "utf8");
  return { slug, route: meta.route, bytes: out.length };
}

async function main() {
  const results = [];
  for (const [slug, meta] of Object.entries(MAP)) {
    try {
      results.push(await convertOne(slug, meta));
    } catch (err) {
      console.error(`FAIL: ${slug} - ${err.message}`);
    }
  }
  for (const r of results) {
    console.log(`OK: ${r.slug} → ${r.route} (${r.bytes} bytes)`);
  }
  console.log(`\nConverted ${results.length}/${Object.keys(MAP).length} screens.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
