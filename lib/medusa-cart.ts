export type MedusaCartItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total?: number;
  title: string;
  thumbnail?: string;
  product_title?: string;
  product_handle?: string;
  variant_title?: string;
  variant_sku?: string;
};

export type MedusaCart = {
  id: string;
  region_id: string;
  currency_code: string;
  email?: string | null;
  subtotal: number;
  total: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  items: MedusaCartItem[];
  payment_collection?: {
    id: string;
  } | null;
};

export type MedusaCountry = {
  iso_2: string;
  display_name?: string;
  name?: string;
};

export type MedusaRegion = {
  id: string;
  name: string;
  currency_code: string;
  countries: MedusaCountry[];
};

export type CheckoutCountryOption = {
  code: string;
  name: string;
};

type ShippingAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
  company?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
};

type PaymentProvider = {
  id: string;
  is_enabled: boolean;
};

type PaymentCollection = {
  id: string;
  payment_sessions?: Array<{
    id: string;
    provider_id: string;
    status?: string;
    data?: Record<string, unknown>;
  }>;
};

type StoreProductVariant = {
  id?: string;
};

type StoreProductSummary = {
  id: string;
  handle?: string;
  title?: string;
  variants?: StoreProductVariant[];
};

const CART_STORAGE_KEY = "mystic_cart_id";

function getMedusaUrl(): string {
  // All browser-side cart calls go through the Next.js proxy at /api/medusa.
  // The proxy forwards them server-side to the real Medusa backend, so no CORS
  // issues and no Medusa URL or API key is ever exposed in the browser bundle.
  // In SSR contexts (server components) this relative URL is resolved against
  // the current request origin, which is correct for both dev and production.
  return "/api/medusa";
}

function getPublishableKey(): string {
  // Key is now applied server-side by the proxy route — not needed in the browser.
  // Kept as a no-op so the call sites compile without changes.
  return "";
}

function getCartStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getStoredCartId(): string | null {
  const storage = getCartStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(CART_STORAGE_KEY);
}

function setStoredCartId(cartId: string) {
  const storage = getCartStorage();
  if (!storage) {
    return;
  }

  storage.setItem(CART_STORAGE_KEY, cartId);
}

export function clearStoredCartId() {
  const storage = getCartStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(CART_STORAGE_KEY);
}

export function emitCartUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("cart:updated"));
}

async function medusaFetch<T>(pathname: string, init?: RequestInit): Promise<T> {
  // The publishable key is injected server-side by the /api/medusa proxy route.
  // No key needed here in the browser.
  const response = await fetch(`${getMedusaUrl()}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      `Medusa request failed (${response.status}).`;
    throw new Error(message);
  }

  return data as T;
}

export async function getCart(cartId: string): Promise<MedusaCart | null> {
  try {
    const data = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`);
    return data.cart;
  } catch {
    return null;
  }
}

export async function listRegions(): Promise<MedusaRegion[]> {
  const data = await medusaFetch<{ regions: MedusaRegion[] }>("/store/regions?limit=500");
  return data.regions || [];
}

export async function listCheckoutCountries(): Promise<CheckoutCountryOption[]> {
  const regions = await listRegions();
  const countryByCode = new Map<string, CheckoutCountryOption>();

  for (const region of regions) {
    for (const country of region.countries || []) {
      const code = String(country.iso_2 || "").toUpperCase();
      if (!code) {
        continue;
      }

      if (!countryByCode.has(code)) {
        countryByCode.set(code, {
          code,
          name: country.display_name || country.name || code,
        });
      }
    }
  }

  return Array.from(countryByCode.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function ensureCartRegionForCountry(
  cart: MedusaCart,
  countryCode: string,
): Promise<MedusaCart> {
  const normalizedCountryCode = countryCode.trim().toLowerCase();
  const regions = await listRegions();

  const targetRegion = regions.find((region) =>
    (region.countries || []).some(
      (country) => String(country.iso_2 || "").toLowerCase() === normalizedCountryCode
    )
  );

  if (!targetRegion) {
    throw new Error(`We currently don't support shipping to ${countryCode.toUpperCase()}.`);
  }

  if (cart.region_id === targetRegion.id) {
    return cart;
  }

  const updated = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cart.id}`, {
    method: "POST",
    body: JSON.stringify({ region_id: targetRegion.id }),
  });

  return updated.cart;
}

export async function ensureCart(regionId: string): Promise<MedusaCart> {
  if (!regionId) {
    throw new Error("Missing NEXT_PUBLIC_MEDUSA_REGION_ID for cart creation.");
  }

  const existingId = getStoredCartId();

  if (existingId) {
    const existing = await getCart(existingId);
    if (existing) {
      return existing;
    }
  }

  const created = await medusaFetch<{ cart: MedusaCart }>(`/store/carts`, {
    method: "POST",
    body: JSON.stringify({ region_id: regionId }),
  });

  setStoredCartId(created.cart.id);
  emitCartUpdated();
  return created.cart;
}

export async function addToCart(regionId: string, variantId: string, quantity = 1): Promise<MedusaCart> {
  const cart = await ensureCart(regionId);

  const updated = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cart.id}/line-items`, {
    method: "POST",
    body: JSON.stringify({
      variant_id: variantId,
      quantity,
    }),
  });

  emitCartUpdated();
  return updated.cart;
}

