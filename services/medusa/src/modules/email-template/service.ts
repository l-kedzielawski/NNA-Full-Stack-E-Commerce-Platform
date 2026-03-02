import type { EmailTemplateRenderer, OrderEmailPayload, RenderedEmailContent } from "../../lib/email";
import { orderCustomerTemplate } from "./templates/order-customer";
import { orderInternalTemplate } from "./templates/order-internal";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAmount(amount: number, currencyCode: string): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeCurrency = currencyCode && currencyCode.length === 3 ? currencyCode.toUpperCase() : "EUR";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed)} UTC`;
}

function interpolateTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_match, key: string) => values[key] ?? "");
}

function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    return "https://www.themysticaroma.com";
  }

  return value.replace(/\/$/, "");
}

function getAdminBaseUrl(): string {
  const value = process.env.MEDUSA_ADMIN_URL?.trim();
  if (!value) {
    return "";
  }

  return value.replace(/\/$/, "");
}

function buildCustomerItemsRowsHtml(payload: OrderEmailPayload): string {
  if (!payload.items.length) {
    return `<tr><td colspan="4" style="padding:12px 0;color:#d7c5a1;">Items are being prepared and will appear in your order details shortly.</td></tr>`;
  }

  return payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 10px 10px 0;border-bottom:1px solid #2b2418;color:#f3e7ce;">${escapeHtml(item.title)}</td>
          <td style="padding:10px;border-bottom:1px solid #2b2418;color:#d7c5a1;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #2b2418;color:#d7c5a1;text-align:right;">${escapeHtml(formatAmount(item.unitPrice, payload.currencyCode))}</td>
          <td style="padding:10px 0 10px 10px;border-bottom:1px solid #2b2418;color:#f2dfb6;text-align:right;font-weight:700;">${escapeHtml(formatAmount(item.total, payload.currencyCode))}</td>
        </tr>
      `,
    )
    .join("");
}

function buildInternalItemsRowsHtml(payload: OrderEmailPayload): string {
  if (!payload.items.length) {
    return `<tr><td colspan="4" style="padding:12px 0;color:#d7c5a1;">No item details available yet.</td></tr>`;
  }

  return payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 10px 8px 0;border-bottom:1px solid #2b2418;color:#f3e7ce;">${escapeHtml(item.title)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #2b2418;color:#d7c5a1;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #2b2418;color:#d7c5a1;text-align:right;">${escapeHtml(formatAmount(item.unitPrice, payload.currencyCode))}</td>
          <td style="padding:8px 0 8px 10px;border-bottom:1px solid #2b2418;color:#f2dfb6;text-align:right;font-weight:700;">${escapeHtml(formatAmount(item.total, payload.currencyCode))}</td>
        </tr>
      `,
    )
    .join("");
}

function buildItemsText(payload: OrderEmailPayload): string {
  if (!payload.items.length) {
    return "(no item details available yet)";
  }

  return payload.items
    .map(
      (item) =>
        `- ${item.title} x${item.quantity} (${formatAmount(item.unitPrice, payload.currencyCode)} each) = ${formatAmount(item.total, payload.currencyCode)}`,
    )
    .join("\n");
}

class EmailTemplateModuleService implements EmailTemplateRenderer {
  renderOrderCustomerConfirmationEmail(payload: OrderEmailPayload): RenderedEmailContent {
    const orderRef = payload.displayId || payload.orderId;
    const placedAt = formatDateTime(payload.createdAt);

    const values = {
      order_ref: escapeHtml(orderRef),
      order_id: escapeHtml(payload.orderId),
      placed_at: escapeHtml(placedAt),
      shipping_method: escapeHtml(payload.shippingMethod),
      shipping_address: escapeHtml(payload.shippingAddress),
      customer_email: escapeHtml(payload.customerEmail || "n/a"),
      subtotal: escapeHtml(formatAmount(payload.subtotal, payload.currencyCode)),
      shipping_total: escapeHtml(formatAmount(payload.shippingTotal, payload.currencyCode)),
      tax_total: escapeHtml(formatAmount(payload.taxTotal, payload.currencyCode)),
      total: escapeHtml(formatAmount(payload.total, payload.currencyCode)),
      preheader: escapeHtml(`Order confirmed for ${formatAmount(payload.total, payload.currencyCode)}`),
      site_url: escapeHtml(getSiteUrl()),
      items_rows_html: buildCustomerItemsRowsHtml(payload),
      items_text: buildItemsText(payload),
    };

    return {
      subject: interpolateTemplate(orderCustomerTemplate.subject, values),
      text: interpolateTemplate(orderCustomerTemplate.text, values),
      html: interpolateTemplate(orderCustomerTemplate.html, values),
    };
  }

  renderOrderInternalAlertEmail(payload: OrderEmailPayload): RenderedEmailContent {
    const orderRef = payload.displayId || payload.orderId;
    const placedAt = formatDateTime(payload.createdAt);
    const adminBaseUrl = getAdminBaseUrl();
    const orderAdminUrl = adminBaseUrl ? `${adminBaseUrl}/a/orders/${encodeURIComponent(payload.orderId)}` : "";
    const orderAdminButton = orderAdminUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="border-radius:999px;background:#d1ae72;"><a href="${escapeHtml(orderAdminUrl)}" style="display:inline-block;padding:11px 18px;color:#161109;font-size:13px;font-weight:700;text-decoration:none;">Open in Medusa Admin</a></td></tr></table>`
      : "";

    const values = {
      order_ref: escapeHtml(orderRef),
      order_id: escapeHtml(payload.orderId),
      placed_at: escapeHtml(placedAt),
      shipping_method: escapeHtml(payload.shippingMethod),
      shipping_address: escapeHtml(payload.shippingAddress),
      customer_email: escapeHtml(payload.customerEmail || "n/a"),
      subtotal: escapeHtml(formatAmount(payload.subtotal, payload.currencyCode)),
      shipping_total: escapeHtml(formatAmount(payload.shippingTotal, payload.currencyCode)),
      tax_total: escapeHtml(formatAmount(payload.taxTotal, payload.currencyCode)),
      total: escapeHtml(formatAmount(payload.total, payload.currencyCode)),
      preheader: escapeHtml(`New order received (${formatAmount(payload.total, payload.currencyCode)})`),
      items_rows_html: buildInternalItemsRowsHtml(payload),
      items_text: buildItemsText(payload),
      order_admin_button: orderAdminButton,
      order_admin_url_line: orderAdminUrl ? `Admin: ${orderAdminUrl}` : "",
    };

    return {
      subject: interpolateTemplate(orderInternalTemplate.subject, values),
      text: interpolateTemplate(orderInternalTemplate.text, values),
      html: interpolateTemplate(orderInternalTemplate.html, values),
    };
  }
}

export default EmailTemplateModuleService;
