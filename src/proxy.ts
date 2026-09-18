import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

function rewriteFactoryHost(request: NextRequest) {
  const wildcard = process.env.FACTORY_WILDCARD_DOMAIN?.trim().toLowerCase();
  if (!wildcard) return null;
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const suffix = `.${wildcard.replace(/^\./, "")}`;
  if (!host.endsWith(suffix) || host === wildcard) return null;
  const siteSlug = host.slice(0, -suffix.length);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(siteSlug)) return null;
  if (request.nextUrl.pathname.startsWith("/s/")) return null;
  const url = request.nextUrl.clone();
  const rest = url.pathname === "/" ? "" : url.pathname;
  url.pathname = `/s/${siteSlug}${rest}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const rewritten = rewriteFactoryHost(request);
  if (rewritten) return rewritten;

  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api/admin") ||
    path.startsWith("/preview")
  ) {
    return updateSession(request);
  }
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/preview/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)",
  ],
};