export async function findVariantIdByProductHandle(handle: string): Promise<string | null> {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) {
    return null;
  }

  const data = await medusaFetch<{ products: StoreProductSummary[] }>(
    "/store/products?limit=200&fields=handle,*variants.id",
  );

  const product = (data.products || []).find(
    (entry) => entry.handle?.trim().toLowerCase() === normalizedHandle,
  );

  if (!product) {
    return null;
  }

  const variant = (product.variants || []).find((entry) => typeof entry.id === "string" && entry.id.length > 0);
  return variant?.id || null;
}

export async function updateLineItem(cartId: string, lineId: string, quantity: number): Promise<MedusaCart> {
  const updated = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    },
  );

  emitCartUpdated();
  return updated.cart;
}

export async function removeLineItem(cartId: string, lineId: string): Promise<MedusaCart | null> {
  await medusaFetch(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: "DELETE",
  });

  const cart = await getCart(cartId);
  emitCartUpdated();
  return cart;
}

export async function updateCartCustomer(
  cartId: string,
  email: string,
  shippingAddress: ShippingAddress,
  options?: {
    shipping_comment?: string;
    billing_comment?: string;
  },
): Promise<MedusaCart> {
  const shippingComment = options?.shipping_comment?.trim();
  const billingComment = options?.billing_comment?.trim();

  const shippingAddressWithComment: ShippingAddress = {
    ...shippingAddress,
    ...(shippingComment ? { metadata: { comment: shippingComment } } : {}),
  };

  const billingAddressWithComment: ShippingAddress = {
    ...shippingAddress,
    ...(billingComment ? { metadata: { comment: billingComment } } : {}),
  };

  const updated = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify({
      email,
      shipping_address: shippingAddressWithComment,
      billing_address: billingAddressWithComment,
    }),
  });

  return updated.cart;
}

export async function validateEuVatForCart(
  cartId: string,
  input: { vat_number?: string; country_code?: string; company_name?: string },
) {
  return medusaFetch<{
    reverse_charge: boolean;
    message: string;
    vat_number?: string;
    company_name?: string | null;
  }>(`/store/carts/${cartId}/vat/reverse-charge`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getShippingOptions(cartId: string): Promise<Array<{ id: string; name: string }>> {
  const data = await medusaFetch<{ shipping_options: Array<{ id: string; name: string }> }>(
    `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
  );

  return data.shipping_options;
}

export async function setShippingMethod(cartId: string, optionId: string): Promise<MedusaCart> {
  const updated = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/shipping-methods`, {
    method: "POST",
    body: JSON.stringify({ option_id: optionId }),
  });

  return updated.cart;
}

export async function createPaymentCollection(cartId: string): Promise<PaymentCollection> {
  const data = await medusaFetch<{ payment_collection: PaymentCollection }>(`/store/payment-collections`, {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  });

  return data.payment_collection;
}

export async function getPaymentProviders(regionId: string): Promise<PaymentProvider[]> {
  const data = await medusaFetch<{ payment_providers: PaymentProvider[] }>(
    `/store/payment-providers?region_id=${encodeURIComponent(regionId)}`,
  );

  return data.payment_providers;
}

export async function createPaymentSession(
  paymentCollectionId: string,
  providerId: string,
  data?: Record<string, unknown>,
) {
  return medusaFetch<{ payment_collection: PaymentCollection }>(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: "POST",
      body: JSON.stringify({ provider_id: providerId, ...(data ? { data } : {}) }),
    },
  );
}

export async function completeCart(cartId: string) {
  try {
    return await medusaFetch<{ type: "order" | "cart"; order?: { id: string }; error?: { message?: string } }>(
      `/store/carts/${cartId}/complete`,
      {
        method: "POST",
      },
    );
  } catch (error) {
    return {
      type: "cart" as const,
      error: {
        message: error instanceof Error ? error.message : "Checkout failed.",
      },
    };
  }
}

export function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}
