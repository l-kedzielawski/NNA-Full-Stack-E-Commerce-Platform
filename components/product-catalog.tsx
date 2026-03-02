"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { type Product } from "@/lib/products";

type ProductShopProps = {
  products: Product[];
  categories: string[];
};

const allProductsLabel = "All Products";

const categoryAliases: Record<string, string> = {
  All: allProductsLabel,
  Other: "Spices & Other",
  "Vanilla Powders & Seeds": "Vanilla Powder & Seeds",
  "Sample & Gift Sets": "Samples & Gift Sets",
};

function normalizeCategoryValue(value: string): string {
  return categoryAliases[value] ?? value;
}

export function ProductShop({ products, categories }: ProductShopProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlCategory = normalizeCategoryValue(searchParams.get("category") ?? allProductsLabel);
  const activeCategory = categories.includes(urlCategory) ? urlCategory : allProductsLabel;

  const [query, setQuery] = useState("");

  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === allProductsLabel) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const inCategory =
        activeCategory === allProductsLabel || product.categoryNames.includes(activeCategory);

      const searchText = `${product.title} ${product.description} ${product.sku}`.toLowerCase();
      const inQuery = searchText.includes(query.toLowerCase());

      return inCategory && inQuery;
    });
  }, [activeCategory, products, query]);

  return (
    <div className="space-y-7">
      {/* Filter bar */}
      <div className="rounded-2xl border border-line bg-card p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="relative">
            <span className="sr-only">Search products</span>
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, flavor, or SKU..."
              className="h-12 w-full rounded-xl border border-line bg-bg-soft pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-gold/40 focus:bg-bg"
            />
          </label>
          <p className="text-xs font-bold tracking-[0.15em] text-gold/50 uppercase whitespace-nowrap">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[allProductsLabel, ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.1em] uppercase transition-all duration-200 ${
                activeCategory === category
                  ? "border-gold bg-gold text-bg shadow-[0_0_15px_rgba(201,169,110,0.25)]"
                  : "border-line bg-transparent text-ink/50 hover:border-gold/40 hover:text-gold/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center">
          <p className="font-display text-3xl text-gold/60 mb-2">No matches found</p>
          <p className="text-sm text-ink/50">
            Clear your search or switch category to see more items.
          </p>
        </div>
      )}
    </div>
  );
}
