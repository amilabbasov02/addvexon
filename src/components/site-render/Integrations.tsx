/**
 * Tenant analitika/inteqrasiya snippet-ləri.
 *
 * TƏHLÜKƏSİZLİK: müştəri raw <script> verə BİLMƏZ. Burada YALNIZ strukturlu
 * ID-lərdən (GA4 / GTM / Meta Pixel) snippet qururuq. ID-lər format
 * baxımından sanitizasiya olunur ki, inject riski olmasın.
 */
import Script from "next/script";
import type { TenantIntegrations } from "@/db/schema";

/** ID-ləri yalnız gözlənilən simvollara endirir (hərf, rəqəm, tire). */
function safeId(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/[^A-Za-z0-9_-]/g, "");
  return cleaned.length > 0 && cleaned.length <= 40 ? cleaned : null;
}

export function Integrations({
  integrations,
}: {
  integrations: TenantIntegrations | null;
}) {
  if (!integrations) return null;

  const ga4 = safeId(integrations.ga4Id);
  const gtm = safeId(integrations.gtmContainerId);
  const pixel = safeId(integrations.metaPixelId);

  return (
    <>
      {/* Google Tag Manager */}
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {/* Google Analytics 4 */}
      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
