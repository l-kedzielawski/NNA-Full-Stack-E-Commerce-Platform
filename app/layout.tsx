import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyQuoteCta } from "@/components/sticky-quote-cta";
import { GA4 } from "@/components/analytics/ga4";
import { BaselineTraffic } from "@/components/analytics/baseline-traffic";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";
import { fetchPublicPromotionBanner } from "@/lib/medusa-promotion-banner.server";
import { createOrganizationSchema, createWebsiteSchema } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.themysticaroma.com"),
  title: {
    default: "The Mystic Aroma | Madagascar Vanilla & Cocoa",
    template: "%s | The Mystic Aroma",
  },
  description:
    "Premium Madagascar vanilla, cocoa, and specialty ingredients for demanding B2B buyers.",
  openGraph: {
    type: "website",
    url: "https://www.themysticaroma.com",
    siteName: "The Mystic Aroma",
    title: "The Mystic Aroma | Madagascar Vanilla & Cocoa",
    description:
      "Premium Madagascar vanilla, cocoa, and specialty ingredients for demanding B2B buyers.",
    images: [
      {
        url: "/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Madagascar vanilla and spices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mystic Aroma | Madagascar Vanilla & Cocoa",
    description:
      "Premium Madagascar vanilla, cocoa, and specialty ingredients for demanding B2B buyers.",
    images: ["/hero.jpg"],
  },
  icons: {
    icon: "/avi-icon.png",
    apple: "/avi-icon.png",
    shortcut: "/avi-icon.png",
  },
};

const organizationSchema = createOrganizationSchema();
const websiteSchema = createWebsiteSchema();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;
  const publicPromotion = await fetchPublicPromotionBanner();

  return (
    <html lang={locale}>
      <head>
        {/* No-flash theme script: runs synchronously before paint to avoid flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nma-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${manrope.variable} antialiased`}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-bg focus:rounded-full focus:font-semibold focus:text-sm"
          >
            {locale === "pl" ? "Przejdz do tresci" : "Skip to content"}
          </a>
          <GA4 />
          <BaselineTraffic />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <SiteHeader promotion={publicPromotion} />
          <div id="main-content" style={publicPromotion ? { paddingTop: "108px" } : undefined}>{children}</div>
          <StickyQuoteCta />
          <CookieConsentBanner />
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
