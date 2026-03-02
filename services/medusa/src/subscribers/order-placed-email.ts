import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  type EmailTemplateRenderer,
  type OrderEmailPayload,
  sendOrderCustomerConfirmationEmail,
  sendOrderInternalAlertEmail,
} from "../lib/email";
import { EMAIL_TEMPLATE_MODULE } from "../modules/email-template/index";

type QueryService = {
  graph: (input: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
    pagination?: Record<string, unknown>;
  }) => Promise<{ data?: unknown[] }>;
};

type OrderModuleService = {
  retrieveOrder: (id: string, config?: Record<string, unknown>) => Promise<unknown>;
};

type EmailTemplateModuleService = EmailTemplateRenderer;

type Logger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
  error?: (message: string) => void;
};

const ORDER_QUERY_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "subtotal",
  "shipping_total",
  "tax_total",
  "total",
  "created_at",
  "items.*",
  "shipping_address.*",
  "billing_address.*",
  "shipping_methods.*",
  "shipping_methods.shipping_option.*",
];

const ORDER_QUERY_FIELDS_COMPAT = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "subtotal",
  "shipping_total",
  "tax_total",
  "total",
  "created_at",
  "*items",
  "*shipping_address",
  "*billing_address",
  "*shipping_methods",
  "*shipping_methods.shipping_option",
];

const ORDER_QUERY_FIELDS_MINIMAL = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "subtotal",
  "shipping_total",
  "tax_total",
  "total",
  "created_at",
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asRecordOrFirst(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = asRecord(entry);
      if (normalized) {
        return normalized;
      }
    }
    return null;
  }

  return asRecord(value);
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

function asNumber(value: unknown, fallback = 0): number {
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
    const nestedCandidates = [record.value, record.amount, record.raw, record.numeric, record.number];

    for (const candidate of nestedCandidates) {
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

  return fallback;
}

function toIsoString(value: unknown): string {
  const candidate = asString(value);
  if (!candidate) {
    return new Date().toISOString();
  }

  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    return candidate;
  }

  return parsed.toISOString();
}

function buildShippingMethod(order: Record<string, unknown>): string {
  const methods = Array.isArray(order.shipping_methods) ? order.shipping_methods : [];

  const names = methods
    .map((method) => {
      const row = asRecord(method);
      if (!row) {
        return "";
      }

      const directName = asString(row.name);
      if (directName) {
        return directName;
      }

      const option = asRecord(row.shipping_option);
      if (option) {
        return asString(option.name);
      }

      return "";
    })
    .filter(Boolean);

  return names.length ? names.join(", ") : "Shipping method not specified";
}

function getShippingAmount(order: Record<string, unknown>): number {
  const methods = Array.isArray(order.shipping_methods) ? order.shipping_methods : [];

  return methods.reduce((sum, method) => {
    const row = asRecord(method);
    if (!row) {
      return sum;
    }

    return sum + asNumber(row.amount, 0);
  }, 0);
}

function buildShippingAddress(order: Record<string, unknown>): string {
  const address = asRecord(order.shipping_address) || asRecord(order.billing_address);
  if (!address) {
    return "Shipping address not provided";
  }

  const name = [asString(address.first_name), asString(address.last_name)].filter(Boolean).join(" ");
  const company = asString(address.company);
  const line1 = asString(address.address_1);
  const line2 = asString(address.address_2);
  const cityLine = [asString(address.postal_code), asString(address.city)].filter(Boolean).join(" ");
  const country = asString(address.country_code).toUpperCase();

  return [name, company, line1, line2, cityLine, country].filter(Boolean).join(", ");
}

function buildItems(order: Record<string, unknown>): OrderEmailPayload["items"] {
  const rows = Array.isArray(order.items) ? order.items : [];

  return rows
    .map((entry) => {
      const item = asRecord(entry);
      if (!item) {
        return null;
      }

      const detail = asRecord(item.detail) || asRecord(item.item);

      const title =
        asString(item.title) ||
        asString(item.product_title) ||
        asString(detail?.title) ||
        asString(detail?.product_title) ||
        "Item";
      const quantity = Math.max(1, Math.floor(asNumber(item.quantity, asNumber(detail?.quantity, 1))));
      const total = asNumber(
        item.total,
        asNumber(
          item.subtotal,
          asNumber(detail?.total, asNumber(detail?.subtotal, asNumber(item.unit_price, 0) * quantity)),
        ),
      );
      const unitPrice = asNumber(item.unit_price, asNumber(detail?.unit_price, quantity > 0 ? total / quantity : 0));

      return {
        title,
        quantity,
        unitPrice,
        total,
      };
    })
    .filter((item): item is OrderEmailPayload["items"][number] => Boolean(item));
}

