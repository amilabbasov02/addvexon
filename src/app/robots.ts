const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

/**
 * Crawl directives. Public marketing + marketplace + banner detail + user
 * profile surfaces are crawlable; admin / API / dashboard / editor are
 * private so we explicitly disallow them.
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
          "/dashboard",
          "/editor",
          "/editor/",
          "/checkout",
          "/settings",
          "/settings/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
