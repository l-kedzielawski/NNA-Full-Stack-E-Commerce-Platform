import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";

function isSkippablePath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isSkippablePath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] ?? "";

  if (isSupportedLocale(firstSegment)) {
    const rewrittenPath = pathname.replace(new RegExp(`^/${firstSegment}`), "") || "/";
    const rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = rewrittenPath;
    rewrittenUrl.search = search;

    return NextResponse.rewrite(rewrittenUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  redirectUrl.search = search;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
