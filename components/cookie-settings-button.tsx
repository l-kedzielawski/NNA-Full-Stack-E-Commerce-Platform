"use client";

import { usePathname } from "next/navigation";
import { openCookiePreferences } from "@/lib/cookie-consent";
import { defaultLocale, getLocaleFromPathname } from "@/lib/i18n";

export function CookieSettingsButton({ label }: { label?: string }) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const resolvedLabel = label || (locale === "pl" ? "Ustawienia cookies" : "Cookie settings");

  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="text-[0.65rem] text-ink/50 hover:text-gold transition-colors"
    >
      {resolvedLabel}
    </button>
  );
}
