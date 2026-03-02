"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  addToCart,
  clearStoredCartId,
  completeCart,
  ensureCartRegionForCountry,
  CheckoutCountryOption,
  createPaymentCollection,
  createPaymentSession,
  emitCartUpdated,
  formatAmount,
  getCart,
  getPaymentProviders,
  getShippingOptions,
  getStoredCartId,
  listCheckoutCountries,
  MedusaCart,
  removeLineItem,
  setShippingMethod,
  updateCartCustomer,
  validateEuVatForCart,
  findVariantIdByProductHandle,
} from "@/lib/medusa-cart";

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
const STARTER_PACK_HANDLES: Set<string> = new Set(
  STARTER_PACK_PRODUCTS.map((product) => product.handle),
);
const FREE_WORLDWIDE_SHIPPING_THRESHOLD_EUR = 250;
const FREE_SHIPPING_PROMO_TEXT =
  "Free worldwide shipping is available (where configured for your destination) for orders over EUR 250, and for carts containing only Essence of Madagascar or Taste of Madagascar starter packs.";

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
  return cart.currency_code.toLowerCase() === "eur" && cart.subtotal >= FREE_WORLDWIDE_SHIPPING_THRESHOLD_EUR;
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
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const router = useRouter();
  const paymentSessionInFlightRef = useRef(false);

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
      const fetchedCountries = await listCheckoutCountries().catch(() => fallbackCountries);

      if (!cancelled && fetchedCountries.length) {
        setCountries(fetchedCountries);

        setForm((prev) => {
          const hasCurrentCountry = fetchedCountries.some(
            (country) => country.code === prev.country_code.toUpperCase(),
          );

          if (hasCurrentCountry) {
            return prev;
          }

          return { ...prev, country_code: fetchedCountries[0].code };
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
  }, []);

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
      setNotice("Finalizing your payment...");

      try {
        if (!stripePromise) {
          throw new Error("Stripe is not configured. Cannot finalize redirected payment.");
        }

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe is unavailable. Please refresh and try again.");
        }

        const { paymentIntent, error: stripeError } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);

        if (stripeError) {
          throw new Error(stripeError.message || "Could not verify redirected payment status.");
        }

        const status = paymentIntent?.status || "unknown";

        if (status === "requires_payment_method") {
          throw new Error("Payment was not completed. Please select a payment method and try again.");
        }

        if (status !== "succeeded" && status !== "requires_capture") {
          setNotice(
            `Payment status: ${status}. If you were redirected, please wait a moment and click Continue to Payment again.`,
          );
          return;
        }

        const completion = await completeCart(cart.id);

        if (completion.type === "order" && completion.order?.id) {
          clearStoredCartId();
          emitCartUpdated();
          router.push(`/checkout/success?order=${encodeURIComponent(completion.order.id)}`);
          return;
        }

        throw new Error(completion.error?.message || "Payment was confirmed, but order completion failed.");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not finalize redirected payment.");
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
  }, [cart, router]);

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
      setQuickAddError("Cart not found.");
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
        router.push("/cart");
        return;
      }
      setCart(updatedCart);
      resetCheckoutProgress();
      setNotice("Item removed. Recalculate shipping and tax to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove item.");
    } finally {
      setRemovingItemId(null);
    }
  };

  const onCalculateShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!cart) {
      setError("Cart not found.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required for courier delivery.");
      return;
    }

    setPending(true);
    setStripePayment(null);

    try {
      const cartInCountryRegion = await ensureCartRegionForCountry(cart, form.country_code);

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
        notices.push(FREE_SHIPPING_PROMO_TEXT);
      } else {
        notices.push("Shipping and tax calculated.");
      }

      setNotice(notices.join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
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
          ? `Shipping method updated. ${FREE_SHIPPING_PROMO_TEXT}`
          : "Shipping method updated.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply shipping method.");
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
      setError("Cart not found.");
      return;
    }

    if (!shippingCalculated) {
      setError("Calculate shipping and tax before continuing to payment.");
      return;
    }

    paymentSessionInFlightRef.current = true;
    setPending(true);

    try {
      const paymentCollectionId =
        cart.payment_collection?.id || (await createPaymentCollection(cart.id)).id;

      const providers = await getPaymentProviders(cart.region_id);
      const stripeProvider = pickPreferredStripeProvider(providers);
      const stripeClientConfirmationEnabled = Boolean(stripePromise);
      const useStripeConfirmation = Boolean(stripeProvider && stripeClientConfirmationEnabled);

      if (!stripeProvider) {
        throw new Error(
          "Stripe payment provider is not enabled for this region. Enable Stripe in Medusa and rerun checkout setup.",
        );
      }

      if (!stripeClientConfirmationEnabled) {
        throw new Error(
          "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Stripe card confirmation cannot start.",
        );
      }

      const paymentSessionResult = await createPaymentSession(paymentCollectionId, stripeProvider.id);

      if (useStripeConfirmation && stripeProvider) {
        if (!stripePromise) {
          throw new Error(
            "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Cannot render secure card form for Stripe.",
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
          cartId: cart.id,
          providerId: stripeProvider.id,
          clientSecret,
        });
        setNotice("Choose your preferred payment method below and confirm securely.");
        return;
      }

      throw new Error("Stripe confirmation flow is required before order completion.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
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
        router.push(`/checkout/success?order=${encodeURIComponent(completion.order.id)}`);
        return;
      }

      throw new Error(completion.error?.message || "Payment confirmed, but order completion failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed after card confirmation.");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink/55">Loading checkout...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-gold/60">Checkout unavailable</p>
        <h2 className="mt-3 font-display text-3xl text-ink">Your cart is empty</h2>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const amountUntilOrderValueFreeShipping =
    cart.currency_code.toLowerCase() === "eur"
      ? Math.max(0, FREE_WORLDWIDE_SHIPPING_THRESHOLD_EUR - cart.subtotal)
      : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
      <section className="rounded-2xl border border-line bg-card p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/60">Checkout</p>
        <h2 className="mt-1 font-display text-4xl text-ink">Shipping & Billing</h2>
        <p className="mt-2 text-xs text-gold/75">{FREE_SHIPPING_PROMO_TEXT}</p>

        <form onSubmit={onCalculateShipping} className="mt-6 grid gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(value) => updateFormField("email", value)}
          />

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.first_name}
              onChange={(value) => updateFormField("first_name", value)}
            />
            <Input
              label="Last name"
              required
              value={form.last_name}
              onChange={(value) => updateFormField("last_name", value)}
            />
          </div>

          <Input
            label="Company (optional)"
            value={form.company}
            onChange={(value) => updateFormField("company", value)}
          />

          <Input
            label="EU VAT number (optional)"
            value={form.vat_number}
            onChange={(value) => updateFormField("vat_number", value.toUpperCase())}
          />

          <Input
            label="Address"
            required
            value={form.address_1}
            onChange={(value) => updateFormField("address_1", value)}
          />

          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(value) => updateFormField("city", value)}
            />
            <Input
              label="Postal code"
              required
              value={form.postal_code}
              onChange={(value) => updateFormField("postal_code", value)}
            />
            <Select
              label="Country"
              required
              value={form.country_code}
              onChange={(value) => updateFormField("country_code", value.toUpperCase())}
              options={countries}
            />
          </div>

          <Input
            label="Phone"
            required
            value={form.phone}
            onChange={(value) => updateFormField("phone", value)}
          />

          <TextArea
            label="Shipping comment (optional)"
            value={form.shipping_comment}
            onChange={(value) => updateFormField("shipping_comment", value)}
            placeholder="Delivery notes, gate code, preferred drop-off details..."
          />

          <TextArea
            label="Billing comment (optional)"
            value={form.billing_comment}
            onChange={(value) => updateFormField("billing_comment", value)}
            placeholder="Invoice details, internal PO reference, accounting note..."
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-gold/70">{notice}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg disabled:opacity-70"
          >
            {pending
              ? "Calculating..."
              : shippingCalculated
                ? "Recalculate Shipping & Tax"
                : "Calculate Shipping & Tax"}
          </button>
        </form>

        {shippingCalculated ? (
          <div className="mt-4 rounded-xl border border-line bg-bg-soft p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Shipping Method</p>
                <p className="mt-1 text-sm text-ink/80">{selectedShippingOptionName || "Selected during calculation"}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowShippingOptions((prev) => !prev)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/65 hover:border-gold/35 hover:text-gold"
              >
                {showShippingOptions ? "Hide" : "Change"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gold/80">{FREE_SHIPPING_PROMO_TEXT}</p>

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
                  {pending ? "Applying..." : "Apply Shipping Method"}
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
                {pending ? "Preparing Payment..." : "Continue to Payment"}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-ink/45">
            Fill your shipping details, then calculate shipping and tax before payment.
          </p>
        )}

        {stripePayment && (
          <div className="mt-2 rounded-xl border border-line bg-bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Secure Payment</p>
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
                />
              </Elements>
            ) : (
              <p className="mt-2 text-sm text-red-400">
                Missing Stripe publishable key. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-6 h-fit">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gold/60">Summary</p>
          <Link
            href="/cart"
            className="shrink-0 inline-flex items-center rounded-full border border-line px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/60 transition-colors duration-300 hover:border-gold/35 hover:text-gold"
          >
            Edit Cart
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
                  aria-label={`Remove ${item.product_title || item.title}`}
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

        <div className="mt-5 border-t border-line pt-4 flex items-center justify-between gap-3">
          <span className="text-ink/60">Subtotal</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.subtotal, cart.currency_code)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-ink/65">
          <span>Shipping</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.shipping_total, cart.currency_code)}</span>
        </div>

        {shippingCalculated && selectedShippingOptionName ? (
          <p className="mt-2 text-xs text-ink/45">Method: {selectedShippingOptionName}</p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-ink/65">
          <span>Tax</span>
          <span className="shrink-0 whitespace-nowrap">{formatAmount(cart.tax_total, cart.currency_code)}</span>
        </div>

        {!shippingCalculated && (
          <p className="mt-2 text-xs text-ink/45">
            Shipping and tax are finalized after you calculate shipping and select a shipping method. Free
            shipping applies to eligible carts.
          </p>
        )}

        {shippingCalculated && cart.shipping_total <= 0 ? (
          <p className="mt-2 text-xs text-gold/80">Free shipping applied to this order.</p>
        ) : null}

        <p className="mt-2 text-xs text-gold/75">{FREE_SHIPPING_PROMO_TEXT}</p>

        {amountUntilOrderValueFreeShipping !== null && amountUntilOrderValueFreeShipping > 0 ? (
          <p className="mt-2 text-xs text-ink/50">
            Add {formatAmount(amountUntilOrderValueFreeShipping, cart.currency_code)} more to unlock free worldwide
            shipping for orders above EUR 250.
          </p>
        ) : null}

        <div className="mt-4 rounded-xl border border-line/70 bg-bg-soft p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/45">Starter Packs</p>
          <p className="mt-1 text-xs text-ink/55">
            Add one of our discovery sets to qualify for free worldwide shipping when your cart contains only starter
            packs.
          </p>

          <div className="mt-3 space-y-2">
            {STARTER_PACK_PRODUCTS.map((product) => (
              <div key={product.handle} className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-card px-3 py-2">
                <Link
                  href={`/products/${product.handle}`}
                  className="min-w-0 truncate text-xs font-semibold text-ink/80 hover:text-gold"
                >
                  {product.title}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void onQuickAddStarterPack(product);
                  }}
                  disabled={Boolean(quickAddPendingHandle) || pending}
                  className="rounded-full border border-line px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink/65 transition-colors duration-300 hover:border-gold/35 hover:text-gold disabled:opacity-70"
                >
                  {quickAddPendingHandle === product.handle ? "Adding..." : "Quick Add"}
                </button>
              </div>
            ))}
          </div>

          {quickAddError ? <p className="mt-2 text-xs text-red-400">{quickAddError}</p> : null}
        </div>

        <div className="mt-4 border-t border-line pt-4 flex items-center justify-between gap-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="shrink-0 whitespace-nowrap font-semibold text-ink">{formatAmount(cart.total, cart.currency_code)}</span>
        </div>

        <p className="mt-4 text-xs text-ink/45">
          Payment methods shown in the secure form are provided directly by Stripe for your currency and region.
        </p>

        <p className="mt-2 text-[0.68rem] text-ink/40">
          After editing your cart, recalculate shipping and tax before continuing to payment.
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
};

function StripeCardConfirmation({ onAuthorized, pending, setError, returnUrl }: StripeCardConfirmationProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const confirmInFlightRef = useRef(false);

  const onConfirm = async () => {
    if (confirmInFlightRef.current) {
      return;
    }

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please wait a moment and try again.");
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
        throw new Error(result.error.message || "Card authorization failed.");
      }

      await onAuthorized();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Card authorization failed.");
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
        {confirming ? "Confirming Payment..." : "Confirm Payment"}
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
