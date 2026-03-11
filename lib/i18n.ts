export const supportedLocales = ["en", "pl"] as const;

export const legacyLocaleAliases = ["de", "it"] as const;

export const localeCookieName = "nma_locale";

export type SiteLocale = (typeof supportedLocales)[number];

const envDefaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

export const defaultLocale: SiteLocale =
  envDefaultLocale && supportedLocales.includes(envDefaultLocale as SiteLocale)
    ? (envDefaultLocale as SiteLocale)
    : "en";

const localizedStaticPathnames = {
  "/": { en: "/", pl: "/" },
  "/about": { en: "/about", pl: "/o-nas" },
  "/b2b": { en: "/b2b", pl: "/hurt" },
  "/cart": { en: "/cart", pl: "/koszyk" },
  "/certifications": { en: "/certifications", pl: "/certyfikaty" },
  "/checkout": { en: "/checkout", pl: "/zamowienie" },
  "/checkout/success": { en: "/checkout/success", pl: "/zamowienie/sukces" },
  "/contact": { en: "/contact", pl: "/kontakt" },
  "/cookie-policy": { en: "/cookie-policy", pl: "/polityka-cookies" },
  "/journal": { en: "/journal", pl: "/dziennik" },
  "/legal": { en: "/legal", pl: "/informacje-prawne" },
  "/payment/cancel": { en: "/payment/cancel", pl: "/platnosc/anulowano" },
  "/payment/success": { en: "/payment/success", pl: "/platnosc/sukces" },
  "/privacy": { en: "/privacy", pl: "/polityka-prywatnosci" },
  "/products": { en: "/products", pl: "/produkty" },
  "/quote": { en: "/quote", pl: "/zapytanie" },
  "/returns": { en: "/returns", pl: "/zwroty-i-reklamacje" },
  "/shipping": { en: "/shipping", pl: "/dostawa-i-platnosci" },
  "/terms": { en: "/terms", pl: "/regulamin" },
} as const satisfies Record<string, Record<SiteLocale, string>>;

type InternalStaticPathname = keyof typeof localizedStaticPathnames;

const internalStaticPathnames = Object.keys(localizedStaticPathnames)
  .sort((left, right) => right.length - left.length) as InternalStaticPathname[];

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

export function toInternalStaticPathname(pathname: string, locale?: SiteLocale): string {
  const cleanPath = pathname || "/";

  for (const internalPath of internalStaticPathnames) {
    const localizedPath = locale ? localizedStaticPathnames[internalPath][locale] : null;

    if (localizedPath && (cleanPath === localizedPath || cleanPath.startsWith(`${localizedPath}/`))) {
      if (localizedPath === "/") {
        return cleanPath;
      }

      return `${internalPath}${cleanPath.slice(localizedPath.length)}` || internalPath;
    }

    if (internalPath !== "/" && (cleanPath === internalPath || cleanPath.startsWith(`${internalPath}/`))) {
      return `${internalPath}${cleanPath.slice(internalPath.length)}` || internalPath;
    }

    if (!locale) {
      const matchesAnyLocale = supportedLocales.some(
        (entry) => {
          const entryPath = localizedStaticPathnames[internalPath][entry];

          if (entryPath === "/") {
            return cleanPath === "/";
          }

          return cleanPath === entryPath || cleanPath.startsWith(`${entryPath}/`);
        },
      );

      if (matchesAnyLocale) {
        const matchedLocale = supportedLocales.find((entry) => {
          const entryPath = localizedStaticPathnames[internalPath][entry];

          if (entryPath === "/") {
            return cleanPath === "/";
          }

          return cleanPath === entryPath || cleanPath.startsWith(`${entryPath}/`);
        });

        if (matchedLocale) {
          const entryPath = localizedStaticPathnames[internalPath][matchedLocale];
          return `${internalPath}${cleanPath.slice(entryPath.length)}` || internalPath;
        }
      }
    }
  }

  return cleanPath;
}

export function localizeStaticPathname(pathname: string, locale: SiteLocale): string {
  const internalPath = toInternalStaticPathname(pathname);

  if (internalPath in localizedStaticPathnames) {
    return localizedStaticPathnames[internalPath as InternalStaticPathname][locale];
  }

  for (const entry of internalStaticPathnames) {
    if (entry !== "/" && (internalPath === entry || internalPath.startsWith(`${entry}/`))) {
      const localizedPath = localizedStaticPathnames[entry][locale];
      return `${localizedPath}${internalPath.slice(entry.length)}`;
    }
  }

  return internalPath;
}

export function withLocalePrefix(pathname: string, locale: SiteLocale = defaultLocale): string {
  const cleanPath = localizeStaticPathname(stripLocaleFromPathname(pathname), locale);

  if (cleanPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}
