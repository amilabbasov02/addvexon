<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:x="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="az">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>addvoxen — Sitemap</title>
        <style>
          *{box-sizing:border-box}
          body{margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
          .wrap{max-width:1100px;margin:0 auto;padding:32px 20px}
          .head{display:flex;align-items:center;gap:12px;margin-bottom:6px}
          .mark{width:34px;height:34px;border-radius:10px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px}
          h1{font-size:22px;font-weight:800;margin:0;letter-spacing:-.02em}
          .sub{color:#64748b;font-size:14px;margin:2px 0 22px}
          .count{display:inline-block;background:#eef2ff;color:#6366f1;font-weight:700;border-radius:999px;padding:2px 10px;font-size:12px;margin-left:8px}
          table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-size:14px}
          th{text-align:left;background:#f1f5f9;color:#475569;font-weight:600;padding:11px 14px;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
          td{padding:11px 14px;border-top:1px solid #f1f5f9;vertical-align:middle}
          tr:hover td{background:#fafbff}
          a{color:#4f46e5;text-decoration:none;font-weight:500}
          a:hover{text-decoration:underline}
          .lang{display:inline-block;background:#f1f5f9;color:#475569;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700;margin-right:4px}
          .pr{font-variant-numeric:tabular-nums;color:#64748b}
          .muted{color:#94a3b8;font-size:12px}
          footer{margin-top:18px;color:#94a3b8;font-size:12px}
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="head">
            <span class="mark">a</span>
            <h1>addvoxen — Sitemap
              <span class="count"><xsl:value-of select="count(s:urlset/s:url)" /> URL</span>
            </h1>
          </div>
          <p class="sub">Bu səhifə axtarış sistemləri üçündür. Hər ünvanın AZ / EN / RU versiyaları (hreflang) var.</p>
          <table>
            <tr>
              <th>#</th>
              <th>Ünvan</th>
              <th>Dillər</th>
              <th>Dəyişmə</th>
              <th>Prioritet</th>
              <th>Son yenilənmə</th>
            </tr>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td class="muted"><xsl:value-of select="position()" /></td>
                <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                <td>
                  <xsl:for-each select="x:link[@hreflang!='x-default']">
                    <span class="lang"><xsl:value-of select="@hreflang" /></span>
                  </xsl:for-each>
                </td>
                <td class="muted"><xsl:value-of select="s:changefreq" /></td>
                <td class="pr"><xsl:value-of select="s:priority" /></td>
                <td class="muted"><xsl:value-of select="substring(s:lastmod,1,10)" /></td>
              </tr>
            </xsl:for-each>
          </table>
          <footer>addvoxen.com · sitemap.xml</footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
