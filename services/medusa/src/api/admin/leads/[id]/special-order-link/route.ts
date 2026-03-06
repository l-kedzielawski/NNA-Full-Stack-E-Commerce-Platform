import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { listCatalogVariants } from "../../../../utils/catalog-variants";
import { getLeadService, retrieveLeadRecord, updateLeadRecord } from "../../../../utils/lead-service";
import { createLeadCatalogCheckoutSession } from "../../../../utils/stripe-checkout";

type SpecialOrderLineInput = {
  variant_id?: unknown;
  quantity?: unknown;
  unit_price?: unknown;
};

type SpecialOrderBody = {
  currency?: unknown;
  expiresInHours?: unknown;
  lines?: unknown;
};

type NormalizedLine = {
  variant_id: string;
  quantity: number;
  unit_price: number;
};

function sanitize(value: unknown, maxLength = 300): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeCurrency(value: unknown): string {
  const currency = sanitize(value, 3).toLowerCase();
  if (!/^[a-z]{3}$/.test(currency)) {
    return "";
  }

  return currency;
}

function normalizeExpiresInHours(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 24;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 24);
}

function normalizePositiveInteger(value: unknown, fallback = 1): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const rounded = Math.round(parsed);
  if (rounded < 1) {
    return fallback;
  }

  return rounded;
}

function normalizePositiveNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", ".").trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return NaN;
}

function normalizeLines(lines: unknown): NormalizedLine[] {
  if (!Array.isArray(lines)) {
    return [];
  }

  const normalized: NormalizedLine[] = [];

  for (const line of lines as SpecialOrderLineInput[]) {
    const variantId = sanitize(line?.variant_id, 100);
    if (!variantId) {
      continue;
    }

    const quantity = normalizePositiveInteger(line?.quantity, 1);
    const unitPrice = normalizePositiveNumber(line?.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      continue;
    }

    normalized.push({
      variant_id: variantId,
      quantity,
      unit_price: Number(unitPrice.toFixed(2)),
    });
  }

  return normalized.slice(0, 50);
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = String(req.params.id || "").trim();
  if (!id) {
    return res.status(400).json({ message: "Lead ID is required." });
  }

  const body = (req.body || {}) as SpecialOrderBody;
  const currency = normalizeCurrency(body.currency || "eur");
  if (!currency) {
    return res.status(400).json({ message: "Currency must be a 3-letter ISO code, for example EUR." });
  }

  const lines = normalizeLines(body.lines);
  if (!lines.length) {
    return res.status(400).json({ message: "Add at least one product with quantity and custom unit price." });
  }

  const leadService = getLeadService(req.scope);
  const lead = await retrieveLeadRecord(leadService, id);
  if (!lead) {
    return res.status(404).json({ message: "Lead not found." });
  }

  const variants = await listCatalogVariants(req.scope, 2000);
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const checkoutLines: Array<{ name: string; amount: number; quantity: number; description?: string }> = [];

  for (const line of lines) {
    const variant = variantById.get(line.variant_id);
    if (!variant) {
      return res.status(400).json({ message: `Variant ${line.variant_id} is not available in catalog.` });
    }

    const title =
      variant.title && variant.title.toLowerCase() !== "default"
        ? `${variant.product_title} - ${variant.title}`
        : variant.product_title;

    checkoutLines.push({
      name: title,
      amount: line.unit_price,
      quantity: line.quantity,
      description: variant.sku ? `SKU: ${variant.sku}` : undefined,
    });
  }

  const expiresInHours = normalizeExpiresInHours(body.expiresInHours);
  const name = String(lead.name || "");
  const email = String(lead.email || "");

  let session;
  try {
    session = await createLeadCatalogCheckoutSession({
      leadId: id,
      name,
      email,
      currency,
      expiresInHours,
      lines: checkoutLines,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Stripe checkout session.";
    return res.status(400).json({ message });
  }

  const totalMajor = checkoutLines.reduce((sum, line) => sum + line.amount * line.quantity, 0);

  await updateLeadRecord(leadService, {
    id,
    payment_link_url: session.url || "",
    payment_link_session_id: session.id,
    payment_link_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    payment_status: session.payment_status || "unpaid",
    payment_amount: typeof session.amount_total === "number" ? session.amount_total : null,
    payment_currency: session.currency || currency,
    payment_created_at: new Date().toISOString(),
    payment_paid_at:
      session.payment_status === "paid" ? String(lead.payment_paid_at || "") || new Date().toISOString() : lead.payment_paid_at,
  });

  return res.status(200).json({
    checkout_url: session.url,
    checkout_session_id: session.id,
    expires_at: session.expires_at,
    currency,
    total_major: Number(totalMajor.toFixed(2)),
    line_count: checkoutLines.length,
    lines: checkoutLines,
  });
}
