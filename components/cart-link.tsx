"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCart, getStoredCartId } from "@/lib/medusa-cart";

function countItems(quantityList: number[]) {
  return quantityList.reduce((sum, value) => sum + value, 0);
}

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const cartId = getStoredCartId();
      if (!cartId) {
        if (!cancelled) {
          setCount(0);
        }
        return;
      }

      const cart = await getCart(cartId);
      if (!cancelled) {
        setCount(cart ? countItems(cart.items.map((item) => item.quantity)) : 0);
      }
    };

    const handleUpdate = () => {
      void refresh();
    };

    void refresh();
    window.addEventListener("cart:updated", handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("cart:updated", handleUpdate);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink/70 hover:border-gold/40 hover:text-ink transition-all"
      aria-label="Open cart"
    >
      <ShoppingBag size={17} />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-gold px-1.5 py-0.5 text-center text-[0.62rem] font-bold text-bg">
          {count}
        </span>
      )}
    </Link>
  );
}
