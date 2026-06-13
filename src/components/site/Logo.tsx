import Link from "next/link";
import { BRAND } from "@/lib/brand";

/**
 * Mərkəzi logo komponenti (PLACEHOLDER).
 * - `BRAND.logoSrc` boşdursa: işarə (yuvarlaq kvadrat + ilk hərf) + wordmark.
 * - Real logo gələndə `brand.ts`-də `logoSrc` doldurulur → avtomatik şəkil.
 */
export function Logo({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const inner = BRAND.logoSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BRAND.logoSrc} alt={BRAND.name} className="h-8 w-auto" />
  ) : (
    <span className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-black text-white"
        style={{ background: BRAND.markColor }}
        aria-hidden
      >
        a
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">
        {BRAND.name}
      </span>
    </span>
  );

  if (href === null) {
    return <span className={className}>{inner}</span>;
  }
  return (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      {inner}
    </Link>
  );
}
