/**
 * Platforma dilini cookie-dən oxuyan SERVER helper-i (next/headers).
 * Ayrıca fayldır ki, pure `platform-i18n.ts` client-də də import oluna bilsin.
 */
import "server-only";
import { cookies } from "next/headers";
import { PLANGS, PLANG_COOKIE, type PLang } from "./platform-i18n";

export async function getLang(): Promise<PLang> {
  const v = (await cookies()).get(PLANG_COOKIE)?.value as PLang | undefined;
  return v && PLANGS.includes(v) ? v : "az";
}
