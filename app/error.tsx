"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="label-sm text-gold mb-4">{locale === "pl" ? "Cos poszlo nie tak" : "Something went wrong"}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
          {locale === "pl" ? "Nieoczekiwany blad" : "Unexpected Error"}
        </h1>
        <p className="text-ink/55 mb-8 leading-relaxed">
          {locale === "pl"
            ? "Wystapil problem podczas ladowania strony. Sprobuj ponownie lub wroc na strone glowna."
            : "We encountered an issue loading this page. Please try again or return to the homepage."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 rounded-full bg-gold text-bg font-semibold hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,169,110,0.2)]"
          >
            {locale === "pl" ? "Sprobuj ponownie" : "Try Again"}
          </button>
          <Link
            href={withLocalePrefix("/", locale)}
            className="px-8 py-4 rounded-full border border-line text-ink/70 hover:border-gold/50 hover:text-ink transition-all"
          >
            {locale === "pl" ? "Wroc na start" : "Go Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
