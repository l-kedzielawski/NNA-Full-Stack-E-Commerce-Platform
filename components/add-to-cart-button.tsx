"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/medusa-cart";

type AddToCartButtonProps = {
  variantId?: string;
  regionId?: string;
  className?: string;
  label?: string;
  redirectTo?: string;
};

export function AddToCartButton({
  variantId,
  regionId,
  className,
  label = "Add to Cart",
  redirectTo,
}: AddToCartButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!variantId) {
    return (
      <Link
        href="/quote"
        className={
          className ||
          "inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-bg"
        }
      >
        Request Quote
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);

          try {
            await addToCart(regionId || process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "", variantId, 1);
            if (redirectTo) {
              router.push(redirectTo);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not add to cart.");
          } finally {
            setPending(false);
          }
        }}
        className={
          className ||
          "group inline-flex items-center rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_40px_rgba(201,169,110,0.45)] transition-all duration-300 disabled:opacity-70"
        }
      >
        {pending ? "Adding..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
