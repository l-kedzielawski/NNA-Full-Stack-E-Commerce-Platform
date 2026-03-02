import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { type Product } from "@/lib/products";
import { formatPrice, truncateText } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

const fallbackImage = "/images/products/cocoa-mass2-1.jpg";

export function ProductCard({ product }: ProductCardProps) {
  const image = product.imageUrls[0] ?? fallbackImage;
  const normalizedSku = product.sku.trim().toUpperCase();
  const isInStock = product.stockStatus === "instock" || product.stockStatus === "onbackorder";
  const isStarterPack = ["SET-E", "SET-T"].includes(normalizedSku);
  const isCocoaBeansProduct =
    normalizedSku.includes("COCOA-BEAN") || product.title.toLowerCase().includes("cocoa beans");
  const stockLabel = isInStock ? (isCocoaBeansProduct ? "FOB / CIF MADAGASCAR" : "In Stock") : "Quote Only";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-card hover:border-gold/40 transition-all duration-700 shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(201,169,110,0.08)]">

      {/* Gold accent top bar — sweeps in on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-center" />

      <Link href={`/products/${product.slug}`} className="block">

        {/* ── IMAGE ZONE ───────────────────────────────────── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0c08]">

          {/* Photo — zooms in slightly, sharpens on hover */}
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover scale-[1.04] group-hover:scale-100 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100 saturate-[0.88] group-hover:saturate-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Cinematic overlay — warm dark veil at rest, fades on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-[#1a1000]/60 group-hover:opacity-0 transition-opacity duration-700 ease-out" />

          {/* Persistent bottom fade — keeps text readable always */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Grain texture — sits on top of everything */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "180px",
            }}
          />

          {/* Gold sheen sweep — diagonal flash on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(115deg, transparent 30%, rgba(201,169,110,0.07) 50%, transparent 70%)",
            }}
          />

          {/* Vignette edges */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
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
            <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-gold/30 text-[0.65rem] tracking-[0.2em] uppercase text-gold/90 font-semibold">
              View Product
            </span>
          </div>
        </div>

        {/* ── CONTENT ZONE ─────────────────────────────────── */}
        <div className="p-5 space-y-2.5">
          <p className="label-sm text-gold/45 truncate">
            {product.categoryNames[0] ?? "Specialty Ingredient"}
          </p>

          <h3 className="font-display text-[1.3rem] leading-snug text-ink line-clamp-2 group-hover:text-gold transition-colors duration-500">
            {product.title}
          </h3>

          <p className="text-xs leading-relaxed text-ink/40 line-clamp-2">
            {truncateText(product.description, 100)}
          </p>

          {isStarterPack ? (
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-gold/80">
              Free Shipping Worldwide
            </p>
          ) : null}
        </div>
      </Link>

      <div className="border-t border-line/50 p-5 pt-3">
        <p className="font-display text-2xl text-gold md:text-[1.7rem]">{formatPrice(product.price)}</p>
        <div className="mt-3 flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-line/80 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink/70 transition-all duration-300 hover:border-gold/40 hover:text-gold"
          >
            Discover
          </Link>
          <AddToCartButton
            variantId={product.variantId}
            label="Add to Cart"
            className="inline-flex items-center justify-center rounded-full bg-gold px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-bg transition-all duration-300 hover:bg-gold-light"
          />
        </div>
      </div>
    </article>
  );
}
