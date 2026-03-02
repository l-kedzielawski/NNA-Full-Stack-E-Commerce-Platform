"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  COOKIE_PREFERENCES_OPEN_EVENT,
  getStoredCookieConsent,
  isConsentCurrent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

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
              <p className="label-sm text-gold mb-2">Cookie Preferences</p>
              <h2 className="font-display text-3xl text-ink">Control How Cookies Are Used</h2>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">
                We only use optional cookies with your consent. You can change your preferences at any time from the footer.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Strictly Necessary</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    Required for security, checkout flow, and core website functionality. These cookies are always active.
                  </p>
                </div>
                <Toggle id="consent-necessary" checked disabled />
              </div>

              <div className="rounded-xl border border-line/60 bg-bg-soft/60 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Preferences</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    Remembers settings such as your cookie choices and interface preferences.
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
                  <p className="text-sm font-semibold text-ink">Analytics</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    Helps us understand traffic and improve content using aggregated measurement data.
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
                  <p className="text-sm font-semibold text-ink">Marketing</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">
                    Used for ad personalization and cross-platform campaign attribution. Currently disabled unless enabled by you.
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
                Back
              </button>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase border border-line-strong text-ink/70 hover:text-gold hover:border-gold/40 transition-colors"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={saveSelected}
                  className="px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase bg-gold text-bg hover:bg-gold-light transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-line-strong bg-bg-mid/95 backdrop-blur-md shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
        <div className="container-shell py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs text-gold tracking-[0.16em] uppercase font-semibold">Your Privacy Choices</p>
            <p className="text-xs md:text-sm text-ink/70 mt-1 leading-relaxed max-w-3xl">
              We use essential cookies for site operation. Optional cookies are used only with your consent. Read our{" "}
              <Link href="/privacy" className="underline decoration-gold/45 underline-offset-4 hover:text-gold transition-colors">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookie-policy" className="underline decoration-gold/45 underline-offset-4 hover:text-gold transition-colors">
                Cookie Policy
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
              Reject Optional
            </button>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="px-3 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase border border-line-strong text-ink/75 hover:text-gold hover:border-gold/50 transition-colors"
            >
              Customize
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="px-3 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase bg-gold text-bg hover:bg-gold-light transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