function normalizeOrderForEmail(orderInput: unknown): OrderEmailPayload | null {
  const order = asRecord(orderInput);
  if (!order) {
    return null;
  }

  const orderId = asString(order.id);
  if (!orderId) {
    return null;
  }

  const displayId = asString(order.display_id) || orderId;
  const summary = asRecordOrFirst(order.summary);
  const summaryTotals = asRecordOrFirst(summary?.totals);

  const items = buildItems(order);
  const itemsTotal = items.reduce((sum, item) => sum + asNumber(item.total, 0), 0);
  const shippingAmount = getShippingAmount(order);

  const subtotal = asNumber(
    order.subtotal,
    asNumber(
      summary?.subtotal,
      asNumber(summaryTotals?.subtotal, asNumber(summaryTotals?.item_total, asNumber(summaryTotals?.item_subtotal, itemsTotal))),
    ),
  );
  const shippingTotal = asNumber(
    order.shipping_total,
    asNumber(
      summary?.shipping_total,
      asNumber(
        summaryTotals?.shipping_total,
        asNumber(summaryTotals?.shipping_subtotal, asNumber(summaryTotals?.original_shipping_total, shippingAmount)),
      ),
    ),
  );
  const preliminaryTotal = asNumber(
    order.total,
    asNumber(summary?.total, asNumber(summaryTotals?.total, asNumber(summaryTotals?.current_order_total, 0))),
  );
  const taxTotal = asNumber(
    order.tax_total,
    asNumber(summary?.tax_total, asNumber(summaryTotals?.tax_total, Math.max(0, preliminaryTotal - subtotal - shippingTotal))),
  );
  const total = asNumber(
    order.total,
    asNumber(
      summary?.total,
      asNumber(summaryTotals?.total, asNumber(summaryTotals?.current_order_total, subtotal + shippingTotal + taxTotal)),
    ),
  );

  return {
    orderId,
    displayId,
    customerEmail: asString(order.email).toLowerCase(),
    currencyCode: asString(order.currency_code) || "eur",
    subtotal,
    shippingTotal,
    taxTotal,
    total,
    createdAt: toIsoString(order.created_at),
    shippingMethod: buildShippingMethod(order),
    shippingAddress: buildShippingAddress(order),
    items,
  };
}

