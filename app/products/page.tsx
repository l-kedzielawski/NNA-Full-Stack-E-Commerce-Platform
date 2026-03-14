import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { ProductShop } from "@/components/product-catalog";
import { Reveal } from "@/components/reveal";
import { MarqueeStrip } from "@/components/marquee-strip";
import { ThemedImage } from "@/components/themed-image";
import { createLocalizedMetadata, getRequestLocale } from "@/lib/metadata";
import { getAllProducts, getProductCategories } from "@/lib/products";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

// Force runtime rendering so product data (including variant IDs) is always
// fetched live from Medusa rather than being baked in at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createLocalizedMetadata({
    pathname: "/products",
    locale,
    title: {
      en: "Products",
      pl: "Produkty",
    },
    description: {
      en: "Browse Madagascar vanilla, cocoa, exotic spices, and essential oils prepared for professional B2B and premium retail use.",
      pl: "Przegladaj wanilie z Madagaskaru, kakao, egzotyczne przyprawy i olejki eteryczne przygotowane dla B2B i premium retail.",
    },
  });
}

export default async function ProductsPage() {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-site-locale") || "";
  const locale: SiteLocale = isSupportedLocale(localeHeader) ? localeHeader : defaultLocale;

  const products = await getAllProducts(locale);
  const categories = await getProductCategories();

  return (
    <main className="pt-20">
      {/* Hero banner */}
      <section className="relative overflow-hidden min-h-[42vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <ThemedImage
            darkSrc="/hero.jpg"
            lightSrc="/hero-light.png"
            alt="Madagascar products"
            fill
            priority
            className="hero-main-image object-cover object-[72%_45%] md:object-[80%_42%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay-horizontal" />
          <div className="absolute inset-0 hero-overlay-vertical" />
        </div>

        <div className="relative z-10 container-shell py-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-gold/60" />
                <span className="label-sm text-gold/60">{locale === "pl" ? "Nasze produkty" : "Our Products"}</span>
              </div>
            <h1
              className="font-display text-ink leading-[0.9] mb-6"
              style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
            >
                {locale === "pl" ? "Wanilia Bourbon." : "Bourbon Vanilla."}<br />
                <span className="text-gold">
                  {locale === "pl" ? "Kakao i egzotyczne przyprawy." : "Cocoa & Exotic Spices."}
                </span>
              </h1>
              <p className="text-ink/55 text-base leading-relaxed max-w-xl">
                {locale === "pl"
                  ? "Poznaj pełną ofertę produktów gotowych do wdrożenia w Twoim procesie. Zamów próbki, zweryfikuj jakość, a jeśli potrzebujesz czegoś konkretnego z Madagaskaru, znajdziemy to razem z Tobą."
                  : "Explore our full available range, packaged for your needs. Order samples, validate quality in your own process, and when you need something specific from Madagascar, we'll source it with you."}
              </p>
          </Reveal>
        </div>
      </section>

      <MarqueeStrip />

      <div className="container-shell py-12">
        <Suspense>
          <ProductShop products={products} categories={categories} />
        </Suspense>
      </div>
    </main>
  );
}
