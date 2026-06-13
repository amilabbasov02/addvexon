"use client";

/**
 * Müştəri admin redaktoru — TAM məzmun redaktoru (CMS).
 * Hər səhifənin hər bölməsinin BÜTÜN sahələri redaktə olunur: mətnlər,
 * şəkillər (yüklə), massiv elementləri (xidmət/məhsul/menyu/qalereya/statistika
 * əlavə et/sil). Çoxdilli (AZ/RU/EN). Paylaşılan: logo, rənglər, inteqrasiya, domen.
 */
import { useMemo, useState } from "react";
import {
  LOCALES, LOCALE_LABELS, isLocalizedBundle,
  type Locale, type SiteContent, type SiteTheme,
} from "@/lib/site-content";
import { ImageUpload } from "./ImageUpload";

type Integrations = { ga4Id: string; gtmContainerId: string; metaPixelId: string; googleVerification: string; metaVerification: string };
type Bundle = { defaultLocale: Locale; locales: Partial<Record<Locale, SiteContent>> };
type AnySection = Record<string, any>;

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

function normalize(raw: unknown): Bundle {
  if (isLocalizedBundle(raw)) return clone(raw) as Bundle;
  if (raw && typeof raw === "object" && "pages" in raw) return { defaultLocale: "az", locales: { az: clone(raw) as SiteContent } };
  return { defaultLocale: "az", locales: { az: { design: "care", siteName: "", pages: [] } } };
}

const SECTION_LABEL: Record<string, string> = {
  hero: "Əsas bölmə (Hero)", features: "Xidmətlər / Üstünlüklər", about: "Haqqında",
  gallery: "Qalereya", contact: "Əlaqə", cta: "Çağırış (CTA)", menu: "Menyu",
  stats: "Statistika", products: "Məhsullar",
};

