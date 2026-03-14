import type { Metadata } from "next";
import { headers } from "next/headers";
import { RequestQuoteForm } from "@/components/request-quote-form";
import { getAllProducts } from "@/lib/products";
import { Leaf, CheckCircle2 } from "lucide-react";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

// Force runtime rendering so product list is always fetched live from Medusa.
export const dynamic = "force-dynamic";

type QuotePageProps = {
  searchParams?: Promise<{ product?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/quote",
    locale,
    title: {
      en: "B2B Inquiry",
      pl: "Zapytanie B2B",
    },
    description: {
      en: "Share your volume, destination, and quality requirements. We reply with practical B2B terms, documents, and lead times.",
      pl: "Przeslij wolumen, kierunek dostawy i wymagania jakosciowe. Odpowiemy praktycznymi warunkami B2B, dokumentami i terminami.",
    },
  });
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const preselectedProduct = resolvedSearchParams.product;

  const products = await getAllProducts(locale);
  const productOptions = products.map((product) => product.title);

  return (
    <main className="pt-20 section-space" id="request-samples">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* Left panel */}
        <section className="rounded-2xl border border-line bg-card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={12} className="text-gold" />
            <p className="text-xs font-bold tracking-[0.22em] text-gold/60 uppercase">
              {locale === "pl" ? "Zapytanie B2B" : "B2B Inquiry"}
            </p>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,4vw,4rem)] leading-[0.95] text-ink">
            {locale === "pl" ? "Zapytanie B2B" : "B2B Inquiry"}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/55">
            {locale === "pl"
              ? "Opisz swoje potrzeby, a przygotujemy rekomendowane produkty, warunki dostawy i realistyczny plan wdrozenia wspolpracy."
              : "Send your requirements and we will reply with recommended products, shipping terms, and a realistic onboarding timeline."}
          </p>

          <div className="mt-8 space-y-3 rounded-xl border border-line bg-bg-soft/40 p-5">
            <p className="text-xs font-bold tracking-[0.18em] text-gold/60 uppercase mb-4">
              {locale === "pl" ? "Najwazniejsze informacje" : "Typical details to include"}
            </p>
            {[
              locale === "pl"
                ? "Format produktu i oczekiwany profil aromatu"
                : "Product format and target aroma profile",
              locale === "pl"
                ? "Wolumen miesieczny lub kwartalny"
                : "Quantity per month or per quarter",
              locale === "pl"
                ? "Kraj dostawy i preferowane Incoterms"
                : "Destination country and Incoterm preference",
              locale === "pl"
                ? "Planowana data startu lub harmonogram produkcji"
                : "Desired launch date or production timeline",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-gold/50 mt-0.5 shrink-0" />
                <p className="text-sm text-ink/60">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gold/20 bg-gold-dim p-5">
            <p className="text-xs font-bold tracking-[0.18em] text-gold/70 uppercase mb-2">
              {locale === "pl" ? "Czas odpowiedzi" : "Response time"}
            </p>
            <p className="text-sm text-ink/65">
              {locale === "pl"
                ? "Standardowo odpowiadamy w ciagu 24 godzin w dni robocze, podajac ceny i dostepnosc."
                : "We typically respond within 24 hours on business days with pricing and availability."}
            </p>
          </div>
        </section>

        <RequestQuoteForm
          productOptions={productOptions}
          preselectedProduct={preselectedProduct}
        />
      </div>
    </main>
  );
}
