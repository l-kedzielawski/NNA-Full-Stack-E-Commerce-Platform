import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultLocale, isSupportedLocale, supportedLocales, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export const siteUrl = "https://www.themysticaroma.com";
export const siteName = "The Mystic Aroma";
export const organizationName = "Natural Mystic Aroma";
export const organizationId = `${siteUrl}#organization`;
export const websiteId = `${siteUrl}#website`;

type LocalizedText = Record<SiteLocale, string>;

type CreateLocalizedMetadataParams = {
  pathname: string;
  locale: SiteLocale;
  title: LocalizedText;
  description: LocalizedText;
  image?: string;
};

export async function getRequestLocale(): Promise<SiteLocale> {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";

  return isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;
}

export function getLocalizedUrl(pathname: string, locale: SiteLocale): string {
  return `${siteUrl}${withLocalePrefix(pathname, locale)}`;
}

export function getLanguageAlternates(pathname: string): Record<string, string> {
  return {
    ...Object.fromEntries(supportedLocales.map((locale) => [locale, getLocalizedUrl(pathname, locale)])),
    "x-default": getLocalizedUrl(pathname, defaultLocale),
  };
}

export function createLocalizedMetadata({
  pathname,
  locale,
  title,
  description,
  image = "/hero.jpg",
}: CreateLocalizedMetadataParams): Metadata {
  const pageTitle = title[locale];
  const pageDescription = description[locale];
  const canonical = getLocalizedUrl(pathname, locale);
  const alternateLocale = supportedLocales
    .filter((entry) => entry !== locale)
    .map((entry) => (entry === "pl" ? "pl_PL" : "en_GB"));

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical,
      languages: getLanguageAlternates(pathname),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName,
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      alternateLocale,
      title: `${pageTitle} | ${siteName}`,
      description: pageDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | ${siteName}`,
      description: pageDescription,
      images: [image],
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: organizationName,
    alternateName: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo-dark.png`,
    image: `${siteUrl}/hero.jpg`,
    description:
      "Direct supplier of premium Bourbon vanilla, cocoa, and specialty ingredients from Madagascar with warehousing in Poznan, Poland.",
    email: "info@themysticaroma.com",
    telephone: "+48 665 103 994",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. Pamiatkowa 2/56",
      postalCode: "61-512",
      addressLocality: "Poznan",
      addressCountry: "PL",
    },
    areaServed: ["PL", "EU", "GB"],
    knowsAbout: [
      "Madagascar Bourbon vanilla",
      "vanilla powder",
      "vanilla seeds",
      "vanilla extracts",
      "cocoa",
      "single-origin sourcing",
      "EU Organic certification",
      "Fair Trade sourcing",
      "lot-level traceability",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "l.kedzielawski@themysticaroma.com",
        telephone: "+48 665 103 994",
        availableLanguage: ["en", "pl"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "k.kucharski@themysticaroma.com",
        availableLanguage: ["en", "pl"],
      },
    ],
    sameAs: [
      "https://www.facebook.com/NaturalMysticAroma",
      "https://www.instagram.com/thenaturalmysticaroma",
      "https://www.linkedin.com/company/natural-mystic-aroma",
      "https://www.youtube.com/@NaturalMysticAroma",
      "https://www.tiktok.com/@the.mystic.aroma",
    ],
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    alternateName: organizationName,
    publisher: {
      "@id": organizationId,
    },
    inLanguage: ["en", "pl"],
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
