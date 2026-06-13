/**
 * Tenant public saytının render route-u.
 *
 * middleware tenant hostlarını (subdomen/custom domen) `/sites/...` yoluna
 * rewrite edir. Host-dan tenant tapılır, ZİYARƏTÇİNİN DİLİ təyin olunur
 * (cookie → bölgə/geo → default), uyğun dildə məzmun + tema render olunur.
 *
 * `[[...slug]]` optional catch-all — slug-a görə uyğun səhifə (multipage).
 */
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { resolveTenantByHost } from "@/lib/tenant";
import { SiteRenderer } from "@/components/site-render/SiteRenderer";
import { Integrations } from "@/components/site-render/Integrations";
import {
  isLocalizedBundle,
  pickLocaleContent,
  LOCALES,
  type Locale,
  type SiteContent,
  type SiteTheme,
} from "@/lib/site-content";
import { resolveLocale, SITE_LOCALE_COOKIE } from "@/lib/site-locale";

export const dynamic = "force-dynamic";

async function getHost(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-host") ?? h.get("host");
}

/** Ziyarətçinin dilini təyin edir və həmin dildə məzmunu qaytarır. */
async function localeContext(raw: unknown) {
  const c = await cookies();
  const h = await headers();
  const available = isLocalizedBundle(raw)
    ? (LOCALES.filter((l) => raw.locales[l]) as Locale[])
    : [];
  const defaultLocale = isLocalizedBundle(raw) ? raw.defaultLocale ?? null : null;
  const locale = resolveLocale({
    cookie: c.get(SITE_LOCALE_COOKIE)?.value,
    country: h.get("x-vercel-ip-country"),
    available,
    defaultLocale,
  });
  return pickLocaleContent(raw, locale); // { content, available, locale }
}

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveTenantByHost(await getHost());
  if (!resolved) return { title: "Sayt tapılmadı" };

  const { content } = await localeContext(resolved.content?.content);
  const theme = (resolved.content?.theme ?? {}) as SiteTheme;
  const title = content?.siteName ?? resolved.tenant.name;
  const verification: Metadata["verification"] = {};
  if (resolved.integrations?.googleVerification)
    verification.google = resolved.integrations.googleVerification;
  if (resolved.integrations?.metaVerification)
    verification.other = { "facebook-domain-verification": resolved.integrations.metaVerification };

  return {
    title: { absolute: title },
    icons: theme.faviconUrl ? { icon: theme.faviconUrl } : undefined,
    verification,
    robots: { index: true, follow: true },
  };
}

export default async function TenantSitePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const pageSlug = (slug ?? []).join("/");
  const resolved = await resolveTenantByHost(await getHost());

  if (!resolved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-slate-700">
        <h1 className="text-2xl font-bold">Sayt tapılmadı</h1>
        <p className="mt-3 max-w-md text-slate-500">
          Bu ünvanda aktiv sayt yoxdur və ya hələ aktivləşdirilməyib.
        </p>
      </div>
    );
  }

  const { content, available, locale } = await localeContext(resolved.content?.content);
  const theme = (resolved.content?.theme ?? {}) as SiteTheme;
  const gtm = resolved.integrations?.gtmContainerId?.replace(/[^A-Za-z0-9_-]/g, "");

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Məzmun hazırlanmayıb.
      </div>
    );
  }

  return (
    <>
      {gtm && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>
      )}
      <Integrations integrations={resolved.integrations} />
      <SiteRenderer
        content={content as SiteContent}
        theme={theme}
        slug={pageSlug}
        locales={available}
        currentLocale={locale}
      />
    </>
  );
}
