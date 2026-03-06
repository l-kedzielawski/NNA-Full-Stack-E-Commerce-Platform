"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

const hiddenRouteSuffixes = ["/quote", "/cart", "/checkout", "/checkout/success"];

export function StickyQuoteCta() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname || "/") || defaultLocale;

  if (!pathname || hiddenRouteSuffixes.some((route) => pathname === route || pathname.endsWith(route))) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line/70 bg-bg/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:hidden">
      <Link
        href={withLocalePrefix("/quote", locale)}
        className="block rounded-full bg-gold px-5 py-3 text-center text-sm font-bold text-bg shadow-[0_0_25px_rgba(201,169,110,0.35)]"
      >
        {locale === "pl" ? "Zapytanie B2B" : "Start a B2B Inquiry"}
      </Link>
    </div>
  );
}
