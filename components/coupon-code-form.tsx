"use client";

import { useMemo, useState } from "react";
import {
  applyCouponCode,
  getCart,
  MedusaCart,
  removeCouponCode,
} from "@/lib/medusa-cart";
import { type SiteLocale } from "@/lib/i18n";

type CouponCodeFormProps = {
  cart: MedusaCart;
  locale: SiteLocale;
  onCartUpdate: (cart: MedusaCart) => void;
  className?: string;
};

function getManualCouponCode(cart: MedusaCart): string | null {
  const promotion = (cart.promotions || []).find((entry) => !entry.is_automatic && entry.code?.trim());
  return promotion?.code?.trim().toUpperCase() || null;
}

export function CouponCodeForm({ cart, locale, onCartUpdate, className }: CouponCodeFormProps) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const activeCode = useMemo(() => getManualCouponCode(cart), [cart]);

  const t = {
    heading: locale === "pl" ? "Kod rabatowy" : "Coupon code",
    placeholder: locale === "pl" ? "Wpisz kod" : "Enter code",
    apply: locale === "pl" ? "Zastosuj" : "Apply",
    remove: locale === "pl" ? "Usun" : "Remove",
    active: locale === "pl" ? "Aktywny kod" : "Active code",
    oneOnly:
      locale === "pl"
        ? "W koszyku moze byc aktywny tylko jeden kod. Najpierw usun obecny kod."
        : "Only one coupon code can be active at a time. Remove the current code first.",
    applied:
      locale === "pl"
        ? "Kod rabatowy zostal zastosowany."
        : "Coupon code applied successfully.",
    removed:
      locale === "pl"
        ? "Kod rabatowy zostal usuniety."
        : "Coupon code removed.",
    alreadyApplied:
      locale === "pl"
        ? "Ten kod jest juz aktywny."
        : "This coupon code is already active.",
  };

  const onApply = async () => {
    const normalizedCode = code.trim().toUpperCase();
    setError(null);
    setNotice(null);

    if (!normalizedCode) {
      setError(locale === "pl" ? "Wpisz kod rabatowy." : "Enter a coupon code.");
      return;
    }

    if (activeCode && activeCode !== normalizedCode) {
      setError(t.oneOnly);
      return;
    }

    if (activeCode === normalizedCode) {
      setNotice(t.alreadyApplied);
      return;
    }

    setPending(true);

    try {
      const updatedCart = await applyCouponCode(cart.id, normalizedCode);
      const refreshedCart = await getCart(updatedCart.id);
      onCartUpdate(updatedCart);
      if (refreshedCart) {
        onCartUpdate(refreshedCart);
      }
      setCode("");
      setNotice(t.applied);
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : locale === "pl" ? "Nie udalo sie zastosowac kodu." : "Could not apply coupon code.");
    } finally {
      setPending(false);
    }
  };

  const onRemove = async () => {
    if (!activeCode) {
      return;
    }

    setError(null);
    setNotice(null);
    setPending(true);

    try {
      const updatedCart = await removeCouponCode(cart.id, activeCode);
      const refreshedCart = await getCart(updatedCart.id);
      onCartUpdate(updatedCart);
      if (refreshedCart) {
        onCartUpdate(refreshedCart);
      }
      setNotice(t.removed);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : locale === "pl" ? "Nie udalo sie usunac kodu." : "Could not remove coupon code.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={className}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/45">{t.heading}</p>

      {activeCode ? (
        <div className="mt-3 rounded-lg border border-gold/25 bg-gold/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-gold/80">{t.active}</p>
              <p className="mt-1 text-sm font-bold tracking-[0.12em] text-ink">{activeCode}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void onRemove();
              }}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/65 transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-70"
            >
              {pending ? "..." : t.remove}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/50">{t.oneOnly}</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder={t.placeholder}
            disabled={pending}
            className="h-11 w-full min-w-0 rounded-xl border border-line bg-bg-soft px-3.5 text-sm uppercase tracking-[0.08em] text-ink outline-none transition placeholder:text-ink/35 focus:border-gold/40 disabled:opacity-70"
          />
          <button
            type="button"
            onClick={() => {
              void onApply();
            }}
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gold px-5 text-sm font-bold text-bg disabled:opacity-70"
          >
            {pending ? "..." : t.apply}
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      {notice ? <p className="mt-2 text-xs text-gold/75">{notice}</p> : null}
    </div>
  );
}
