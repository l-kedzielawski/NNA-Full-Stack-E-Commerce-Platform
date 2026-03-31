"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CouponCodeForm } from "@/components/coupon-code-form";
import {
  addToCart,
  clearStoredCartId,
  completeCart,
  ensureCartRegionForLocaleAndCountry,
  CheckoutCountryOption,
  createPaymentCollection,
  createPaymentSession,
  emitCartUpdated,
  formatAmount,
  getCart,
  getEffectiveCartDiscountTotal,
  getEffectiveCartTotal,
  getPaymentProviders,
  getShippingOptions,
  getStoredCartId,
  getProductPricingSummaryByHandle,
  listCheckoutCountriesForLocale,
  MedusaCart,
  removeLineItem,
  setShippingMethod,
  updateCartCustomer,
  validateEuVatForCart,
  findVariantIdByProductHandle,
} from "@/lib/medusa-cart";
import { defaultLocale, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

type CheckoutFormState = {
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone: string;
  vat_number: string;
  shipping_comment: string;
  billing_comment: string;
};

type PaymentProvider = {
  id: string;
  is_enabled: boolean;
};

const initialForm: CheckoutFormState = {
  email: "",
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  city: "",
  postal_code: "",
  country_code: "PL",
  phone: "",
  vat_number: "",
  shipping_comment: "",
  billing_comment: "",
};

const fallbackCountries: CheckoutCountryOption[] = [
  { code: "PL", name: "Poland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CZ", name: "Czechia" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
];

const FREE_SHIPPING_NAME_PREFIX = "Free Shipping - Starter Packs -";
const STARTER_PACK_SKUS = new Set(["SET-E", "SET-T"]);
const STARTER_PACK_PRODUCTS = [
  {
    title: "Essence of Madagascar",
    handle: "essence-of-madagascar-premium-bourbon-vanilla-collection-in-glass-tubes",
  },
  {
    title: "Taste of Madagascar",
    handle: "taste-of-madagascar",
  },
] as const;

type StarterPackPricingState = {
  title: string;
  price: number | null;
  currencyCode: string | null;
};

function buildStarterPackPricingDefaults(): Record<string, StarterPackPricingState> {
  return Object.fromEntries(
    STARTER_PACK_PRODUCTS.map((product) => [
      product.handle,
      {
        title: product.title,
        price: null,
        currencyCode: "EUR",
      },
    ]),
  );
}
const STARTER_PACK_HANDLES: Set<string> = new Set(
  STARTER_PACK_PRODUCTS.map((product) => product.handle),
);
const FREE_WORLDWIDE_SHIPPING_THRESHOLDS: Record<string, number> = {
  eur: 250,
  pln: 250,
};
const FREE_SHIPPING_PROMO_TEXT =
  "Free worldwide shipping is available (where configured for your destination) for orders over EUR 250, and for carts containing only Essence of Madagascar or Taste of Madagascar starter packs.";

const getOrderValueFreeShippingThreshold = (currencyCode: string): number | null => {
  const normalizedCurrencyCode = currencyCode.trim().toLowerCase();
  return FREE_WORLDWIDE_SHIPPING_THRESHOLDS[normalizedCurrencyCode] ?? null;
};

const isStarterPackCartItem = (item: {
  variant_sku?: string;
  product_handle?: string;
  product_title?: string;
  title?: string;
}): boolean => {
  const sku = item.variant_sku?.trim().toUpperCase() || "";
  if (STARTER_PACK_SKUS.has(sku)) {
    return true;
  }

  const handle = item.product_handle?.trim().toLowerCase() || "";
  if (STARTER_PACK_HANDLES.has(handle)) {
    return true;
  }

  const title = `${item.product_title || ""} ${item.title || ""}`.toLowerCase();
  return title.includes("essence of madagascar") || title.includes("taste of madagascar");
};

const qualifiesForStarterPackFreeShipping = (cart: MedusaCart): boolean => {
  if (!cart.items.length) {
    return false;
  }

  return cart.items.every((item) => isStarterPackCartItem(item));
};

const qualifiesForOrderValueFreeShipping = (cart: MedusaCart): boolean => {
  const threshold = getOrderValueFreeShippingThreshold(cart.currency_code);
  return threshold !== null && cart.subtotal >= threshold;
};

const qualifiesForAnyFreeShipping = (cart: MedusaCart): boolean => {
  return qualifiesForStarterPackFreeShipping(cart) || qualifiesForOrderValueFreeShipping(cart);
};

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const getStringValue = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const extractStripeSessionData = (sessionData: unknown): { clientSecret: string | null; status: string | null } => {
  const queue: unknown[] = [sessionData];
  const visited = new Set<unknown>();
  let clientSecret: string | null = null;
  let status: string | null = null;

  while (queue.length) {
    const current = queue.shift();

    if (!current || typeof current !== "object") {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const data = current as Record<string, unknown>;

    if (!clientSecret) {
      clientSecret = getStringValue(data.client_secret);
    }

    if (!status) {
      status = getStringValue(data.status);
    }

    queue.push(data.data, data.payment_intent, data.paymentIntent);
  }

  return { clientSecret, status: status?.toLowerCase() || null };
};

const extractStripeClientSecret = (paymentCollection: {
  payment_sessions?: Array<{ provider_id: string; data?: Record<string, unknown> }>;
}, providerId: string): string | null => {
  const sessions = (paymentCollection.payment_sessions || []).filter(
    (entry) => entry.provider_id === providerId,
  );

  let fallback: string | null = null;

  for (const session of [...sessions].reverse()) {
    const { clientSecret, status } = extractStripeSessionData(session.data);

    if (!clientSecret) {
      continue;
    }

    if (!fallback) {
      fallback = clientSecret;
    }

    if (status !== "canceled") {
      return clientSecret;
    }
  }

  return fallback;
};

const pickPreferredStripeProvider = (providers: PaymentProvider[]): PaymentProvider | null => {
  const enabledStripeProviders = providers.filter(
    (provider) => provider.is_enabled && provider.id.toLowerCase().includes("stripe"),
  );

  if (!enabledStripeProviders.length) {
    return null;
  }

  const baseStripeProvider = enabledStripeProviders.find((provider) => {
    const id = provider.id.toLowerCase();

    if (id === "stripe" || id === "pp_stripe_stripe") {
      return true;
    }

    return id.endsWith("_stripe") && !id.includes("stripe-");
  });

  return baseStripeProvider || enabledStripeProviders[0];
};

const getPreferredCountryCode = (
  availableCountries: CheckoutCountryOption[],
  locale: "en" | "pl",
): string => {
  if (!availableCountries.length) {
    return "PL";
  }

  const hasPoland = availableCountries.some((country) => country.code === "PL");
  if (hasPoland && locale === "pl") {
    return "PL";
  }

  const firstNonPoland = availableCountries.find((country) => country.code !== "PL");
  return firstNonPoland?.code || availableCountries[0].code;
};

export function CheckoutPage() {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [countries, setCountries] = useState<CheckoutCountryOption[]>(fallbackCountries);
  const [shippingOptions, setShippingOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(null);
  const [selectedShippingOptionName, setSelectedShippingOptionName] = useState<string | null>(null);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [stripePayment, setStripePayment] = useState<{
    cartId: string;
    providerId: string;
    clientSecret: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [quickAddPendingHandle, setQuickAddPendingHandle] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [resolvedStarterVariantIds, setResolvedStarterVariantIds] = useState<Record<string, string | null>>({});
  const [starterPackPricing, setStarterPackPricing] = useState<Record<string, StarterPackPricingState>>(
    buildStarterPackPricingDefaults,
  );
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;
  const paymentSessionInFlightRef = useRef(false);

  const localizePath = (path: string) => {
    const [pathnameOnly, query = ""] = path.split("?");
    const localizedPathname = withLocalePrefix(pathnameOnly || "/", locale);
    return query ? `${localizedPathname}?${query}` : localizedPathname;
  };

  const defaultPromoCurrencyCode = locale === "pl" ? "pln" : "eur";
  const promoCurrencyCode = (cart?.currency_code || defaultPromoCurrencyCode).toLowerCase();
  const promoOrderValueThreshold = getOrderValueFreeShippingThreshold(promoCurrencyCode);
  const promoOrderValueThresholdLabel =
    promoOrderValueThreshold !== null
      ? locale === "pl"
        ? `${promoOrderValueThreshold} ${promoCurrencyCode.toUpperCase()}`
        : `${promoCurrencyCode.toUpperCase()} ${promoOrderValueThreshold}`
      : locale === "pl"
        ? "250 PLN"
        : "EUR 250";

  const t = {
    cartNotFound: locale === "pl" ? "Nie znaleziono koszyka." : "Cart not found.",
    phoneRequired:
      locale === "pl"
        ? "Numer telefonu jest wymagany dla dostawy kurierem."
        : "Phone number is required for courier delivery.",
    itemRemoved:
      locale === "pl"
        ? "Produkt usuniety. Aby kontynuowac, ponownie przelicz dostawe i podatek."
        : "Item removed. Recalculate shipping and tax to continue.",
    removeError: locale === "pl" ? "Nie udalo sie usunac produktu." : "Could not remove item.",
    freeShippingPromo:
      locale === "pl"
        ? `Darmowa wysylka na caly swiat (tam gdzie dostepna) dotyczy zamowien powyzej ${promoOrderValueThresholdLabel} oraz koszykow zawierajacych tylko zestawy Essence of Madagascar lub Taste of Madagascar.`
        : FREE_SHIPPING_PROMO_TEXT.replace("EUR 250", promoOrderValueThresholdLabel),
  };

  const buildStripeReturnUrl = (): string => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL(window.location.href);
    url.searchParams.set("payment_return", "1");
    url.searchParams.delete("payment_intent");
    url.searchParams.delete("payment_intent_client_secret");
    url.searchParams.delete("redirect_status");

    return url.toString();
  };

  const resetCheckoutProgress = () => {
    setStripePayment(null);
    setShippingCalculated(false);
    setShowShippingOptions(false);
    setShippingOptions([]);
    setSelectedShippingOptionId(null);
    setSelectedShippingOptionName(null);
  };

  const updateFormField = <K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    resetCheckoutProgress();
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cartId = getStoredCartId();
      const fetchedCountries = await listCheckoutCountriesForLocale(locale).catch(() => fallbackCountries);
      const sortedCountries = [...fetchedCountries].sort((a, b) => a.name.localeCompare(b.name));

      if (!cancelled && sortedCountries.length) {
        setCountries(sortedCountries);

        setForm((prev) => {
          const hasCurrentCountry = sortedCountries.some(
            (country) => country.code === prev.country_code.toUpperCase(),
          );

          if (hasCurrentCountry) {
            return prev;
          }

          return { ...prev, country_code: getPreferredCountryCode(sortedCountries, locale) };
        });
      }

      if (!cartId) {
        if (!cancelled) {
          setCart(null);
          setLoading(false);
        }
        return;
      }

      const fetched = await getCart(cartId);

      if (!cancelled) {
        setCart(fetched);
        setLoading(false);
        if (fetched?.email) {
          setForm((prev) => ({ ...prev, email: fetched.email || "" }));
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!cart || typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");

    if (!paymentIntentClientSecret) {
      return;
    }

    let cancelled = false;

    const finalizeRedirectPayment = async () => {
      setPending(true);
      setError(null);
      setNotice(locale === "pl" ? "Finalizowanie platnosci..." : "Finalizing your payment...");

      try {
        if (!stripePromise) {
          throw new Error(
            locale === "pl"
              ? "Stripe nie jest skonfigurowany. Nie mozna sfinalizowac przekierowanej platnosci."
              : "Stripe is not configured. Cannot finalize redirected payment.",
          );
        }

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error(
            locale === "pl"
              ? "Stripe jest chwilowo niedostepny. Odswiez strone i sprobuj ponownie."
              : "Stripe is unavailable. Please refresh and try again.",
          );
        }

        const { paymentIntent, error: stripeError } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);

        if (stripeError) {
          throw new Error(
            stripeError.message ||
              (locale === "pl"
                ? "Nie udalo sie zweryfikowac statusu przekierowanej platnosci."
                : "Could not verify redirected payment status."),
          );
        }

        const status = paymentIntent?.status || "unknown";

        if (status === "requires_payment_method") {
          throw new Error(
            locale === "pl"
              ? "Platnosc nie zostala zakonczona. Wybierz metode platnosci i sprobuj ponownie."
              : "Payment was not completed. Please select a payment method and try again.",
          );
        }

        if (status !== "succeeded" && status !== "requires_capture") {
          setNotice(
            locale === "pl"
              ? `Status platnosci: ${status}. Jesli nastapilo przekierowanie, poczekaj chwile i kliknij ponownie Przejdz do platnosci.`
              : `Payment status: ${status}. If you were redirected, please wait a moment and click Continue to Payment again.`,
          );
          return;
        }

        const completion = await completeCart(cart.id);

        if (completion.type === "order" && completion.order?.id) {
          clearStoredCartId();
          emitCartUpdated();
          router.push(
            `${withLocalePrefix("/checkout/success", locale)}?order=${encodeURIComponent(completion.order.id)}`,
          );
          return;
        }

        throw new Error(completion.error?.message || "Payment was confirmed, but order completion failed.");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : locale === "pl"
                ? "Nie udalo sie sfinalizowac przekierowanej platnosci."
                : "Could not finalize redirected payment.",
          );
        }
      } finally {
        if (!cancelled) {
          const cleanedUrl = `${window.location.pathname}${window.location.hash}`;
          window.history.replaceState({}, "", cleanedUrl);
          setPending(false);
        }
      }
    };

    void finalizeRedirectPayment();

    return () => {
      cancelled = true;
    };
  }, [cart, locale, router]);

  useEffect(() => {
    let cancelled = false;
    const regionId = cart?.region_id || process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "";
    const currencyCode = (cart?.currency_code || "EUR").toUpperCase();

    const loadStarterPackPricing = async () => {
      const entries = await Promise.all(
        STARTER_PACK_PRODUCTS.map(async (starterPack) => {
          const summary = await getProductPricingSummaryByHandle(starterPack.handle, regionId).catch(() => null);

          return [
            starterPack.handle,
            {
              title: summary?.title || starterPack.title,
              price: summary?.price ?? null,
              currencyCode: summary?.currencyCode || currencyCode,
            },
          ] as const;
        }),
      );

      if (!cancelled) {
        setStarterPackPricing(Object.fromEntries(entries));
      }
    };

    void loadStarterPackPricing();

    return () => {
      cancelled = true;
    };
  }, [cart?.region_id, cart?.currency_code]);

  const applyShippingOption = async (
    cartId: string,
    option: { id: string; name: string },
    eligibleForAnyFreeShippingPromo: boolean,
  ): Promise<MedusaCart> => {
    const withShipping = await setShippingMethod(cartId, option.id);

    if ((withShipping.shipping_total || 0) <= 0) {
      const isFreeShippingOption = option.name.startsWith(FREE_SHIPPING_NAME_PREFIX);

      if (!isFreeShippingOption || !eligibleForAnyFreeShippingPromo) {
        throw new Error(
          "Shipping total is 0. A priced shipping method was not applied. Please refresh and try again.",
        );
      }
    }

    return withShipping;
  };

  const resolveStarterVariantId = async (handle: string): Promise<string | null> => {
    if (Object.prototype.hasOwnProperty.call(resolvedStarterVariantIds, handle)) {
      return resolvedStarterVariantIds[handle] || null;
    }

    const variantId = await findVariantIdByProductHandle(handle);
    setResolvedStarterVariantIds((prev) => ({ ...prev, [handle]: variantId }));
    return variantId;
  };

  const onQuickAddStarterPack = async (starterPack: (typeof STARTER_PACK_PRODUCTS)[number]) => {
    if (!cart) {
      setQuickAddError(t.cartNotFound);
      return;
    }

    setQuickAddError(null);
    setError(null);
    setNotice(null);
    setQuickAddPendingHandle(starterPack.handle);

    try {
      const variantId = await resolveStarterVariantId(starterPack.handle);

      if (!variantId) {
        throw new Error(`Could not resolve variant for ${starterPack.title}.`);
      }

      const updatedCart = await addToCart(cart.region_id || process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "", variantId, 1);
      setCart(updatedCart);
      resetCheckoutProgress();
      setNotice(`${starterPack.title} added to your cart. Recalculate shipping and tax to continue.`);
    } catch (quickAddFailure) {
      setQuickAddError(
        quickAddFailure instanceof Error
          ? quickAddFailure.message
          : locale === "pl"
            ? `Nie udalo sie dodac produktu ${starterPack.title} do koszyka.`
            : `Could not add ${starterPack.title} to your cart.`,
      );
    } finally {
      setQuickAddPendingHandle(null);
    }
  };

  const onRemoveItem = async (lineId: string) => {
    if (!cart) return;
    setRemovingItemId(lineId);
    setError(null);
    setNotice(null);

    try {
      const updatedCart = await removeLineItem(cart.id, lineId);
      if (!updatedCart || updatedCart.items.length === 0) {
        router.push(localizePath("/cart"));
        return;
      }
      setCart(updatedCart);
      resetCheckoutProgress();
      setNotice(t.itemRemoved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.removeError);
    } finally {
      setRemovingItemId(null);
    }
  };

  const onCalculateShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!cart) {
      setError(t.cartNotFound);
      return;
    }

    if (!form.phone.trim()) {
      setError(t.phoneRequired);
      return;
    }

    setPending(true);
    setStripePayment(null);

    try {
      const cartInCountryRegion = await ensureCartRegionForLocaleAndCountry(
        cart,
        locale,
        form.country_code,
      );

      const updatedCart = await updateCartCustomer(
        cartInCountryRegion.id,
        form.email,
        {
          first_name: form.first_name,
          last_name: form.last_name,
          company: form.company || undefined,
          address_1: form.address_1,
          city: form.city,
          postal_code: form.postal_code,
          country_code: form.country_code.toLowerCase(),
          phone: form.phone.trim() || undefined,
        },
        {
          shipping_comment: form.shipping_comment,
          billing_comment: form.billing_comment,
        },
      );

      setCart(updatedCart);

      let vatNotice: string | null = null;

      try {
        const vatValidation = await validateEuVatForCart(updatedCart.id, {
          vat_number: form.vat_number || undefined,
          country_code: form.country_code.toLowerCase(),
          company_name: form.company || undefined,
        });

        if (vatValidation.reverse_charge) {
          vatNotice = "EU VAT validated. Reverse-charge (0% VAT) will apply for this business order.";
        } else if (form.vat_number.trim()) {
          const message = vatValidation.message || "";
          const shouldSilenceMessage =
            message.startsWith("Reverse-charge applies only") ||
            message.startsWith("No VAT number provided");

          if (!shouldSilenceMessage) {
            vatNotice = message;
          }
        }
      } catch {
        if (form.vat_number.trim()) {
          vatNotice = "VAT validation is currently unavailable. Standard VAT will apply.";
        }
      }

      const fetchedShippingOptions = await getShippingOptions(updatedCart.id);
      if (!fetchedShippingOptions.length) {
        throw new Error(
          "No shipping options available for this cart yet. Configure shipping options in Medusa admin first.",
        );
      }

      const eligibleForStarterPackPromo = qualifiesForStarterPackFreeShipping(updatedCart);
      const eligibleForAnyFreeShippingPromo =
        eligibleForStarterPackPromo || qualifiesForOrderValueFreeShipping(updatedCart);

      const freeOptions = fetchedShippingOptions.filter((option) =>
        option.name.startsWith(FREE_SHIPPING_NAME_PREFIX),
      );
      const paidOptions = fetchedShippingOptions.filter(
        (option) => !option.name.startsWith(FREE_SHIPPING_NAME_PREFIX),
      );

      const preferredPaidShippingOption = paidOptions.find((option) =>
        option.name.startsWith("Standard Shipping"),
      );

      const orderedPaidOptions = preferredPaidShippingOption
        ? [
            preferredPaidShippingOption,
            ...paidOptions.filter((option) => option.id !== preferredPaidShippingOption.id),
          ]
        : paidOptions;

      const orderedOptions = eligibleForStarterPackPromo
        ? freeOptions
        : eligibleForAnyFreeShippingPromo && freeOptions[0]
          ? [freeOptions[0], ...orderedPaidOptions]
          : orderedPaidOptions;

      if (!orderedOptions.length) {
        throw new Error("No valid shipping option with pricing is available for this destination.");
      }

      const preferredOption =
        (eligibleForStarterPackPromo
          ? orderedOptions.find((option) => option.name.startsWith(FREE_SHIPPING_NAME_PREFIX))
          : selectedShippingOptionId
            ? orderedOptions.find((option) => option.id === selectedShippingOptionId)
            : null) || orderedOptions[0];

      const prioritizedOptions = [
        preferredOption,
        ...orderedOptions.filter((option) => option.id !== preferredOption.id),
      ];

      let withShipping: MedusaCart | null = null;
      let chosenOption: { id: string; name: string } | null = null;
      let hadMissingPriceOption = false;

      for (const option of prioritizedOptions) {
        try {
          withShipping = await applyShippingOption(updatedCart.id, option, eligibleForAnyFreeShippingPromo);
          chosenOption = option;
          break;
        } catch (shippingError) {
          const message = shippingError instanceof Error ? shippingError.message : "";
          if (message.includes("do not have a price")) {
            hadMissingPriceOption = true;
            continue;
          }
          throw shippingError;
        }
      }

      if (!withShipping || !chosenOption) {
        throw new Error("No valid shipping option with pricing is available for this destination.");
      }

      setCart(withShipping);
      setShippingOptions(orderedOptions);
      setSelectedShippingOptionId(chosenOption.id);
      setSelectedShippingOptionName(chosenOption.name);
      setShippingCalculated(true);
      setShowShippingOptions(false);

      const notices: string[] = [];
      if (vatNotice) {
        notices.push(vatNotice);
      }
      if (hadMissingPriceOption) {
        notices.push("Some shipping options were skipped because they had no price for this cart.");
      }
      if ((withShipping.shipping_total || 0) === 0 && eligibleForAnyFreeShippingPromo) {
        notices.push(t.freeShippingPromo);
      } else {
        notices.push(locale === "pl" ? "Koszt dostawy i podatek zostaly przeliczone." : "Shipping and tax calculated.");
      }

      setNotice(notices.join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "pl" ? "Checkout nie powiodl sie." : "Checkout failed.");
    } finally {
      setPending(false);
    }
  };

  const onApplySelectedShippingOption = async () => {
    setError(null);
    setNotice(null);

    if (!cart || !selectedShippingOptionId) {
      return;
    }

    const selectedOption = shippingOptions.find((option) => option.id === selectedShippingOptionId);
    if (!selectedOption) {
      setError("Selected shipping option is no longer available. Recalculate shipping.");
      return;
    }

    setPending(true);

    try {
      const eligibleForAnyFreeShippingPromo = qualifiesForAnyFreeShipping(cart);
      const withShipping = await applyShippingOption(
        cart.id,
        selectedOption,
        eligibleForAnyFreeShippingPromo,
      );

      setCart(withShipping);
      setSelectedShippingOptionName(selectedOption.name);
      setShippingCalculated(true);
      setShowShippingOptions(false);
      setNotice(
        eligibleForAnyFreeShippingPromo
          ? `${locale === "pl" ? "Metoda dostawy zaktualizowana." : "Shipping method updated."} ${t.freeShippingPromo}`
          : locale === "pl"
            ? "Metoda dostawy zaktualizowana."
            : "Shipping method updated.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "pl"
            ? "Nie udalo sie zastosowac metody dostawy."
            : "Could not apply shipping method.",
      );
    } finally {
      setPending(false);
    }
  };

  const onContinueToPayment = async () => {
    if (paymentSessionInFlightRef.current) {
      return;
    }

    setError(null);
    setNotice(null);

    if (!cart) {
      setError(t.cartNotFound);
      return;
    }

    if (!shippingCalculated) {
      setError(
        locale === "pl"
          ? "Przed przejsciem do platnosci oblicz koszt dostawy i podatek."
          : "Calculate shipping and tax before continuing to payment.",
      );
      return;
    }

    paymentSessionInFlightRef.current = true;
    setPending(true);

    try {
      const latestCart = (await getCart(cart.id)) || cart;
      setCart(latestCart);

      const paymentCollectionId = (await createPaymentCollection(latestCart.id)).id;

      const providers = await getPaymentProviders(latestCart.region_id);
      const stripeProvider = pickPreferredStripeProvider(providers);
      const stripeClientConfirmationEnabled = Boolean(stripePromise);
      const useStripeConfirmation = Boolean(stripeProvider && stripeClientConfirmationEnabled);

      if (!stripeProvider) {
        throw new Error(
          locale === "pl"
            ? "Stripe nie jest wlaczony dla tego regionu. Wlacz Stripe w Medusa i ponownie uruchom konfiguracje checkoutu."
            : "Stripe payment provider is not enabled for this region. Enable Stripe in Medusa and rerun checkout setup.",
        );
      }

      if (!stripeClientConfirmationEnabled) {
        throw new Error(
          locale === "pl"
            ? "Brak NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Nie mozna uruchomic potwierdzenia karty Stripe."
            : "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Stripe card confirmation cannot start.",
        );
      }

      const paymentSessionResult = await createPaymentSession(paymentCollectionId, stripeProvider.id);

      if (useStripeConfirmation && stripeProvider) {
        if (!stripePromise) {
          throw new Error(
            locale === "pl"
              ? "Brak NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Nie mozna wyswietlic bezpiecznego formularza karty Stripe."
              : "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Cannot render secure card form for Stripe.",
          );
        }

        const clientSecret = extractStripeClientSecret(
          paymentSessionResult.payment_collection,
          stripeProvider.id,
        );

        if (!clientSecret) {
          throw new Error("Stripe session was created but client secret was not returned.");
        }

        setStripePayment({
          cartId: latestCart.id,
          providerId: stripeProvider.id,
          clientSecret,
        });
        setNotice("Choose your preferred payment method below and confirm securely.");
        return;
      }

      throw new Error("Stripe confirmation flow is required before order completion.");
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "pl" ? "Checkout nie powiodl sie." : "Checkout failed.");
    } finally {
      paymentSessionInFlightRef.current = false;
      setPending(false);
    }
  };

  const finalizeStripeOrder = async () => {
    if (!stripePayment) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const completion = await completeCart(stripePayment.cartId);

      if (completion.type === "order" && completion.order?.id) {
        clearStoredCartId();
        emitCartUpdated();
          router.push(localizePath(`/checkout/success?order=${encodeURIComponent(completion.order.id)}`));
          return;
        }

      throw new Error(
        completion.error?.message ||
          (locale === "pl"
            ? "Platnosc potwierdzona, ale finalizacja zamowienia nie powiodla sie."
            : "Payment confirmed, but order completion failed."),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "pl"
            ? "Finalizacja zamowienia po autoryzacji karty nie powiodla sie."
            : "Checkout failed after card confirmation.",
      );
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink/55">{locale === "pl" ? "Ladowanie checkoutu..." : "Loading checkout..."}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-gold/60">{locale === "pl" ? "Checkout niedostepny" : "Checkout unavailable"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink">{locale === "pl" ? "Twoj koszyk jest pusty" : "Your cart is empty"}</h2>
        <Link
          href={localizePath("/products")}
          className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
        >
          {locale === "pl" ? "Przegladaj produkty" : "Browse Products"}
        </Link>
      </div>
    );
  }

  const orderValueFreeShippingThreshold = getOrderValueFreeShippingThreshold(cart.currency_code);
  const effectiveDiscountTotal = getEffectiveCartDiscountTotal(cart);
  const effectiveCartTotal = getEffectiveCartTotal(cart);
  const amountUntilOrderValueFreeShipping =
    orderValueFreeShippingThreshold !== null
      ? Math.max(0, orderValueFreeShippingThreshold - cart.subtotal)
      : null;
  const orderValueFreeShippingThresholdLabel =
    locale === "pl"
      ? `${orderValueFreeShippingThreshold ?? 250} ${cart.currency_code.toUpperCase()}`
      : `${cart.currency_code.toUpperCase()} ${orderValueFreeShippingThreshold ?? 250}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
      <section className="rounded-2xl border border-line bg-card p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/60">{locale === "pl" ? "Checkout" : "Checkout"}</p>
        <h2 className="mt-1 font-display text-4xl text-ink">{locale === "pl" ? "Dostawa i platnosc" : "Shipping & Billing"}</h2>
        <p className="mt-2 text-xs text-gold/75">{t.freeShippingPromo}</p>

        <form onSubmit={onCalculateShipping} className="mt-6 grid gap-4">
          <Input
            label={locale === "pl" ? "E-mail" : "Email"}
            type="email"
            required
            value={form.email}
            onChange={(value) => updateFormField("email", value)}
          />

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <Input
              label={locale === "pl" ? "Imie" : "First name"}
              required
              value={form.first_name}
              onChange={(value) => updateFormField("first_name", value)}
            />
            <Input
              label={locale === "pl" ? "Nazwisko" : "Last name"}
              required
              value={form.last_name}
              onChange={(value) => updateFormField("last_name", value)}
            />
          </div>

          <Input
            label={locale === "pl" ? "Firma (opcjonalnie)" : "Company (optional)"}
            value={form.company}
            onChange={(value) => updateFormField("company", value)}
          />

          <Input
            label={locale === "pl" ? "NIP UE (opcjonalnie)" : "EU VAT number (optional)"}
            value={form.vat_number}
            onChange={(value) => updateFormField("vat_number", value.toUpperCase())}
          />

          <Input
            label={locale === "pl" ? "Adres" : "Address"}
            required
            value={form.address_1}
            onChange={(value) => updateFormField("address_1", value)}
          />

          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
            <Input
              label={locale === "pl" ? "Miasto" : "City"}
              required
              value={form.city}
              onChange={(value) => updateFormField("city", value)}
            />
            <Input
              label={locale === "pl" ? "Kod pocztowy" : "Postal code"}
              required
              value={form.postal_code}
              onChange={(value) => updateFormField("postal_code", value)}
            />
            <Select
              label={locale === "pl" ? "Kraj" : "Country"}
              required
              value={form.country_code}
              onChange={(value) => updateFormField("country_code", value.toUpperCase())}
              options={countries}
            />
          </div>

          <Input
            label={locale === "pl" ? "Telefon" : "Phone"}
            required
            value={form.phone}
            onChange={(value) => updateFormField("phone", value)}
          />

          <TextArea
            label={locale === "pl" ? "Uwagi do dostawy (opcjonalnie)" : "Shipping comment (optional)"}
            value={form.shipping_comment}
            onChange={(value) => updateFormField("shipping_comment", value)}
            placeholder={
              locale === "pl"
                ? "Wskazowki dla kuriera, kod do bramy, preferencje dostawy..."
                : "Delivery notes, gate code, preferred drop-off details..."
            }
          />

          <TextArea
            label={locale === "pl" ? "Uwagi do faktury (opcjonalnie)" : "Billing comment (optional)"}
            value={form.billing_comment}
            onChange={(value) => updateFormField("billing_comment", value)}
            placeholder={
              locale === "pl"
                ? "Dane do faktury, numer zamowienia, uwagi dla ksiegowosci..."
                : "Invoice details, internal PO reference, accounting note..."
            }
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-gold/70">{notice}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg disabled:opacity-70"
          >
            {pending
              ? locale === "pl"
                ? "Przeliczanie..."
                : "Calculating..."
              : shippingCalculated
                ? locale === "pl"
                  ? "Przelicz dostawe i podatek"
                  : "Recalculate Shipping & Tax"
                : locale === "pl"
                  ? "Oblicz dostawe i podatek"
                  : "Calculate Shipping & Tax"}
          </button>
        </form>

        {shippingCalculated ? (
          <div className="mt-4 rounded-xl border border-line bg-bg-soft p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{locale === "pl" ? "Metoda dostawy" : "Shipping Method"}</p>
                <p className="mt-1 text-sm text-ink/80">
                  {selectedShippingOptionName || (locale === "pl" ? "Wybrana podczas przeliczenia" : "Selected during calculation")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShippingOptions((prev) => !prev)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/65 hover:border-gold/35 hover:text-gold"
              >
                {showShippingOptions ? (locale === "pl" ? "Ukryj" : "Hide") : locale === "pl" ? "Zmien" : "Change"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gold/80">{t.freeShippingPromo}</p>

            {showShippingOptions ? (
              <div className="mt-3 rounded-lg border border-line/70 bg-card p-3">
                <div className="space-y-2">
                  {shippingOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 text-sm text-ink/80">
                      <input
                        type="radio"
                        name="shipping-option"
                        checked={selectedShippingOptionId === option.id}
                        onChange={() => setSelectedShippingOptionId(option.id)}
                      />
                      <span>{option.name}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void onApplySelectedShippingOption();
                  }}
                  disabled={pending || !selectedShippingOptionId}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-gold px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-bg disabled:opacity-70"
                >
                  {pending ? (locale === "pl" ? "Zmieniam..." : "Applying...") : locale === "pl" ? "Zastosuj metode dostawy" : "Apply Shipping Method"}
                </button>
              </div>
            ) : null}

            {!stripePayment ? (
              <button
                type="button"
                onClick={() => {
                  void onContinueToPayment();
                }}
                disabled={pending}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg disabled:opacity-70"
              >
                {pending ? (locale === "pl" ? "Przygotowanie platnosci..." : "Preparing Payment...") : locale === "pl" ? "Przejdz do platnosci" : "Continue to Payment"}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-ink/45">
            {locale === "pl"
              ? "Uzupelnij dane dostawy, a nastepnie oblicz dostawe i podatek przed platnoscia."
              : "Fill your shipping details, then calculate shipping and tax before payment."}
          </p>
        )}

        {stripePayment && (
          <div className="mt-2 rounded-xl border border-line bg-bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{locale === "pl" ? "Bezpieczna platnosc" : "Secure Payment"}</p>
            {stripePromise ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripePayment.clientSecret,
                  appearance: {
                    theme: "night",
                  },
                }}
              >
                <StripeCardConfirmation
                  onAuthorized={finalizeStripeOrder}
                  pending={pending}
                  setError={setError}
                  returnUrl={buildStripeReturnUrl()}
                  locale={locale}
                />
              </Elements>
            ) : (
              <p className="mt-2 text-sm text-red-400">
                {locale === "pl"
                  ? "Brak publicznego klucza Stripe. Dodaj `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`."
                  : "Missing Stripe publishable key. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`."}
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-6 h-fit">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">{locale === "pl" ? "Podsumowanie" : "Summary"}</p>
          <Link
            href={localizePath("/cart")}
            className="shrink-0 inline-flex items-center rounded-full border border-line px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/60 transition-colors duration-300 hover:border-gold/35 hover:text-gold"
          >
            {locale === "pl" ? "Edytuj koszyk" : "Edit Cart"}
          </Link>
        </div>
        <div className="mt-4 space-y-3 text-sm text-ink/65">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block truncate leading-snug">{item.product_title || item.title} x{item.quantity}</span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="whitespace-nowrap">{formatAmount(item.total ?? item.quantity * item.unit_price, cart.currency_code)}</span>
                <button
                  type="button"
                  onClick={() => { void onRemoveItem(item.id); }}
                  disabled={Boolean(removingItemId) || pending}
                  aria-label={`${locale === "pl" ? "Usun" : "Remove"} ${item.product_title || item.title}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink/30 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                >
                  {removingItemId === item.id ? (
                    <span className="block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <span className="text-base leading-none">&times;</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <CouponCodeForm
          cart={cart}
          locale={locale}
          onCartUpdate={(updatedCart) => {
            setCart(updatedCart);
            resetCheckoutProgress();
            setError(null);
            setNotice(null);
          }}
          className="mt-4 rounded-xl border border-line/70 bg-bg-soft p-4"
        />

        <div className="mt-5 border-t border-line pt-4 flex items-center justify-between gap-3">
          <span className="text-ink/60">{locale === "pl" ? "Suma czesciowa" : "Subtotal"}</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.subtotal, cart.currency_code)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-ink/65">
          <span>{locale === "pl" ? "Dostawa" : "Shipping"}</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.shipping_total, cart.currency_code)}</span>
        </div>

        {shippingCalculated && selectedShippingOptionName ? (
          <p className="mt-2 text-xs text-ink/45">{locale === "pl" ? "Metoda" : "Method"}: {selectedShippingOptionName}</p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-ink/65">
          <span>{locale === "pl" ? "Rabaty" : "Discounts"}</span>
          <span className="shrink-0 whitespace-nowrap">-{formatAmount(effectiveDiscountTotal, cart.currency_code)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-ink/65">
          <span>{locale === "pl" ? "VAT (w cenie)" : "VAT (included)"}</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.tax_total, cart.currency_code)}</span>
        </div>

        {!shippingCalculated && (
          <p className="mt-2 text-xs text-ink/45">
            {locale === "pl"
              ? "Koszt dostawy i podatek zostana potwierdzone po przeliczeniu i wyborze metody dostawy. Darmowa dostawa dotyczy kwalifikujacych sie koszykow."
              : "Shipping and tax are finalized after you calculate shipping and select a shipping method. Free shipping applies to eligible carts."}
          </p>
        )}

        {shippingCalculated && cart.shipping_total <= 0 ? (
          <p className="mt-2 text-xs text-gold/80">{locale === "pl" ? "Do tego zamowienia zastosowano darmowa dostawe." : "Free shipping applied to this order."}</p>
        ) : null}

        <p className="mt-2 text-xs text-gold/75">{t.freeShippingPromo}</p>

        {amountUntilOrderValueFreeShipping !== null && amountUntilOrderValueFreeShipping > 0 ? (
          <p className="mt-2 text-xs text-ink/50">
            {locale === "pl"
              ? `Dodaj jeszcze ${formatAmount(amountUntilOrderValueFreeShipping, cart.currency_code)}, aby odblokowac darmowa dostawe dla zamowien powyzej ${orderValueFreeShippingThresholdLabel}.`
              : `Add ${formatAmount(amountUntilOrderValueFreeShipping, cart.currency_code)} more to unlock free worldwide shipping for orders above ${orderValueFreeShippingThresholdLabel}.`}
          </p>
        ) : null}

        <div className="mt-4 rounded-xl border border-line/70 bg-bg-soft p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/45">{locale === "pl" ? "Zestawy startowe" : "Starter Packs"}</p>
          <p className="mt-1 text-xs text-ink/55">
            {locale === "pl"
              ? "Dodaj zestaw testowy, aby skorzystac z darmowej dostawy na caly swiat, jesli koszyk zawiera tylko zestawy startowe."
              : "Add one of our discovery sets to qualify for free worldwide shipping when your cart contains only starter packs."}
          </p>

          <div className="mt-3 space-y-2">
            {STARTER_PACK_PRODUCTS.map((product) => {
              const pricing = starterPackPricing[product.handle];
              const price = pricing?.price;
              const priceLabel =
                typeof price === "number"
                  ? formatAmount(price, pricing?.currencyCode || cart.currency_code)
                  : locale === "pl"
                    ? "Wycena"
                    : "Quote";

              return (
                <div key={product.handle} className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-card px-3 py-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <Link
                      href={localizePath(`/products/${product.handle}`)}
                      className="min-w-0 truncate text-xs font-semibold text-ink/80 hover:text-gold"
                    >
                      {pricing?.title || product.title}
                    </Link>
                    <span className="shrink-0 rounded-full border border-gold/25 bg-gold/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-gold/85">
                      {priceLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void onQuickAddStarterPack(product);
                    }}
                    disabled={Boolean(quickAddPendingHandle) || pending}
                    className="rounded-full border border-line px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink/65 transition-colors duration-300 hover:border-gold/35 hover:text-gold disabled:opacity-70"
                  >
                    {quickAddPendingHandle === product.handle
                      ? locale === "pl"
                        ? "Dodawanie..."
                        : "Adding..."
                      : locale === "pl"
                        ? "Dodaj do koszyka"
                        : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>

          {quickAddError ? <p className="mt-2 text-xs text-red-400">{quickAddError}</p> : null}
        </div>

        <div className="mt-4 border-t border-line pt-4 flex items-center justify-between gap-3">
          <span className="font-semibold text-ink">{locale === "pl" ? "Razem" : "Total"}</span>
          <span className="shrink-0 whitespace-nowrap font-semibold text-ink">{formatAmount(effectiveCartTotal, cart.currency_code)}</span>
        </div>

        <p className="mt-4 text-xs text-ink/45">
          {locale === "pl"
            ? "Metody platnosci widoczne w bezpiecznym formularzu sa udostepniane bezposrednio przez Stripe dla Twojej waluty i regionu."
            : "Payment methods shown in the secure form are provided directly by Stripe for your currency and region."}
        </p>

        <p className="mt-2 text-[0.68rem] text-ink/40">
          {locale === "pl"
            ? "Po edycji koszyka ponownie przelicz dostawe i podatek przed przejsciem do platnosci."
            : "After editing your cart, recalculate shipping and tax before continuing to payment."}
        </p>
      </aside>
    </div>
  );
}

type StripeCardConfirmationProps = {
  onAuthorized: () => Promise<void>;
  pending: boolean;
  setError: (value: string | null) => void;
  returnUrl: string;
  locale: "en" | "pl";
};

function StripeCardConfirmation({ onAuthorized, pending, setError, returnUrl, locale }: StripeCardConfirmationProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const confirmInFlightRef = useRef(false);

  const onConfirm = async () => {
    if (confirmInFlightRef.current) {
      return;
    }

    if (!stripe || !elements) {
      setError(
        locale === "pl"
          ? "Stripe nadal sie laduje. Poczekaj chwile i sprobuj ponownie."
          : "Stripe is still loading. Please wait a moment and try again.",
      );
      return;
    }

    confirmInFlightRef.current = true;
    setError(null);
    setConfirming(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(
          result.error.message ||
            (locale === "pl" ? "Autoryzacja karty nie powiodla sie." : "Card authorization failed."),
        );
      }

      await onAuthorized();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : locale === "pl"
            ? "Autoryzacja karty nie powiodla sie."
            : "Card authorization failed.",
      );
    } finally {
      confirmInFlightRef.current = false;
      setConfirming(false);
    }
  };

  return (
    <div className="mt-3 grid gap-3">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="button"
        onClick={() => {
          void onConfirm();
        }}
        disabled={pending || confirming || !stripe || !elements}
        className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-bg disabled:opacity-70"
      >
        {confirming
          ? locale === "pl"
            ? "Potwierdzanie platnosci..."
            : "Confirming Payment..."
          : locale === "pl"
            ? "Potwierdz platnosc"
            : "Confirm Payment"}
      </button>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CheckoutCountryOption[];
  required?: boolean;
};

function Input({ label, value, onChange, required, type = "text" }: InputProps) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-xl border border-line bg-bg-soft px-3.5 text-sm text-ink outline-none transition focus:border-gold/40"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, required }: SelectProps) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-xl border border-line bg-bg-soft px-3.5 text-sm text-ink outline-none transition focus:border-gold/40"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextArea({ label, value, onChange, placeholder }: TextAreaProps) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full min-w-0 rounded-xl border border-line bg-bg-soft px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-gold/40"
      />
    </label>
  );
}