const TABS = [
  { key: "content", label: "Məzmun", icon: "edit_note" },
  { key: "design", label: "Dizayn", icon: "palette" },
  { key: "integrations", label: "İnteqrasiyalar", icon: "analytics" },
  { key: "domain", label: "Domen", icon: "language" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function PanelEditor(props: {
  tenantId: string; subdomain?: string; name: string; customDomain: string | null;
  content: unknown; theme: SiteTheme; integrations: Integrations;
}) {
  const [bundle, setBundle] = useState<Bundle>(() => normalize(props.content));
  const available = useMemo(() => LOCALES.filter((l) => bundle.locales[l]) as Locale[], [bundle]);
  const [locale, setLocale] = useState<Locale>(available[0] ?? "az");
  const [pageIdx, setPageIdx] = useState(0);
  const [tab, setTab] = useState<TabKey>("content");

  const [name, setName] = useState(props.name);
  const [customDomain, setCustomDomain] = useState(props.customDomain ?? "");
  const [logoUrl, setLogoUrl] = useState(props.theme.logoUrl ?? "");
  const [colors, setColors] = useState({
    primary: props.theme.colors?.primary ?? "#6366f1", bg: props.theme.colors?.bg ?? "#ffffff",
    surface: props.theme.colors?.surface ?? "#f8fafc", text: props.theme.colors?.text ?? "#0f172a", muted: props.theme.colors?.muted ?? "#64748b",
  });
  const [ig, setIg] = useState<Integrations>(props.integrations);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cur = bundle.locales[locale];
  const pages = cur?.pages ?? [];
  const page = pages[pageIdx] ?? pages[0];
  const sections: AnySection[] = (page?.sections as AnySection[]) ?? [];

  function mutateSection(si: number, fn: (s: AnySection) => void) {
    setBundle((b) => {
      const nb = clone(b);
      const sec = nb.locales[locale]!.pages[pageIdx].sections[si] as AnySection;
      fn(sec);
      return nb;
    });
  }
  function setSiteName(v: string) {
    setBundle((b) => { const nb = clone(b); nb.locales[locale]!.siteName = v; return nb; });
  }

  async function save() {
    setSaving(true); setMsg(null);
    const theme: SiteTheme = { ...props.theme, colors, logoUrl: logoUrl || undefined };
    try {
      const res = await fetch(`/api/panel/${props.tenantId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, customDomain, content: bundle, theme, integrations: ig }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setMsg({ ok: true, text: "Yadda saxlanıldı ✓" });
    } catch { setMsg({ ok: false, text: "Xəta baş verdi" }); }
    finally { setSaving(false); }
  }

  const previewUrl = props.subdomain ? `http://${props.subdomain}.localhost:3000` : undefined;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:flex-col">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={"flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors " + (tab === t.key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="pb-28">
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3 text-sm">
            {previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900"><span className="material-symbols-outlined text-base">open_in_new</span> Saytı aç</a>}
            {msg && <span className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</span>}
          </div>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            <span className="material-symbols-outlined text-base">save</span>{saving ? "Saxlanılır…" : "Yadda saxla"}
          </button>
        </div>

        {tab === "content" && (
          <div className="space-y-5">
            {/* Dil + Sayt adı */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {available.length > 1 && (
                <div className="flex items-center gap-1">
                  <span className="px-1 text-sm text-slate-400">Dil:</span>
                  {available.map((l) => (
                    <button key={l} onClick={() => setLocale(l)} className={"rounded-lg px-3 py-1.5 text-sm font-semibold " + (l === locale ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100")}>{LOCALE_LABELS[l]}</button>
                  ))}
                </div>
              )}
              <label className="flex flex-1 items-center gap-2">
                <span className="text-sm text-slate-400">Sayt adı:</span>
                <input className={inp} value={cur?.siteName ?? ""} onChange={(e) => setSiteName(e.target.value)} />
              </label>
            </div>

            {/* Səhifə seçimi (multipage) */}
            {pages.length > 1 && (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                {pages.map((p: any, i: number) => (
                  <button key={i} onClick={() => setPageIdx(i)} className={"rounded-lg px-3.5 py-2 text-sm font-medium " + (i === pageIdx ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                    {p.title || (p.slug === "" ? "Ana səhifə" : p.slug)}
                  </button>
                ))}
              </div>
            )}

            {/* Bölmələr */}
            {sections.length === 0 && <Card title="Məzmun"><p className="text-sm text-slate-400">Bölmə yoxdur.</p></Card>}
            {sections.map((s, si) => (
              <SectionEditor key={si} section={s} index={si} mutate={(fn) => mutateSection(si, fn)} />
            ))}
          </div>
        )}

        {tab === "design" && (
          <Card title="Dizayn">
            <ImageUpload label="Logo" value={logoUrl} onChange={setLogoUrl} rounded hint="PNG/SVG. Boş olsa, sayt adı mətn kimi görünər." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ColorField label="Əsas (vurğu)" value={colors.primary} onChange={(v) => setColors({ ...colors, primary: v })} />
              <ColorField label="Fon" value={colors.bg} onChange={(v) => setColors({ ...colors, bg: v })} />
              <ColorField label="Bölmə fonu" value={colors.surface} onChange={(v) => setColors({ ...colors, surface: v })} />
              <ColorField label="Mətn" value={colors.text} onChange={(v) => setColors({ ...colors, text: v })} />
              <ColorField label="İkinci mətn" value={colors.muted} onChange={(v) => setColors({ ...colors, muted: v })} />
            </div>
          </Card>
        )}

        {tab === "integrations" && (
          <Card title="İnteqrasiyalar" subtitle="Yalnız ID — özbaşına skript dəstəklənmir (təhlükəsizlik).">
            <Txt label="Google Analytics 4 (GA4 ID)" value={ig.ga4Id} onChange={(v) => setIg({ ...ig, ga4Id: v })} placeholder="G-XXXXXXX" />
            <Txt label="Google Tag Manager (GTM ID)" value={ig.gtmContainerId} onChange={(v) => setIg({ ...ig, gtmContainerId: v })} placeholder="GTM-XXXXXX" />
            <Txt label="Meta Pixel ID" value={ig.metaPixelId} onChange={(v) => setIg({ ...ig, metaPixelId: v })} />
            <Txt label="Google verification" value={ig.googleVerification} onChange={(v) => setIg({ ...ig, googleVerification: v })} />
          </Card>
        )}

        {tab === "domain" && (
          <Card title="Domen">
            <Txt label="Öz domeniniz" value={customDomain} onChange={setCustomDomain} placeholder="misal.az" hint="A/CNAME ilə yönləndirin. Təsdiqdən sonra aktivləşir." />
            {props.subdomain && <p className="text-sm text-slate-500">Subdomen: <b>{props.subdomain}.addvoxen.com</b></p>}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Bölmə redaktoru (tip üzrə) ── */
function SectionEditor({ section, index, mutate }: { section: AnySection; index: number; mutate: (fn: (s: AnySection) => void) => void }) {
  const t = section.type as string;
  const title = `${index + 1}. ${SECTION_LABEL[t] ?? t}`;
  const setF = (k: string) => (v: string) => mutate((s) => { s[k] = v; });

  return (
    <Card title={title}>
      {(t === "hero" || t === "cta") && <>
        <Txt label="Başlıq" value={section.heading ?? ""} onChange={setF("heading")} />
        <Txt label="Alt mətn" area value={section.subheading ?? ""} onChange={setF("subheading")} />
        <Txt label="Düymə mətni" value={section.ctaText ?? ""} onChange={setF("ctaText")} />
        <Txt label="Düymə linki" value={section.ctaUrl ?? ""} onChange={setF("ctaUrl")} />
        {t === "hero" && <ImageUpload label="Əsas şəkil" value={section.imageUrl ?? ""} onChange={(v) => mutate((s) => { s.imageUrl = v || undefined; })} />}
      </>}

      {t === "about" && <>
        <Txt label="Başlıq" value={section.heading ?? ""} onChange={setF("heading")} />
        <Txt label="Mətn" area value={section.body ?? ""} onChange={setF("body")} />
        <ImageUpload label="Şəkil" value={section.imageUrl ?? ""} onChange={(v) => mutate((s) => { s.imageUrl = v || undefined; })} />
      </>}

      {t === "contact" && <>
        <Txt label="Başlıq" value={section.heading ?? ""} onChange={setF("heading")} />
        <Txt label="Telefon" value={section.phone ?? ""} onChange={setF("phone")} />
        <Txt label="E-poçt" value={section.email ?? ""} onChange={setF("email")} />
        <Txt label="Ünvan" value={section.address ?? ""} onChange={setF("address")} />
      </>}

      {(t === "features" || t === "products" || t === "gallery" || t === "stats") && (
        <Txt label="Başlıq" value={section.heading ?? ""} onChange={setF("heading")} />
      )}
      {(t === "features" || t === "products") && (
        <Txt label="Alt başlıq" value={section.subheading ?? ""} onChange={setF("subheading")} />
      )}

      {t === "features" && <ArrayField items={section.items ?? []} blank={{ icon: "star", title: "", text: "" }} mutate={mutate} addLabel="Element əlavə et"
        render={(it, i, up) => <>
          <Txt label="İkon (Material adı)" value={it.icon ?? ""} onChange={(v) => up((x) => { x.icon = v; })} hint="məs. verified, bolt, spa" />
          <Txt label="Başlıq" value={it.title ?? ""} onChange={(v) => up((x) => { x.title = v; })} />
          <Txt label="Mətn" area value={it.text ?? ""} onChange={(v) => up((x) => { x.text = v; })} />
        </>} />}

      {t === "products" && <ArrayField items={section.items ?? []} blank={{ name: "", price: "", imageUrl: "", tag: "" }} mutate={mutate} addLabel="Məhsul əlavə et"
        render={(it, i, up) => <>
          <ImageUpload label="Şəkil" value={it.imageUrl ?? ""} onChange={(v) => up((x) => { x.imageUrl = v; })} />
          <Txt label="Ad" value={it.name ?? ""} onChange={(v) => up((x) => { x.name = v; })} />
          <Txt label="Qiymət" value={it.price ?? ""} onChange={(v) => up((x) => { x.price = v; })} />
          <Txt label="Etiket (tag)" value={it.tag ?? ""} onChange={(v) => up((x) => { x.tag = v; })} />
        </>} />}

      {t === "gallery" && <ArrayField items={section.items ?? []} blank={{ imageUrl: "", caption: "" }} mutate={mutate} addLabel="Şəkil əlavə et"
        render={(it, i, up) => <>
          <ImageUpload label="Şəkil" value={it.imageUrl ?? ""} onChange={(v) => up((x) => { x.imageUrl = v; })} />
          <Txt label="Başlıq (caption)" value={it.caption ?? ""} onChange={(v) => up((x) => { x.caption = v; })} />
        </>} />}

      {t === "stats" && <ArrayField items={section.items ?? []} blank={{ value: "", label: "" }} mutate={mutate} addLabel="Göstərici əlavə et"
        render={(it, i, up) => <div className="grid grid-cols-2 gap-3">
          <Txt label="Rəqəm" value={it.value ?? ""} onChange={(v) => up((x) => { x.value = v; })} />
          <Txt label="Açıqlama" value={it.label ?? ""} onChange={(v) => up((x) => { x.label = v; })} />
        </div>} />}

      {t === "menu" && <ArrayField items={section.groups ?? []} blank={{ name: "", items: [] }} mutate={mutate} itemsKey="groups" addLabel="Qrup əlavə et"
        render={(g, gi, upG) => <>
          <Txt label="Qrup adı" value={g.name ?? ""} onChange={(v) => upG((x) => { x.name = v; })} />
          <NestedItems group={g} upG={upG} />
        </>} />}
    </Card>
  );
}

/** Menyu qrupunun yeməkləri (iç-içə massiv). */
function NestedItems({ group, upG }: { group: AnySection; upG: (fn: (g: AnySection) => void) => void }) {
  const items: AnySection[] = group.items ?? [];
  return (
    <div className="mt-2 space-y-3 rounded-xl bg-slate-50 p-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Txt label="Ad" value={it.name ?? ""} onChange={(v) => upG((g) => { g.items[i].name = v; })} />
            <Txt label="Təsvir" value={it.desc ?? ""} onChange={(v) => upG((g) => { g.items[i].desc = v; })} />
            <Txt label="Qiymət" value={it.price ?? ""} onChange={(v) => upG((g) => { g.items[i].price = v; })} />
          </div>
          <button onClick={() => upG((g) => { g.items.splice(i, 1); })} className="mt-2 text-xs font-medium text-red-600 hover:underline">Sil</button>
        </div>
      ))}
      <button onClick={() => upG((g) => { (g.items ??= []).push({ name: "", price: "" }); })} className="text-sm font-medium text-indigo-600 hover:underline">+ Yemək əlavə et</button>
    </div>
  );
}

/** Ümumi massiv redaktoru (əlavə/sil + hər element üçün render). */
function ArrayField({ items, blank, mutate, render, addLabel, itemsKey = "items" }: {
  items: AnySection[]; blank: AnySection; mutate: (fn: (s: AnySection) => void) => void;
  render: (item: AnySection, i: number, up: (fn: (it: AnySection) => void) => void) => React.ReactNode;
  addLabel: string; itemsKey?: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-4">
          <div className="space-y-3">{render(it, i, (fn) => mutate((s) => { fn(s[itemsKey][i]); }))}</div>
          <button onClick={() => mutate((s) => { s[itemsKey].splice(i, 1); })} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
            <span className="material-symbols-outlined text-sm">delete</span>Sil
          </button>
        </div>
      ))}
      <button onClick={() => mutate((s) => { (s[itemsKey] ??= []).push(clone(blank)); })} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
        <span className="material-symbols-outlined text-base">add</span>{addLabel}
      </button>
    </div>
  );
}

/* ── Kiçik komponentlər ── */
const inp = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
function Txt({ label, value, onChange, area, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {area ? <textarea className={inp} rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={inp} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-slate-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inp} />
      </span>
    </label>
  );
}
