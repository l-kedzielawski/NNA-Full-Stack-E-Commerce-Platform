export const COOKIE_CONSENT_VERSION = "2026-02-28";
export const COOKIE_CONSENT_STORAGE_KEY = "nma_cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "nma_cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated";
export const COOKIE_PREFERENCES_OPEN_EVENT = "cookie-preferences-open";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export type CookieConsent = {
  version: string;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type CookieConsentInput = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function toCookieConsent(value: unknown): CookieConsent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  if (
    !isBoolean(raw.preferences) ||
    !isBoolean(raw.analytics) ||
    !isBoolean(raw.marketing) ||
    typeof raw.version !== "string" ||
    typeof raw.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    version: raw.version,
    necessary: true,
    preferences: raw.preferences,
    analytics: raw.analytics,
    marketing: raw.marketing,
    updatedAt: raw.updatedAt,
  };
}

function parseCookieString(cookieName: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const name = `${cookieName}=`;
  const segments = document.cookie.split(";");

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed.startsWith(name)) {
      continue;
    }

    return decodeURIComponent(trimmed.slice(name.length));
  }

  return null;
}

function persistCookieConsentCookie(consent: CookieConsent) {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const payload = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${payload}; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function persistCookieConsentStorage(consent: CookieConsent) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

function removeStoredConsent() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function buildConsent(input: CookieConsentInput): CookieConsent {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    preferences: input.preferences,
    analytics: input.analytics,
    marketing: input.marketing,
    updatedAt: new Date().toISOString(),
  };
}

function dispatchConsentUpdated(consent: CookieConsent) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent<CookieConsent>(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent }));
}

export function getStoredCookieConsent(): CookieConsent | null {
  if (!isBrowser()) {
    return null;
  }

  const fromStorage = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (fromStorage) {
    try {
      const parsed = toCookieConsent(JSON.parse(fromStorage));
      if (parsed) {
        return parsed;
      }
    } catch {
      removeStoredConsent();
    }
  }

  const fromCookie = parseCookieString(COOKIE_CONSENT_COOKIE_NAME);
  if (!fromCookie) {
    return null;
  }

  try {
    const parsed = toCookieConsent(JSON.parse(fromCookie));
    if (parsed) {
      persistCookieConsentStorage(parsed);
      return parsed;
    }
  } catch {
    removeStoredConsent();
  }

  return null;
}

export function hasAnalyticsConsent(consent: CookieConsent | null): boolean {
  return !!consent && consent.analytics === true;
}

export function isConsentCurrent(consent: CookieConsent | null): boolean {
  return !!consent && consent.version === COOKIE_CONSENT_VERSION;
}

export function saveCookieConsent(input: CookieConsentInput): CookieConsent {
  const consent = buildConsent(input);
  persistCookieConsentStorage(consent);
  persistCookieConsentCookie(consent);
  dispatchConsentUpdated(consent);
  return consent;
}

export function openCookiePreferences() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT));
}
