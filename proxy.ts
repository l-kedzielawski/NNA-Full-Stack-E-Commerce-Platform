import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  isLegacyLocale,
  isSupportedLocale,
  localeCookieName,
  stripLocaleFromPathname,
  toInternalStaticPathname,
  withLocalePrefix,
  type SiteLocale,
} from "@/lib/i18n";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

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

  const preferredLocale = resolvePreferredLocale(request);

  if (isSupportedLocale(firstSegment)) {
    const rewrittenPath = toInternalStaticPathname(stripLocaleFromPathname(pathname), firstSegment);
    const rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = rewrittenPath;
    rewrittenUrl.search = search;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-locale", firstSegment);

    const response = NextResponse.rewrite(rewrittenUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(localeCookieName, firstSegment, {
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });

    return response;
  }

  if (isLegacyLocale(firstSegment)) {
    const withoutLegacy = pathname.replace(/^\/(de|it)(?=\/|$)/, "") || "/";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocalePrefix(toInternalStaticPathname(withoutLegacy), preferredLocale);
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = withLocalePrefix(toInternalStaticPathname(pathname), preferredLocale);
  redirectUrl.search = search;

  return NextResponse.redirect(redirectUrl);
}

function resolvePreferredLocale(request: NextRequest): SiteLocale {
  const localeFromCookie = request.cookies.get(localeCookieName)?.value;

  if (localeFromCookie && isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const localeFromHeader = detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  if (isSupportedLocale(localeFromHeader)) {
    return localeFromHeader;
  }

  return defaultLocale;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
