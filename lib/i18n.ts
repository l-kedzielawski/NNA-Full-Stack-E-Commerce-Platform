export const supportedLocales = ["en", "pl"] as const;

export const legacyLocaleAliases = ["de", "it"] as const;

export const localeCookieName = "nma_locale";

export type SiteLocale = (typeof supportedLocales)[number];

const envDefaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

export const defaultLocale: SiteLocale =
  envDefaultLocale && supportedLocales.includes(envDefaultLocale as SiteLocale)
    ? (envDefaultLocale as SiteLocale)
    : "en";

export function isSupportedLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function isLegacyLocale(value: string): value is (typeof legacyLocaleAliases)[number] {
  return legacyLocaleAliases.includes(value as (typeof legacyLocaleAliases)[number]);
}

export function detectLocaleFromAcceptLanguage(acceptLanguageHeader: string | null): SiteLocale {
  if (!acceptLanguageHeader) {
    return defaultLocale;
  }

  const normalized = acceptLanguageHeader.toLowerCase();
  if (normalized.includes("pl")) {
    return "pl";
  }

  return "en";
}

export function getLocaleFromPathname(pathname: string): SiteLocale | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";

  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";

  if (!isSupportedLocale(firstSegment)) {
    return pathname || "/";
  }

  const stripped = pathname.replace(new RegExp(`^/${firstSegment}`), "");
  return stripped || "/";
}

export function withLocalePrefix(pathname: string, locale: SiteLocale = defaultLocale): string {
  const cleanPath = stripLocaleFromPathname(pathname);

  if (cleanPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}
