"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Site-wide footer with legal + support links. Hidden on /editor (which
 * runs in fixed-fullscreen mode) but visible everywhere else so the legal
 * links are reachable from any page — required by Paddle and most payment
 * providers as part of merchant onboarding.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/editor")) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-20 border-t border-white/10 bg-surface-container/40">
      <div className="px-4 sm:px-8 lg:px-16 xl:px-24 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link
              href="/"
              className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tighter text-primary inline-block"
            >
              Addvoxen
            </Link>
            <p className="mt-3 text-on-surface-variant text-label-sm font-label-sm max-w-sm leading-relaxed">
              The AI Creative Suite for marketing teams. Design, resize,
              launch and measure ad creatives from one workspace.
            </p>
            <p className="mt-4 text-on-surface-variant text-label-sm font-label-sm">
              <a
                href="mailto:support@addvoxen.com"
                className="hover:text-on-surface"
              >
                support@addvoxen.com
              </a>
            </p>
          </div>

          <div>
            <p className="text-on-surface font-label-md text-label-md mb-3">
              Product
            </p>
            <ul className="space-y-2 text-label-sm font-label-sm text-on-surface-variant">
              <li>
                <Link href="/marketplace" className="hover:text-on-surface">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-on-surface">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-on-surface">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-on-surface">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-on-surface font-label-md text-label-md mb-3">
              Legal
            </p>
            <ul className="space-y-2 text-label-sm font-label-sm text-on-surface-variant">
              <li>
                <Link href="/terms" className="hover:text-on-surface">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-on-surface">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-on-surface">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-on-surface">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} Addvoxen. All rights reserved.</p>
          <p className="text-xs">
            Payments processed by Paddle (merchant of record) and PayPal.
          </p>
        </div>
      </div>
    </footer>
  );
}
