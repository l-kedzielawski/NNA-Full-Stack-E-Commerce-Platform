"use client";

import { openCookiePreferences } from "@/lib/cookie-consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="text-[0.65rem] text-ink/50 hover:text-gold transition-colors"
    >
      Cookie settings
    </button>
  );
}
