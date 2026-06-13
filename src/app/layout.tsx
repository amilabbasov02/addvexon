import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GlobalHeader } from "@/components/site/GlobalHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LocaleProvider } from "@/components/site/LocaleContext";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { getLang } from "@/lib/platform-locale";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://addvoxen.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "addvoxen — Hazır saytlar marketi + managed hosting",
    template: "%s · addvoxen",
  },
  description:
    "Hazır sayt şablonu seç, ödə, biz host edək. Öz domenini qoş, öz panelindən idarə et — kod yazmadan, dəqiqələr içində canlı sayt.",
  keywords: [
    "hazır sayt",
    "landing page Azərbaycan",
    "sayt şablonları",
    "managed hosting",
    "sayt qurmaq",
    "veb sayt hazırlamaq",
    "domen qoşma",
  ],
  authors: [{ name: "addvoxen" }],
  creator: "addvoxen",
  publisher: "addvoxen",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "addvoxen",
    title: "addvoxen — Hazır saytlar marketi + managed hosting",
    description:
      "Hazır sayt şablonu seç, ödə, biz host edək. Öz domenini qoş, panellə idarə et — kod yazmadan.",
    locale: "az_AZ",
    images: [
      {
        url: `${SITE_URL}/og-cover.png`,
        width: 1200,
        height: 630,
        alt: "addvoxen — hazır saytlar marketi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "addvoxen — Hazır saytlar marketi",
    description:
      "Hazır sayt şablonu seç, ödə, biz host edək — kod yazmadan, dəqiqələr içində canlı.",
    images: [`${SITE_URL}/og-cover.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "Web Hosting & Website Builder",
  applicationName: "addvoxen",
};

/** JSON-LD — Organization + WebSite (yeni məhsul: hazır saytlar marketi). */
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "addvoxen",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@addvoxen.com",
      contactType: "customer support",
      availableLanguage: ["Azerbaijani"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "addvoxen",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/marketplace?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${geist.variable} ${inter.variable} light h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* JSON-LD strukturlu data — Google üçün (hazır saytlar marketi). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full bg-white text-slate-900">
        <LocaleProvider>
          <PageViewTracker />
          <GlobalHeader lang={lang} />
          {children}
          <SiteFooter lang={lang} />
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
