export const supportedLocales = ["en", "pl", "de", "it"] as const;

export type SiteLocale = (typeof supportedLocales)[number];

const envDefaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

export const defaultLocale: SiteLocale =
  envDefaultLocale && supportedLocales.includes(envDefaultLocale as SiteLocale)
    ? (envDefaultLocale as SiteLocale)
    : "en";

export function isSupportedLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function withLocalePrefix(pathname: string, locale: SiteLocale = defaultLocale): string {
  if (pathname === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
