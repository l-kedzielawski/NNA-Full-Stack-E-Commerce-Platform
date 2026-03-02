"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  clearStoredCartId,
  formatAmount,
  getCart,
  getStoredCartId,
  MedusaCart,
  removeLineItem,
  updateLineItem,
} from "@/lib/medusa-cart";

const fallbackImage = "/hero.jpg";

function lineTotal(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

export function CartPage() {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) {
          setCart(fetched);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load cart.");
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
  }, []);

  const itemCount = useMemo(
    () => (cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0),
    [cart],
  );

  if (loading) {
    return <p className="text-sm text-ink/55">Loading cart...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-gold/60">Your cart is empty</p>
        <h2 className="mt-3 font-display text-3xl text-ink">Let&apos;s fill it with flavor</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/55">
          Add products from the shop, then continue to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-6 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">Cart</p>
          <h2 className="font-display text-3xl text-ink">{itemCount} item{itemCount > 1 ? "s" : ""}</h2>
        </div>

        <div className="divide-y divide-line/40">
          {cart.items.map((item) => {
            const total = lineTotal(item.quantity, item.unit_price);

            return (
              <article key={item.id} className="grid gap-4 px-6 py-5 md:grid-cols-[100px_1fr_auto] md:items-center">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-line/50 bg-bg-soft">
                  {item.product_handle ? (
                    <Link href={`/products/${item.product_handle}`} className="block h-full w-full">
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
                      href={`/products/${item.product_handle}`}
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
                    {formatAmount(item.unit_price, cart.currency_code)} each
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
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-line bg-card p-6 h-fit">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/60">Order summary</p>
        <div className="mt-4 space-y-3 text-sm text-ink/65">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatAmount(cart.subtotal, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{formatAmount(cart.shipping_total, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>{formatAmount(cart.tax_total, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discounts</span>
            <span>-{formatAmount(cart.discount_total, cart.currency_code)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4 flex items-center justify-between">
          <span className="font-semibold text-ink">Total</span>
          <span className="font-semibold text-ink">{formatAmount(cart.total, cart.currency_code)}</span>
        </div>

        <p className="mt-3 text-xs text-gold/75">
          Free worldwide shipping applies to Essence of Madagascar and Taste of Madagascar starter packs.
        </p>

        <Link
          href="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg"
        >
          Continue to Checkout
        </Link>

        <Link
          href="/products"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink/65"
        >
          Keep Shopping
        </Link>
      </aside>
    </div>
  );
}
