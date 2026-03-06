import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isSupportedLocale, withLocalePrefix, type SiteLocale } from "@/lib/i18n";

export default async function NotFound() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <main className="pt-20 section-space">
      <div className="container-shell rounded-3xl border border-line bg-card p-10 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-gold/70 uppercase">404</p>
        <h1 className="mt-3 font-display text-6xl leading-none text-ink">
          {locale === "pl" ? "Nie znaleziono strony" : "Page not found"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink/75">
          {locale === "pl"
            ? "Nie mozemy znalezc tej strony. Wroc do sklepu lub na strone glowna, aby dalej odkrywac wanilie z Madagaskaru i skladniki premium."
            : "We could not find that page. Use the shop or homepage to keep exploring Madagascar vanilla and specialty ingredients."}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href={withLocalePrefix("/", locale)}
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-bg hover:bg-gold-light"
          >
            {locale === "pl" ? "Strona glowna" : "Homepage"}
          </Link>
          <Link
            href={withLocalePrefix("/products", locale)}
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink/80 hover:border-gold/40"
          >
            {locale === "pl" ? "Sklep" : "Product shop"}
          </Link>
        </div>
      </div>
    </main>
  );
}
