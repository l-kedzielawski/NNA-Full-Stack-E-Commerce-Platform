"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { addToCart, resolvePreferredRegionId } from "@/lib/medusa-cart";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

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
  label,
  redirectTo,
}: AddToCartButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  const t = {
    quote: locale === "pl" ? "Popros o wycene" : "Request Quote",
    adding: locale === "pl" ? "Dodawanie..." : "Adding...",
    addError: locale === "pl" ? "Nie udalo sie dodac do koszyka." : "Could not add to cart.",
    addToCart: locale === "pl" ? "Dodaj do koszyka" : "Add to Cart",
  };

  const resolvedLabel = label || t.addToCart;

  if (!variantId) {
    return (
      <Link
        href={withLocalePrefix("/quote", locale)}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-bg"
        }
      >
        {t.quote}
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
            const resolvedRegionId =
              regionId ||
              (await resolvePreferredRegionId(locale)) ||
              process.env.NEXT_PUBLIC_MEDUSA_REGION_ID ||
              "";

            await addToCart(resolvedRegionId, variantId, 1);
            if (redirectTo) {
              router.push(withLocalePrefix(redirectTo, locale));
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : t.addError);
          } finally {
            setPending(false);
          }
        }}
        className={
          className ||
          "group inline-flex items-center rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-bg shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-gold-light hover:shadow-[0_0_40px_rgba(201,169,110,0.45)] transition-all duration-300 disabled:opacity-70"
        }
      >
        {pending ? t.adding : resolvedLabel}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
