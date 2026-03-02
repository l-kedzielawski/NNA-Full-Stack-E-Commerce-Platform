import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ProductShop } from "@/components/product-catalog";
import { Reveal } from "@/components/reveal";
import { MarqueeStrip } from "@/components/marquee-strip";
import { getAllProducts, getProductCategories } from "@/lib/products";

// Force runtime rendering so product data (including variant IDs) is always
// fetched live from Medusa rather than being baked in at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Shop",
  description:
    "Browse Madagascar vanilla, cocoa, exotic spices, and essential oils — prepared for professional B2B use.",
};

export default async function ProductsPage() {
  const products = await getAllProducts();
  const categories = await getProductCategories();

  return (
    <main className="pt-20">
      {/* Hero banner */}
      <section className="relative overflow-hidden min-h-[42vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Madagascar products"
            fill
            priority
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/99 via-bg/90 to-bg/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/80" />
        </div>

        <div className="relative z-10 container-shell py-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px bg-gold/60" />
              <span className="label-sm text-gold/60">Our Products</span>
            </div>
            <h1
              className="font-display text-ink leading-[0.9] mb-6"
              style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
            >
              Bourbon Vanilla.<br />
              <span className="text-gold">Cocoa &amp; Exotic Spices.</span>
            </h1>
            <p className="text-ink/55 text-base leading-relaxed max-w-xl">
              Explore our full available range, packaged for your needs. Order
              samples, validate quality in your own process, and when you need
              something specific from Madagascar, we&apos;ll source it with you.
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
