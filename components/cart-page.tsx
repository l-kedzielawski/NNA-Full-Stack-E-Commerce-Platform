"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  clearStoredCartId,
  ensureCartRegionForLocaleAndCountry,
  formatAmount,
  getCart,
  getStoredCartId,
  MedusaCart,
  removeLineItem,
  updateLineItem,
} from "@/lib/medusa-cart";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

const fallbackImage = "/hero.jpg";

function lineTotal(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

export function CartPage() {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  const t = {
    loading: locale === "pl" ? "Ladowanie koszyka..." : "Loading cart...",
    loadError: locale === "pl" ? "Nie udalo sie zaladowac koszyka." : "Could not load cart.",
    empty: locale === "pl" ? "Twoj koszyk jest pusty" : "Your cart is empty",
    emptyTitle: locale === "pl" ? "Uzupelnij go produktami" : "Let's fill it with flavor",
    emptyText:
      locale === "pl"
        ? "Dodaj produkty ze sklepu, a nastepnie przejdz do finalizacji zamowienia."
        : "Add products from the shop, then continue to checkout.",
    browse: locale === "pl" ? "Przegladaj produkty" : "Browse Products",
    cart: locale === "pl" ? "Koszyk" : "Cart",
    item: locale === "pl" ? "produkt" : "item",
    items: locale === "pl" ? "produkty" : "items",
    each: locale === "pl" ? "za sztuke" : "each",
    remove: locale === "pl" ? "Usun" : "Remove",
    summary: locale === "pl" ? "Podsumowanie" : "Order summary",
    subtotal: locale === "pl" ? "Suma czesciowa" : "Subtotal",
    shipping: locale === "pl" ? "Dostawa" : "Shipping",
    tax: locale === "pl" ? "VAT (w cenie)" : "VAT (included)",
    discounts: locale === "pl" ? "Rabaty" : "Discounts",
    total: locale === "pl" ? "Razem" : "Total",
    freeShipping:
      locale === "pl"
        ? "Darmowa wysylka na caly swiat dotyczy zestawow Essence of Madagascar i Taste of Madagascar."
        : "Free worldwide shipping applies to Essence of Madagascar and Taste of Madagascar starter packs.",
    checkout: locale === "pl" ? "Przejdz do platnosci" : "Continue to Checkout",
    keepShopping: locale === "pl" ? "Kontynuuj zakupy" : "Keep Shopping",
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const cartId = getStoredCartId();
      if (!cartId) {
        if (!cancelled) {
          setCart(null);
          setLoading(false);
        }
        return;
      }

      try {
        const fetched = await getCart(cartId);
        let normalizedCart = fetched;

        if (fetched) {
          const preferredCountryCode = locale === "pl" ? "PL" : undefined;
          normalizedCart = await ensureCartRegionForLocaleAndCountry(
            fetched,
            locale,
            preferredCountryCode,
          ).catch(() => fetched);
        }

        if (!cancelled) {
          setCart(normalizedCart);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : locale === "pl"
                ? "Nie udalo sie zaladowac koszyka."
                : "Could not load cart.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const itemCount = useMemo(
    () => (cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0),
    [cart],
  );

  if (loading) {
    return <p className="text-sm text-ink/55">{t.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-gold/60">{t.empty}</p>
        <h2 className="mt-3 font-display text-3xl text-ink">{t.emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/55">
          {t.emptyText}
        </p>
        <Link
          href={withLocalePrefix("/products", locale)}
          className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
        >
          {t.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-6 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">{t.cart}</p>
          <h2 className="font-display text-3xl text-ink">
            {itemCount} {itemCount === 1 ? t.item : t.items}
          </h2>
        </div>

        <div className="divide-y divide-line/40">
          {cart.items.map((item) => {
            const total = lineTotal(item.quantity, item.unit_price);

            return (
              <article key={item.id} className="grid gap-4 px-6 py-5 md:grid-cols-[100px_1fr_auto] md:items-center">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-line/50 bg-bg-soft">
                  {item.product_handle ? (
                      <Link href={withLocalePrefix(`/products/${item.product_handle}`, locale)} className="block h-full w-full">
                      <Image
                        src={item.thumbnail || fallbackImage}
                        alt={item.product_title || item.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={item.thumbnail || fallbackImage}
                      alt={item.product_title || item.title}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  )}
                </div>

                <div>
                  {item.product_handle ? (
                    <Link
                      href={withLocalePrefix(`/products/${item.product_handle}`, locale)}
                      className="font-semibold text-ink transition-colors hover:text-gold"
                    >
                      {item.product_title || item.title}
                    </Link>
                  ) : (
                    <p className="font-semibold text-ink">{item.product_title || item.title}</p>
                  )}
                  {item.variant_title && item.variant_title !== "Default" && (
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{item.variant_title}</p>
                  )}
                  <p className="mt-2 text-sm text-ink/55">
                    {formatAmount(item.unit_price, cart.currency_code)} {t.each}
                  </p>

                  <div className="mt-3 inline-flex items-center overflow-hidden rounded-full border border-line">
                    <button
                      type="button"
                      onClick={async () => {
                        if (item.quantity <= 1) {
                          const next = await removeLineItem(cart.id, item.id);
                          setCart(next);
                          if (!next || next.items.length === 0) {
                            clearStoredCartId();
                          }
                          return;
                        }

                        const next = await updateLineItem(cart.id, item.id, item.quantity - 1);
                        setCart(next);
                      }}
                      className="px-3 py-1.5 text-ink/70 hover:bg-bg-soft"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold text-ink">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const next = await updateLineItem(cart.id, item.id, item.quantity + 1);
                        setCart(next);
                      }}
                      className="px-3 py-1.5 text-ink/70 hover:bg-bg-soft"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-semibold text-ink">
                    {formatAmount(total, cart.currency_code)}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = await removeLineItem(cart.id, item.id);
                      setCart(next);
                      if (!next || next.items.length === 0) {
                        clearStoredCartId();
                      }
                    }}
                    className="mt-2 text-xs uppercase tracking-[0.12em] text-ink/40 hover:text-red-400"
                  >
                    {t.remove}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-line bg-card p-6 h-fit">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/60">{t.summary}</p>
        <div className="mt-4 space-y-3 text-sm text-ink/65">
          <div className="flex items-center justify-between">
            <span>{t.subtotal}</span>
            <span>{formatAmount(cart.subtotal, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.shipping}</span>
            <span>{formatAmount(cart.shipping_total, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.tax}</span>
            <span>{formatAmount(cart.tax_total, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.discounts}</span>
            <span>-{formatAmount(cart.discount_total, cart.currency_code)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4 flex items-center justify-between">
          <span className="font-semibold text-ink">{t.total}</span>
          <span className="font-semibold text-ink">{formatAmount(cart.total, cart.currency_code)}</span>
        </div>

        <p className="mt-3 text-xs text-gold/75">
          {t.freeShipping}
        </p>

        <Link
          href={withLocalePrefix("/checkout", locale)}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg"
        >
          {t.checkout}
        </Link>

        <Link
          href={withLocalePrefix("/products", locale)}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink/65"
        >
          {t.keepShopping}
        </Link>
      </aside>
    </div>
  );
}
