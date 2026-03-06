import Stripe from "stripe";

const DEFAULT_SITE_URL = "https://www.themysticaroma.com";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

type CreateLeadCheckoutSessionInput = {
  leadId: string;
  name: string;
  email: string;
  amount: unknown;
  currency: string;
  description: string;
  expiresInHours: number;
};

type OrderCheckoutLineInput = {
  name: string;
  amount: unknown;
  quantity?: number;
  description?: string;
};

type CreateOrderCheckoutSessionInput = {
  orderId: string;
  displayId: string;
  email?: string;
  currency: string;
  expiresInHours: number;
  lines: OrderCheckoutLineInput[];
};

type CreateLeadCatalogCheckoutSessionInput = {
  leadId: string;
  name: string;
  email?: string;
  currency: string;
  expiresInHours: number;
  lines: OrderCheckoutLineInput[];
};

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const apiKey = process.env.STRIPE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("STRIPE_API_KEY is not configured.");
  }

  stripeClient = new Stripe(apiKey);
  return stripeClient;
}

function normalizeSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return DEFAULT_SITE_URL;
  }

  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function getCurrencyMultiplier(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase()) ? 1 : 100;
}

export function parseCheckoutAmountToMinorUnit(value: unknown, currency: string): number {
  const multiplier = getCurrencyMultiplier(currency);
  const maxAmount = 9_999_999 * multiplier;

  if (typeof value === "number" && Number.isFinite(value)) {
    const scaled = Math.round(value * multiplier);
    if (scaled <= 0 || scaled > maxAmount) {
      throw new Error("Amount is outside the supported range.");
    }
    return scaled;
  }

  if (typeof value !== "string") {
    throw new Error("Amount must be a number.");
  }

  const normalized = value.replace(",", ".").trim();
  const decimalPattern = multiplier === 1 ? /^\d+$/ : /^\d+(?:\.\d{1,2})?$/;
  if (!decimalPattern.test(normalized)) {
    throw new Error(multiplier === 1 ? "Enter a whole number amount." : "Enter a valid amount (for example 120 or 120.50).");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const minorAmount = Math.round(parsed * multiplier);
  if (minorAmount <= 0 || minorAmount > maxAmount) {
    throw new Error("Amount is outside the supported range.");
  }

  return minorAmount;
}

export async function createLeadCheckoutSession(input: CreateLeadCheckoutSessionInput): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const siteUrl = normalizeSiteUrl();
  const expiresInSeconds = Math.round(input.expiresInHours * 60 * 60);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const unitAmount = parseCheckoutAmountToMinorUnit(input.amount, input.currency);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment/cancel`,
    expires_at: expiresAt,
    client_reference_id: input.leadId,
    customer_email: input.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency,
          unit_amount: unitAmount,
          product_data: {
            name: input.description,
            description: `Client: ${input.name || "Unknown"}`,
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: {
        lead_id: input.leadId,
        lead_email: input.email,
      },
    },
    metadata: {
      lead_id: input.leadId,
      lead_email: input.email,
    },
  });

  return session;
}

export async function createOrderCheckoutSession(
  input: CreateOrderCheckoutSessionInput,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const siteUrl = normalizeSiteUrl();
  const expiresInSeconds = Math.round(input.expiresInHours * 60 * 60);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.lines
    .map((line) => {
      const quantity = Number.isFinite(line.quantity) ? Math.max(1, Math.round(line.quantity || 1)) : 1;
      const unitAmount = parseCheckoutAmountToMinorUnit(line.amount, input.currency);
      const name = String(line.name || "Order item").trim().slice(0, 200) || "Order item";
      const description = String(line.description || "").trim().slice(0, 300);

      return {
        quantity,
        price_data: {
          currency: input.currency,
          unit_amount: unitAmount,
          product_data: {
            name,
            ...(description ? { description } : {}),
          },
        },
      };
    })
    .filter((line) => (line.price_data?.unit_amount || 0) > 0);

  if (!lineItems.length) {
    throw new Error("No valid order line items were found for Stripe checkout.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment/cancel`,
    expires_at: expiresAt,
    client_reference_id: input.orderId,
    customer_email: input.email || undefined,
    line_items: lineItems,
    payment_intent_data: {
      metadata: {
        order_id: input.orderId,
        order_display_id: input.displayId,
      },
    },
    metadata: {
      order_id: input.orderId,
      order_display_id: input.displayId,
    },
  });

  return session;
}

export async function createLeadCatalogCheckoutSession(
  input: CreateLeadCatalogCheckoutSessionInput,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const siteUrl = normalizeSiteUrl();
  const expiresInSeconds = Math.round(input.expiresInHours * 60 * 60);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.lines
    .map((line) => {
      const quantity = Number.isFinite(line.quantity) ? Math.max(1, Math.round(line.quantity || 1)) : 1;
      const unitAmount = parseCheckoutAmountToMinorUnit(line.amount, input.currency);
      const name = String(line.name || "Order item").trim().slice(0, 200) || "Order item";
      const description = String(line.description || "").trim().slice(0, 300);

      return {
        quantity,
        price_data: {
          currency: input.currency,
          unit_amount: unitAmount,
          product_data: {
            name,
            ...(description ? { description } : {}),
          },
        },
      };
    })
    .filter((line) => (line.price_data?.unit_amount || 0) > 0);

  if (!lineItems.length) {
    throw new Error("No valid order line items were found for Stripe checkout.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment/cancel`,
    expires_at: expiresAt,
    client_reference_id: input.leadId,
    customer_email: input.email || undefined,
    line_items: lineItems,
    payment_intent_data: {
      metadata: {
        lead_id: input.leadId,
        lead_email: input.email || "",
        lead_name: input.name || "",
        source: "lead_catalog",
      },
    },
    metadata: {
      lead_id: input.leadId,
      lead_email: input.email || "",
      lead_name: input.name || "",
      source: "lead_catalog",
    },
  });

  return session;
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}
