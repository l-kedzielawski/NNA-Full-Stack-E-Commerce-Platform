"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { getGaMeasurementId, trackPageview } from "@/lib/analytics/gtag";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  getStoredCookieConsent,
  hasAnalyticsConsent,
  isConsentCurrent,
  type CookieConsent,
} from "@/lib/cookie-consent";

const measurementId = getGaMeasurementId();

export function GA4() {
  const pathname = usePathname();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [gaReady, setGaReady] = useState(false);

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    const syncFromStoredConsent = () => {
      const consent = getStoredCookieConsent();
      const enabled = hasAnalyticsConsent(consent) && isConsentCurrent(consent);
      setAnalyticsEnabled(enabled);
      if (!enabled) {
        setGaReady(false);
      }
    };

    syncFromStoredConsent();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      const enabled = hasAnalyticsConsent(detail) && isConsentCurrent(detail);
      setAnalyticsEnabled(enabled);
      if (!enabled) {
        setGaReady(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);
  }, []);

  useEffect(() => {
    if (!measurementId || !analyticsEnabled || !gaReady) {
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    const url = search ? `${pathname}${search}` : pathname;
    trackPageview(url);
  }, [pathname, analyticsEnabled, gaReady]);

  if (!measurementId || !analyticsEnabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => setGaReady(true)}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
