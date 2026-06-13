import { headers } from "next/headers";
import { parseHost } from "@/lib/tenant-host";
import { SITE_URL } from "@/lib/seo";

/**
 * HOST-AWARE robots.
 *  - Tenant hostu (müştəri saytı): tam crawl + ÖZ sitemap-ı/host-u.
 *  - Platforma (addvoxen.com): admin/api/panel və s. gizli.
 *
 * Qeyd: `/sites` daxili rewrite yoludur, real public URL deyil — ona görə
 * disallow siyahısında lazım deyil (əvvəlki səhv düzəldildi).
 */
export default async function robots() {
  const host = (await headers()).get("host") ?? "";
  const proto = host.startsWith("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const parsed = parseHost(host);

  if (parsed.kind === "tenant") {
    const base = `${proto}://${host}`;
    return {
      rules: [{ userAgent: "*", allow: ["/"] }],
      sitemap: `${base}/sitemap.xml`,
      host: base,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/admin", "/admin/", "/panel", "/panel/", "/dashboard", "/editor", "/editor/", "/checkout", "/settings", "/settings/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
