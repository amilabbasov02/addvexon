const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

/**
 * Crawl direktivləri. Public marketinq + marketplace + şablon detalı crawl
 * olunur; admin / API / panel / dashboard / editor / checkout / settings gizli.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/panel",
          "/panel/",
          "/dashboard",
          "/editor",
          "/editor/",
          "/checkout",
          "/settings",
          "/settings/",
          "/sites/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
