import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/components/site/GlobalHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LocaleProvider } from "@/components/site/LocaleContext";

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

export const metadata: Metadata = {
  title: "Addvoxen — Precision Luxury in Advertising",
  description:
    "AI Creative Suite for high-growth marketing teams. Generate high-conversion ad banners in seconds with the Addvoxen AI Engine.",
};

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
      </head>
      <body className="min-h-full bg-surface text-on-surface">
        <div className="noise-overlay fixed inset-0 z-100 pointer-events-none" aria-hidden />
        <LocaleProvider>
          <GlobalHeader />
          {children}
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
