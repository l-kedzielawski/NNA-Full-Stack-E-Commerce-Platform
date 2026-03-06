import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createOrderCheckoutSession } from "../../../../utils/stripe-checkout";

type QueryService = {
  graph: (input: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
  }) => Promise<{ data?: unknown[] }>;
};

type CheckoutLine = {
  name: string;
  amount: number;
  quantity?: number;
  description?: string;
};

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "total",
  "items.*",
  "shipping_total",
  "tax_total",
  "discount_total",
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const record = asRecord(value);
  if (record) {
    const candidates = [record.value, record.amount, record.raw, record.numeric, record.number];

    for (const candidate of candidates) {
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return candidate;
      }

      if (typeof candidate === "string") {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
  }

  return 0;
}

function normalizeExpiresInHours(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 24;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 24);
}

function buildCheckoutLines(orderRecord: Record<string, unknown>): { lines: CheckoutLine[]; targetTotal: number } {
  const rows: CheckoutLine[] = [];

  const items = Array.isArray(orderRecord.items) ? orderRecord.items : [];
  for (const item of items) {
    const row = asRecord(item);
    if (!row) {
      continue;
    }

    const title = asString(row.title) || asString(row.product_title) || "Order item";
    const variantTitle = asString(row.variant_title);
    const quantity = Math.max(1, Math.round(asNumber(row.quantity) || 1));
    const itemTotal = asNumber(row.total);
    const unitPrice = asNumber(row.unit_price);

    const effectiveTotal = itemTotal > 0 ? itemTotal : unitPrice * quantity;
    if (effectiveTotal <= 0) {
      continue;
    }

    const descriptionParts = [`Qty: ${quantity}`];
    if (variantTitle && variantTitle.toLowerCase() !== "default") {
      descriptionParts.push(`Variant: ${variantTitle}`);
    }

    rows.push({
      name: title,
      amount: effectiveTotal,
      quantity: 1,
      description: descriptionParts.join(" | "),
    });
  }

  const targetTotal = asNumber(orderRecord.total);
  if (targetTotal <= 0) {
    return { lines: rows, targetTotal: 0 };
  }

  if (!rows.length) {
    return {
      lines: [
        {
          name: `Order #${asString(orderRecord.display_id) || asString(orderRecord.id)}`,
          amount: targetTotal,
          quantity: 1,
        },
      ],
      targetTotal,
    };
  }

  const rowsTotal = rows.reduce((sum, row) => sum + row.amount, 0);
  const diff = Number((targetTotal - rowsTotal).toFixed(2));

  if (diff > 0) {
    rows.push({
      name: "Shipping / tax / adjustments",
      amount: diff,
      quantity: 1,
    });
  } else if (diff < 0) {
    const reduction = Math.abs(diff);
    const first = rows[0];

    if (first && first.amount - reduction > 0) {
      first.amount = Number((first.amount - reduction).toFixed(2));
      first.description = first.description
        ? `${first.description} | Discount applied`
        : "Discount applied";
    } else {
      return {
        lines: [
          {
            name: `Order #${asString(orderRecord.display_id) || asString(orderRecord.id)}`,
            amount: targetTotal,
            quantity: 1,
            description: "Includes order-level discounts and adjustments",
          },
        ],
        targetTotal,
      };
    }
  }

  return { lines: rows, targetTotal };
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = asString(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  const body = (req.body || {}) as {
    expiresInHours?: unknown;
  };

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as QueryService;
  const { data = [] } = await query.graph({
    entity: "order",
    fields: ORDER_FIELDS,
    filters: { id },
  });

  const orderRecord = asRecord(data[0]);
  if (!orderRecord) {
    return res.status(404).json({ message: "Order not found." });
  }

  const currency = asString(orderRecord.currency_code).toLowerCase() || "eur";
  if (!/^[a-z]{3}$/.test(currency)) {
    return res.status(400).json({ message: "Order currency is invalid." });
  }

  const { lines, targetTotal } = buildCheckoutLines(orderRecord);
  if (!lines.length || targetTotal <= 0) {
    return res.status(400).json({ message: "Order total must be greater than zero to create a payment link." });
  }

  const displayId = asString(orderRecord.display_id) || id;
  const email = asString(orderRecord.email) || undefined;
  const expiresInHours = normalizeExpiresInHours(body.expiresInHours);

  let session;
  try {
    session = await createOrderCheckoutSession({
      orderId: id,
      displayId,
      email,
      currency,
      expiresInHours,
      lines,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Stripe checkout session.";
    return res.status(400).json({ message });
  }

  return res.status(200).json({
    checkout_url: session.url,
    checkout_session_id: session.id,
    expires_at: session.expires_at,
    currency,
    order_total: targetTotal,
    line_count: lines.length,
    lines,
  });
}