function payloadLooksComplete(payload: OrderEmailPayload): boolean {
  const hasItems = payload.items.length > 0;
  const hasShippingAddress = payload.shippingAddress !== "Shipping address not provided";
  const hasShippingMethod = payload.shippingMethod !== "Shipping method not specified";
  const hasCustomer = payload.customerEmail.length > 0;
  const hasTotals = payload.total > 0 || payload.subtotal > 0;
  const itemsTotal = payload.items.reduce((sum, item) => sum + Math.max(0, asNumber(item.total, 0)), 0);
  const hasInconsistentTotals = itemsTotal > 0 && payload.total <= 0;

  if (hasInconsistentTotals) {
    return false;
  }

  return hasItems || hasShippingAddress || hasShippingMethod || hasCustomer || hasTotals;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOrderEmailPayload(
  query: QueryService,
  orderModuleService: OrderModuleService | null,
  orderId: string,
  logger: Logger,
): Promise<OrderEmailPayload | null> {
  const minimumDelayMs = Math.max(0, asNumber(process.env.ORDER_EMAIL_DELAY_MS, 12000));
  if (minimumDelayMs > 0) {
    await wait(minimumDelayMs);
  }

  const orderModuleRelationSets = [
    [
      "items",
      "items.detail",
      "shipping_address",
      "billing_address",
      "shipping_methods",
      "shipping_methods.shipping_option",
      "summary",
    ],
    ["items", "shipping_address", "billing_address", "shipping_methods", "summary"],
  ];

  if (orderModuleService) {
    for (const relations of orderModuleRelationSets) {
      try {
        const order = await orderModuleService.retrieveOrder(orderId, { relations });
        const payload = normalizeOrderForEmail(order);
        if (payload && payloadLooksComplete(payload)) {
          return payload;
        }
      } catch (error) {
        logger.warn?.(
          `[order-email] Module order fetch failed for ${orderId} with ${relations.length} relations: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  const maxAttempts = 8;
  const fieldSets = [ORDER_QUERY_FIELDS, ORDER_QUERY_FIELDS_COMPAT, ORDER_QUERY_FIELDS_MINIMAL];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    for (const fields of fieldSets) {
      try {
        const { data = [] } = await query.graph({
          entity: "order",
          fields,
          filters: { id: orderId },
        });

        const payload = normalizeOrderForEmail(data[0]);
        if (payload && payloadLooksComplete(payload)) {
          return payload;
        }
      } catch (error) {
        logger.warn?.(
          `[order-email] Query failed for ${orderId} on attempt ${attempt} with fields "${fields[0]}...": ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (attempt < maxAttempts) {
      logger.warn?.(
        `[order-email] Order ${orderId} data incomplete on attempt ${attempt}/${maxAttempts}. Retrying...`,
      );
      await wait(700 * attempt);
    }
  }

  let data: unknown[] = [];
  try {
    const result = await query.graph({
      entity: "order",
      fields: ORDER_QUERY_FIELDS_COMPAT,
      filters: { id: orderId },
    });
    data = result.data || [];
  } catch (error) {
    logger.error?.(
      `[order-email] Final order fetch failed for ${orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return normalizeOrderForEmail(data[0]);
}

export default async function orderPlacedEmailSubscriber({
  event,
  container,
}: SubscriberArgs<{ id?: string }>) {
  const orderId = asString(event.data?.id);
  if (!orderId) {
    return;
  }

  const logger = (container.resolve(ContainerRegistrationKeys.LOGGER) as Logger) || {};
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as QueryService;
  let orderModuleService: OrderModuleService | null = null;
  let emailTemplateService: EmailTemplateModuleService | null = null;

  try {
    orderModuleService = container.resolve(Modules.ORDER) as OrderModuleService;
  } catch {
    logger.warn?.("[order-email] Could not resolve order module service. Falling back to query.graph only.");
  }

  try {
    emailTemplateService = container.resolve(EMAIL_TEMPLATE_MODULE) as EmailTemplateModuleService;
  } catch {
    logger.warn?.("[order-email] Could not resolve email template module. Using default renderer.");
  }

  const payload = await fetchOrderEmailPayload(query, orderModuleService, orderId, logger);
  if (!payload) {
    logger.warn?.(`[order-email] Could not normalize order payload for ${orderId}.`);

    try {
      await sendOrderInternalAlertEmail(
        {
          orderId,
          displayId: orderId,
          customerEmail: "",
          currencyCode: "eur",
          subtotal: 0,
          shippingTotal: 0,
          taxTotal: 0,
          total: 0,
          createdAt: new Date().toISOString(),
          shippingMethod: "Shipping method not specified",
          shippingAddress: "Shipping address not provided",
          items: [],
        },
        emailTemplateService || undefined,
      );
      logger.warn?.(`[order-email] Fallback internal alert sent for ${orderId}.`);
    } catch (fallbackError) {
      logger.error?.(
        `[order-email] Fallback internal alert failed for ${orderId}: ${
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        }`,
      );
    }

    return;
  }

  try {
    await sendOrderCustomerConfirmationEmail(payload, emailTemplateService || undefined);
    logger.info?.(`[order-email] Customer confirmation sent for ${payload.orderId}.`);
  } catch (error) {
    logger.error?.(
      `[order-email] Customer confirmation failed for ${payload.orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  try {
    await sendOrderInternalAlertEmail(payload, emailTemplateService || undefined);
    logger.info?.(`[order-email] Internal order alert sent for ${payload.orderId}.`);
  } catch (error) {
    logger.error?.(
      `[order-email] Internal order alert failed for ${payload.orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
