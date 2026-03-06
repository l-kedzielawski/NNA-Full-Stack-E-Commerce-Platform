import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Payment Confirmed",
  description: "Your payment has been completed.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PaymentSuccessPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <main className="pt-24 section-space">
      <div className="container-shell">
        <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">
            {locale === "pl" ? "Platnosc potwierdzona" : "Payment confirmed"}
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink">
            {locale === "pl" ? "Dziekujemy za platnosc" : "Thank you for your payment"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/55">
            {locale === "pl"
              ? "Platnosc zostala zakonczona. Skontaktujemy sie z Toba w sprawie dalszych krokow."
              : "Your payment has been completed. Our team will contact you with the next steps shortly."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={withLocalePrefix("/contact", locale)}
              className="inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
            >
              {locale === "pl" ? "Skontaktuj nas" : "Contact Us"}
            </Link>
            <Link
              href={withLocalePrefix("/", locale)}
              className="inline-flex rounded-full border border-line px-7 py-3 text-sm font-semibold text-ink/65"
            >
              {locale === "pl" ? "Powrot na strone glowna" : "Back to Home"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
