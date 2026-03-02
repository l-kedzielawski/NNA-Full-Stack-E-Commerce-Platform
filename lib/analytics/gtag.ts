import { getStoredCookieConsent, hasAnalyticsConsent, isConsentCurrent } from "@/lib/cookie-consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function getGaMeasurementId(): string {
  return GA_MEASUREMENT_ID;
}

function canTrack(): boolean {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) {
    return false;
  }

  const consent = getStoredCookieConsent();
  const analyticsAllowed = hasAnalyticsConsent(consent) && isConsentCurrent(consent);

  return analyticsAllowed && typeof window.gtag === "function";
}

export function trackPageview(url: string): void {
  if (!canTrack()) {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (!canTrack()) {
    return;
  }

  window.gtag("event", name, params);
}
