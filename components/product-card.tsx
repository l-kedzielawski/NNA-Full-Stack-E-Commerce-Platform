"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { type Product } from "@/lib/products";
import { formatPrice, truncateText } from "@/lib/utils";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

type ProductCardProps = {
  product: Product;
};

const fallbackImage = "/images/products/cocoa-mass2-1.jpg";

const categoryLabelsPl: Record<string, string> = {
  "Vanilla Pods": "Laski wanilii",
  "Vanilla Powder & Seeds": "Wanilia mielona i ziarenka",
  "Vanilla Powders & Seeds": "Wanilia mielona i ziarenka",
  "Vanilla Extracts": "Ekstrakty waniliowe",
  Cocoa: "Kakao",
  "Spices & Other": "Przyprawy i inne",
  "Samples & Gift Sets": "Probki i zestawy prezentowe",
};

function localizeCategoryLabel(category: string | undefined, locale: "en" | "pl"): string {
  if (!category) {
    return locale === "pl" ? "Skladnik premium" : "Specialty Ingredient";
  }

  if (locale !== "pl") {
    return category;
  }

  return categoryLabelsPl[category] || category;
}

export function ProductCard({ product }: ProductCardProps) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const image = product.imageUrls[0] ?? fallbackImage;
  const normalizedSku = product.sku.trim().toUpperCase();
  const isInStock = product.stockStatus === "instock" || product.stockStatus === "onbackorder";
  const isStarterPack = ["SET-E", "SET-T"].includes(normalizedSku);
  const isCocoaBeansProduct =
    normalizedSku.includes("COCOA-BEAN") || product.title.toLowerCase().includes("cocoa beans");
  const stockLabel = isInStock
    ? isCocoaBeansProduct
      ? "FOB / CIF MADAGASCAR"
      : locale === "pl"
        ? "Dostepny"
        : "In Stock"
    : locale === "pl"
      ? "Wycena"
      : "Quote Only";

  const productPath = withLocalePrefix(`/products/${product.slug}`, locale);

  return (
    <article className="product-card-shell group relative overflow-hidden rounded-2xl border border-line bg-card hover:border-gold/40 transition-all duration-700">

      {/* Gold accent top bar — sweeps in on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-center" />

      <Link href={productPath} className="block">

        {/* ── IMAGE ZONE ───────────────────────────────────── */}
        <div className="product-card-image-bg relative aspect-[4/3] overflow-hidden">

          {/* Photo — zooms in slightly, sharpens on hover */}
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover scale-[1.04] group-hover:scale-100 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gold sheen sweep — diagonal flash on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(115deg, transparent 30%, rgba(201,169,110,0.07) 50%, transparent 70%)",
            }}
          />

          {/* ── BADGES & CONTROLS ── */}

          {/* Stock badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider backdrop-blur-sm ${
              isInStock
                ? isCocoaBeansProduct
                  ? "bg-gold/20 text-gold border border-gold/35"
                  : "bg-moss/20 text-moss-light border border-moss/25"
                : "bg-gold-dim text-gold border border-gold/20"
            }`}>
              {stockLabel}
            </span>
          </div>

          {/* Arrow CTA — fades in on hover */}
          <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gold border border-gold transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <ArrowUpRight size={14} className="text-bg" />
          </div>

          {/* View label — slides up from bottom on hover */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <span className="product-card-view-chip px-4 py-1.5 rounded-full backdrop-blur-sm border border-gold/30 text-[0.65rem] tracking-[0.2em] uppercase text-gold/90 font-semibold">
              {locale === "pl" ? "Zobacz" : "View Product"}
            </span>
          </div>
        </div>

        {/* ── CONTENT ZONE ─────────────────────────────────── */}
        <div className="p-5 space-y-2.5">
          <p className="label-sm text-gold/45 truncate">
            {localizeCategoryLabel(product.categoryNames[0], locale)}
          </p>

          <h3 className="font-display text-[1.3rem] leading-snug text-ink line-clamp-2 group-hover:text-gold transition-colors duration-500">
            {product.title}
          </h3>

          <p className="text-xs leading-relaxed text-ink/55 line-clamp-2">
            {truncateText(product.description, 100)}
          </p>

          {isStarterPack ? (
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-gold/80">
              {locale === "pl" ? "Darmowa dostawa na caly swiat" : "Free Shipping Worldwide"}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="border-t border-line/50 p-5 pt-3">
        <p className="font-display text-2xl text-gold md:text-[1.7rem]">
          {formatPrice(product.price, {
            currencyCode: product.currencyCode || undefined,
            locale: locale === "pl" ? "pl-PL" : "en-GB",
          })}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Link
            href={productPath}
            className="inline-flex items-center justify-center rounded-full border border-line/80 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink/70 transition-all duration-300 hover:border-gold/40 hover:text-gold"
          >
            {locale === "pl" ? "Poznaj" : "Discover"}
          </Link>
          <AddToCartButton
            variantId={product.variantId}
            label={locale === "pl" ? "Dodaj do koszyka" : "Add to Cart"}
            className="inline-flex items-center justify-center rounded-full bg-gold px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-bg transition-all duration-300 hover:bg-gold-light"
          />
        </div>
      </div>
    </article>
  );
}
