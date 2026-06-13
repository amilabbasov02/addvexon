/**
 * Host-based multi-tenant routing.
 *
 *   - Platforma hostu (addvoxen.com, www, localhost, *.vercel.app):
 *     heç nə dəyişmir — marketplace, auth, /admin, /panel normal işləyir.
 *   - Tenant hostu (<sub>.addvoxen.com və ya müştəri custom domeni):
 *     bütün public trafik `app/_sites/...` render qrupuna rewrite olunur.
 *     Tenant subdomeni YALNIZ public saytı göstərir; müştəri öz panelini
 *     platformada (/panel) idarə edir.
 *
 * Qeyd: yalnız `tenant-host.ts` (təmiz parse) import olunur — DB/pg edge
 * runtime-da işləmir, ona görə tenant DB sorğusu render route-da edilir.
 */
import { NextRequest, NextResponse } from "next/server";
import { parseHost } from "@/lib/tenant-host";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const parsed = parseHost(host);

  if (parsed.kind === "platform") {
    return NextResponse.next();
  }

  // Tenant hostu → public saytı `sites` render qrupuna rewrite et.
  // (Qeyd: alt-xətt prefiksli qovluqlar Next.js-də private-dir və route
  //  yaratmır, ona görə `_sites` yox, `sites` istifadə olunur.)
  const url = req.nextUrl.clone();
  url.pathname = `/sites${req.nextUrl.pathname}`;
  const res = NextResponse.rewrite(url);
  // Render route-un host-u asanlıqla oxuya bilməsi üçün.
  res.headers.set("x-tenant-host", parsed.host);
  return res;
}

export const config = {
  // Statik fayllar, Next daxili route-lar və platforma API-si rewrite olunmur.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
