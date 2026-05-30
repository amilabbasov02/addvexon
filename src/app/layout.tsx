import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/components/site/GlobalHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LocaleProvider } from "@/components/site/LocaleContext";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

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
    default: "Addvoxen — AI Creative Suite for ad banners",
    template: "%s · Addvoxen",
  },
  description:
    "Design, AI-generate, magic-resize and export ad banners in seconds. Built for high-growth marketing teams shipping creative across Meta, Google, TikTok and LinkedIn.",
  keywords: [
    "ad banner generator",
    "AI banner design",
    "marketing creative platform",
    "magic resize",
    "html5 banner export",
    "ad creative suite",
    "social media ads",
    "google display ads",
  ],
  authors: [{ name: "Addvoxen" }],
  creator: "Addvoxen",
  publisher: "Addvoxen",
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/en`,
      az: `${SITE_URL}/az`,
      tr: `${SITE_URL}/tr`,
      ru: `${SITE_URL}/ru`,
      es: `${SITE_URL}/es`,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Addvoxen",
    title: "Addvoxen — AI Creative Suite for ad banners",
    description:
      "Design, AI-generate, magic-resize and export ad banners across every platform — in seconds.",
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/og-cover.png`,
        width: 1200,
        height: 630,
        alt: "Addvoxen AI Creative Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addvoxen — AI Creative Suite",
    description:
      "Design, AI-generate, resize and export ad banners across Meta, Google, TikTok, LinkedIn — from one canvas.",
    images: [`${SITE_URL}/og-cover.png`],
    creator: "@addvoxen",
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
  category: "Marketing & Advertising",
  applicationName: "Addvoxen",
};

/** JSON-LD structured data — Organization + WebSite + SoftwareApplication.
 *  Tells Google what the site IS, who owns it, and how to render rich
 *  results (sitelinks search box, ratings, pricing). */
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Addvoxen",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: [
      "https://twitter.com/addvoxen",
      "https://www.linkedin.com/company/addvoxen",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@addvoxen.com",
      contactType: "customer support",
      availableLanguage: ["English", "Azerbaijani", "Turkish", "Russian", "Spanish"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Addvoxen",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/marketplace?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Addvoxen",
    operatingSystem: "Web",
    applicationCategory: "DesignApplication",
    description:
      "AI-powered ad banner creative suite: editor, magic resize, marketplace templates, analytics.",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "12", priceCurrency: "USD" },
      { "@type": "Offer", name: "Team", price: "25", priceCurrency: "USD" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "42",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} dark h-full antialiased selection:bg-primary selection:text-on-primary`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Theme bootstrap — flip html.light before paint if the user
            previously chose light mode. Inline so no FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('addvoxen.theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
        {/* JSON-LD structured data — Google reads this to render rich
            results (sitelinks search box, app card, ratings) the moment
            it indexes the site. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface">
        <div className="noise-overlay fixed inset-0 z-100 pointer-events-none" aria-hidden />
        <LocaleProvider>
          <PageViewTracker />
          <GlobalHeader />
          {children}
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
