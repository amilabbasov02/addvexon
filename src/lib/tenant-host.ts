/**
 * Host parse məntiqi — TƏMİZ (DB importu yoxdur) ki, middleware (edge
 * runtime) onu pg paketi olmadan import edə bilsin.
 *
 * Domen modeli:
 *   - addvoxen.com / www.addvoxen.com  → platforma (marketplace, auth, admin, panel)
 *   - <tenant>.addvoxen.com            → hosted tenant saytı (subdomain)
 *   - müştərinin öz domeni             → hosted tenant saytı (custom domain)
 *   - localhost / *.vercel.app         → platforma (dev / preview)
 *   - <tenant>.localhost               → dev-də tenant test üçün subdomain
 */

export type HostKind = "platform" | "tenant";

export interface ParsedHost {
  kind: HostKind;
  /** tenant subdomeni (məs. "demo-klinika") — yalnız subdomain halında. */
  subdomain?: string;
  /** custom domen (məs. "klinika.az") — yalnız custom domen halında. */
  customDomain?: string;
  /** Port silinmiş, kiçik hərflə host. */
  host: string;
}

/** Platforma kök domeni. Vercel/prod-da NEXT_PUBLIC_ROOT_DOMAIN ilə təyin olunur. */
export const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase() || "addvoxen.com";

/** Platforma kimi qəbul ediləcək subdomenlər (tenant deyil). */
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api"]);

/**
 * Host header-i parse edib platforma/tenant olduğunu müəyyən edir.
 * Heç bir DB sorğusu etmir — yalnız sətir analizi.
 */
export function parseHost(rawHost: string | null | undefined): ParsedHost {
  const host = (rawHost ?? "").toLowerCase().split(":")[0].trim();

  if (!host) return { kind: "platform", host };

  // Vercel preview/prod texniki domenləri → platforma
  if (host.endsWith(".vercel.app")) return { kind: "platform", host };

  // Lokal inkişaf: "tenant.localhost" → subdomain, "localhost" → platforma
  if (host === "localhost" || host === "127.0.0.1") {
    return { kind: "platform", host };
  }
  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return { kind: "platform", host };
    return { kind: "tenant", subdomain: sub, host };
  }

  // Kök domen və ya www → platforma
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return { kind: "platform", host };
  }

  // <tenant>.addvoxen.com → subdomain tenant
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    // Çoxsəviyyəli subdomenlər (a.b.addvoxen.com) dəstəklənmir → platforma
    if (!sub || sub.includes(".") || RESERVED_SUBDOMAINS.has(sub)) {
      return { kind: "platform", host };
    }
    return { kind: "tenant", subdomain: sub, host };
  }

  // Başqa hər şey → müştərinin custom domeni (hosted tenant)
  return { kind: "tenant", customDomain: host, host };
}
