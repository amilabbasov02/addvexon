import Link from "next/link";

/**
 * Site-wide notice that paid plans aren't live yet. Surfaced on /pricing
 * and /checkout so users don't waste time trying to subscribe before the
 * Paddle / PayPal verification finishes.
 */
export function PaymentNotice() {
  return (
    <div className="mb-8 rounded-2xl border border-tertiary/30 bg-tertiary/10 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary text-[20px]">
            schedule
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface font-label-md text-label-md">
            Paid plans · Coming soon
          </p>
          <p className="text-on-surface-variant text-label-sm font-label-sm mt-1 leading-relaxed">
            Card and PayPal billing are being verified with our payment
            partners — go live target{" "}
            <span className="text-on-surface">June 2026</span>. Until then
            the full Pro feature set runs on{" "}
            <strong className="text-on-surface">manual upgrade</strong>:
            email{" "}
            <a
              href="mailto:support@addvoxen.com?subject=Pro%20upgrade%20request"
              className="text-primary hover:underline"
            >
              support@addvoxen.com
            </a>{" "}
            and we&apos;ll unlock your account directly.
          </p>
        </div>
        <Link
          href="/about#roadmap"
          className="hidden sm:inline-flex shrink-0 text-label-sm font-label-sm text-primary hover:underline self-center"
        >
          See roadmap →
        </Link>
      </div>
    </div>
  );
}
