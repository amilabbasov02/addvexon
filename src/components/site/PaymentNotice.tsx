"use client";

import Link from "next/link";
import { useLocale } from "./LocaleContext";

/**
 * Site-wide notice that paid plans aren't live yet. Surfaced on /pricing
 * and /checkout so users don't waste time trying to subscribe before the
 * Paddle / PayPal verification finishes.
 */
export function PaymentNotice() {
  const { t } = useLocale();

  const free = (
    <span className="text-on-surface">{t("payment_notice.free")}</span>
  );
  const manual = (
    <strong className="text-on-surface">{t("payment_notice.manual")}</strong>
  );
  const email = (
    <a
      href="mailto:support@addvoxen.com?subject=Pro%20upgrade%20request"
      className="text-primary hover:underline"
    >
      support@addvoxen.com
    </a>
  );

  // Split the template by placeholders so we can render React nodes inline.
  const template = t("payment_notice.body");
  const parts: Array<React.ReactNode> = [];
  let cursor = 0;
  const tokens: Array<{ key: string; node: React.ReactNode }> = [
    { key: "{free}", node: free },
    { key: "{manual}", node: manual },
    { key: "{email}", node: email },
  ];
  while (cursor < template.length) {
    let nextIdx = -1;
    let nextTok: (typeof tokens)[number] | null = null;
    for (const tok of tokens) {
      const idx = template.indexOf(tok.key, cursor);
      if (idx !== -1 && (nextIdx === -1 || idx < nextIdx)) {
        nextIdx = idx;
        nextTok = tok;
      }
    }
    if (nextTok === null || nextIdx === -1) {
      parts.push(template.slice(cursor));
      break;
    }
    if (nextIdx > cursor) parts.push(template.slice(cursor, nextIdx));
    parts.push(<span key={parts.length}>{nextTok.node}</span>);
    cursor = nextIdx + nextTok.key.length;
  }

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
            {t("payment_notice.title")}
          </p>
          <p className="text-on-surface-variant text-label-sm font-label-sm mt-1 leading-relaxed">
            {parts}
          </p>
        </div>
        <Link
          href="/about#roadmap"
          className="hidden sm:inline-flex shrink-0 text-label-sm font-label-sm text-primary hover:underline self-center"
        >
          {t("payment_notice.cta")}
        </Link>
      </div>
    </div>
  );
}
