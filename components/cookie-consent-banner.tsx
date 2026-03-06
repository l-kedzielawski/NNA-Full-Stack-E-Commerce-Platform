"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  COOKIE_PREFERENCES_OPEN_EVENT,
  getStoredCookieConsent,
  isConsentCurrent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

type PreferenceState = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: PreferenceState = {
  preferences: false,
  analytics: false,
  marketing: false,
};

function toPreferenceState(consent: CookieConsent | null): PreferenceState {
  if (!consent) {
    return defaultPreferences;
  }

  return {
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
  };
}

function Toggle({
  id,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="relative w-10 h-6 rounded-full bg-bg-soft border border-line/70 transition-colors peer-checked:bg-gold/70 peer-disabled:opacity-70 peer-disabled:cursor-not-allowed">
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-ink transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function CookieConsentBanner() {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<PreferenceState>(defaultPreferences);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  const t = {
    preferences: locale === "pl" ? "Preferencje cookies" : "Cookie Preferences",
    control: locale === "pl" ? "Zarzadzaj wykorzystaniem cookies" : "Control How Cookies Are Used",
    description:
      locale === "pl"
        ? "Opcjonalne cookies wykorzystujemy tylko za Twoja zgoda. Ustawienia mozesz zmienic w dowolnym momencie w stopce."
        : "We only use optional cookies with your consent. You can change your preferences at any time from the footer.",
    strictlyNecessary: locale === "pl" ? "Niezbedne" : "Strictly Necessary",
    strictlyNecessaryDesc:
      locale === "pl"
        ? "Niezbedne dla bezpieczenstwa, checkoutu i podstawowego dzialania strony. Te cookies sa zawsze aktywne."
        : "Required for security, checkout flow, and core website functionality. These cookies are always active.",
    pref: locale === "pl" ? "Preferencje" : "Preferences",
    prefDesc:
      locale === "pl"
        ? "Zapamietuja ustawienia, takie jak Twoje wybory dotyczace cookies i preferencje interfejsu."
        : "Remembers settings such as your cookie choices and interface preferences.",
    analytics: locale === "pl" ? "Analityka" : "Analytics",
    analyticsDesc:
      locale === "pl"
        ? "Pomaga nam analizowac ruch i rozwijac tresci na podstawie zagregowanych danych pomiarowych."
        : "Helps us understand traffic and improve content using aggregated measurement data.",
    marketing: locale === "pl" ? "Marketing" : "Marketing",
    marketingDesc:
      locale === "pl"
        ? "Wykorzystywane do personalizacji reklam i atrybucji kampanii miedzy platformami. Domyslnie wylaczone."
        : "Used for ad personalization and cross-platform campaign attribution. Currently disabled unless enabled by you.",
    back: locale === "pl" ? "Wroc" : "Back",
    reject: locale === "pl" ? "Odrzuc opcjonalne" : "Reject Optional",
    save: locale === "pl" ? "Zapisz ustawienia" : "Save Preferences",
    privacyChoices: locale === "pl" ? "Twoje ustawienia prywatnosci" : "Your Privacy Choices",
    bannerText:
      locale === "pl"
        ? "Wykorzystujemy niezbedne cookies do dzialania strony. Opcjonalne cookies uruchamiamy wylacznie za Twoja zgoda. Przeczytaj "
        : "We use essential cookies for site operation. Optional cookies are used only with your consent. Read our ",
    privacy: locale === "pl" ? "Polityke prywatnosci" : "Privacy Policy",
    cookiePolicy: locale === "pl" ? "Polityke cookies" : "Cookie Policy",
    customize: locale === "pl" ? "Dostosuj" : "Customize",
    acceptAll: locale === "pl" ? "Akceptuj wszystkie" : "Accept All",
  };

  const privacyHref = withLocalePrefix("/privacy", locale);
  const cookiePolicyHref = withLocalePrefix("/cookie-policy", locale);

  useEffect(() => {
    const existing = getStoredCookieConsent();
    const current = isConsentCurrent(existing);
    const frameId = window.requestAnimationFrame(() => {
      setPreferences(toPreferenceState(existing));
      setShowBanner(!current);
      setReady(true);
    });

    const handleOpenPreferences = () => {
      setShowBanner(true);
      setShowPreferences(true);
    };

    const handleConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      setPreferences(toPreferenceState(detail));
      setShowBanner(false);
      setShowPreferences(false);
    };

    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, handleOpenPreferences);
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate as EventListener);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, handleOpenPreferences);
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate as EventListener);
    };
  }, []);

  const modalVisible = showBanner && showPreferences;
  const bannerVisible = showBanner;

  useEffect(() => {
    if (!modalVisible) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPreferences(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalVisible]);

  if (!ready || !bannerVisible) {
    return null;
  }

  const acceptAll = () => {
    saveCookieConsent({
      preferences: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectOptional = () => {
    saveCookieConsent({
      preferences: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveSelected = () => {
    saveCookieConsent(preferences);
  };

  return (
    <>
      {modalVisible ? (
        <div className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm p-4 md:p-6">
          <div className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-line-strong bg-bg-mid shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-5 border-b border-line/60">
              <p className="label-sm text-gold mb-2">{t.preferences}</p>
              <h2 className="font-display text-3xl text-ink">{t.control}</h2>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">
                {t.description}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.strictlyNecessary}</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    {t.strictlyNecessaryDesc}
                  </p>
                </div>
                <Toggle id="consent-necessary" checked disabled />
              </div>

              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.pref}</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    {t.prefDesc}
                  </p>
                </div>
                <Toggle
                  id="consent-preferences"
                  checked={preferences.preferences}
                  onChange={(checked) => setPreferences((current) => ({ ...current, preferences: checked }))}
                />
              </div>

              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.analytics}</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    {t.analyticsDesc}
                  </p>
                </div>
                <Toggle
                  id="consent-analytics"
                  checked={preferences.analytics}
                  onChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
                />
              </div>

              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.marketing}</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    {t.marketingDesc}
                  </p>
                </div>
                <Toggle
                  id="consent-marketing"
                  checked={preferences.marketing}
                  onChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-line/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                className="text-xs text-ink/55 hover:text-gold transition-colors"
                onClick={() => setShowPreferences(false)}
              >
                {t.back}
              </button>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase border border-line-strong text-ink/70 hover:text-gold hover:border-gold/40 transition-colors"
                >
                  {t.reject}
                </button>
                <button
                  type="button"
                  onClick={saveSelected}
                  className="px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase bg-gold text-bg hover:bg-gold-light transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-line-strong bg-bg-mid/95 backdrop-blur-md shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
        <div className="container-shell py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs text-gold tracking-[0.16em] uppercase font-semibold">{t.privacyChoices}</p>
            <p className="text-xs md:text-sm text-ink/70 mt-1 leading-relaxed max-w-3xl">
              {t.bannerText}
              <Link href={privacyHref} className="underline decoration-gold/45 underline-offset-4 hover:text-gold transition-colors">
                {t.privacy}
              </Link>{" "}
              {locale === "pl" ? "oraz" : "and"}{" "}
              <Link href={cookiePolicyHref} className="underline decoration-gold/45 underline-offset-4 hover:text-gold transition-colors">
                {t.cookiePolicy}
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={rejectOptional}
              className="px-3 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase border border-line-strong text-ink/75 hover:text-gold hover:border-gold/50 transition-colors"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="px-3 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase border border-line-strong text-ink/75 hover:text-gold hover:border-gold/50 transition-colors"
            >
              {t.customize}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="px-3 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase bg-gold text-bg hover:bg-gold-light transition-colors"
            >
              {t.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
