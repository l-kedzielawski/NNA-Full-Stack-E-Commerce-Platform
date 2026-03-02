const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DEFAULT_FROM = "The Mystic Aroma <orders@themysticaroma.com>";

type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  text: string;
};

export type OrderEmailPayload = {
  orderId: string;
  displayId: string;
  customerEmail: string;
  currencyCode: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  shippingMethod: string;
  shippingAddress: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

export type LeadEmailPayload = {
  leadId: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  product: string;
  quantity: string;
  message: string;
  source: string;
};

export type RenderedEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export type EmailTemplateRenderer = {
  renderOrderCustomerConfirmationEmail?: (payload: OrderEmailPayload) => RenderedEmailContent;
  renderOrderInternalAlertEmail?: (payload: OrderEmailPayload) => RenderedEmailContent;
  renderLeadInternalAlertEmail?: (payload: LeadEmailPayload) => RenderedEmailContent;
};

function parseEmailList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter((item, index, list) => EMAIL_PATTERN.test(item) && list.indexOf(item) === index);
}

function extractAddress(value: string): string | null {
  const bracketMatch = value.match(/<([^>]+)>/);
  const candidate = bracketMatch ? bracketMatch[1].trim() : value.trim();
  return EMAIL_PATTERN.test(candidate) ? candidate : null;
}

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

type EmailFrameInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  contentHtml: string;
  footerText: string;
};

function renderEmailFrame(input: EmailFrameInput): string {
  return `
    <div style="margin:0;padding:24px;background:#090704;font-family:Georgia,'Times New Roman',serif;">
      <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(input.preheader)}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;border-collapse:collapse;border:1px solid #3c311f;background:#12100b;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:26px 30px;background:linear-gradient(135deg,#151109 0%,#1d1509 55%,#2a1d0d 100%);border-bottom:1px solid #4b3a20;">
                  <p style="margin:0 0 8px;color:#d4b06e;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;">${escapeHtml(input.eyebrow)}</p>
                  <h1 style="margin:0;color:#f4e8d0;font-weight:500;font-size:34px;line-height:1.2;">${escapeHtml(input.title)}</h1>
                  <p style="margin:12px 0 0;color:#d9c39a;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">${escapeHtml(input.intro)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 30px;background:#12100b;color:#f3e7ce;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
                  ${input.contentHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 30px 22px;border-top:1px solid #3f321f;background:#0e0c08;color:#bca478;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
                  ${escapeHtml(input.footerText)}<br />
                  <span style="color:#8d7a55;">Natural Mystic Aroma</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `.trim();
}

function getSender(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

function getReplyTo(): string | undefined {
  const configured = process.env.EMAIL_REPLY_TO?.trim();
  if (configured && EMAIL_PATTERN.test(configured)) {
    return configured;
  }
  return undefined;
}

function getFallbackNotifyEmail(): string[] {
  const senderAddress = extractAddress(getSender());
  return senderAddress ? [senderAddress] : [];
}

export function getOrderNotifyEmails(): string[] {
  const configured = parseEmailList(process.env.ORDER_NOTIFY_EMAILS);
  return configured.length ? configured : getFallbackNotifyEmail();
}

export function getLeadNotifyEmails(): string[] {
  const configured = parseEmailList(process.env.LEAD_NOTIFY_EMAILS);
  return configured.length ? configured : getFallbackNotifyEmail();
}

async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!input.to.length) {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is missing, skipping email send.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: getSender(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: getReplyTo(),
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorPayload?.message || `Email provider failed (${response.status}).`);
  }
}

export async function sendOrderCustomerConfirmationEmail(
  payload: OrderEmailPayload,
  templateRenderer?: EmailTemplateRenderer,
): Promise<void> {
  if (!EMAIL_PATTERN.test(payload.customerEmail)) {
    return;
  }

  const orderRef = payload.displayId || payload.orderId;
  const placedAt = formatDateTime(payload.createdAt);
  const siteUrl = getSiteUrl();
  const itemsText = payload.items
    .map(
      (item) =>
        `- ${item.title} x${item.quantity} (${formatAmount(item.unitPrice, payload.currencyCode)} each) = ${formatAmount(item.total, payload.currencyCode)}`,
    )
    .join("\n");

  const itemRowsHtml = payload.items.length
    ? payload.items
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
        .join("")
    : `
      <tr>
        <td colspan="4" style="padding:12px 0;color:#d7c5a1;">Items are being prepared and will appear in your order details shortly.</td>
      </tr>
    `;

  const html = renderEmailFrame({
    preheader: `Order confirmed for ${formatAmount(payload.total, payload.currencyCode)}`,
    eyebrow: "Order Confirmed",
    title: "Thank you for your order",
    intro: "Your items are now reserved and our logistics team is preparing dispatch from our Poznan warehouse.",
    contentHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr>
          <td style="padding:16px 18px;">
            <p style="margin:0 0 6px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order confirmed</p>
            <p style="margin:0;color:#f4e8d0;font-size:16px;font-weight:600;">Placed on ${escapeHtml(placedAt)}</p>
          </td>
          <td style="padding:16px 18px;border-left:1px solid #3f321f;min-width:160px;text-align:right;">
            <p style="margin:0 0 6px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order Total</p>
            <p style="margin:0;color:#f2dfb6;font-size:24px;font-weight:700;">${escapeHtml(formatAmount(payload.total, payload.currencyCode))}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
        <tr>
          <td>
            <p style="margin:0 0 10px;color:#e7d0a2;font-size:15px;font-weight:700;letter-spacing:0.2px;">Items in this order</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <th align="left" style="padding:0 10px 8px 0;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Product</th>
                <th align="center" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Qty</th>
                <th align="right" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Unit</th>
                <th align="right" style="padding:0 0 8px 10px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Line Total</th>
              </tr>
              ${itemRowsHtml}
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Payment summary</td></tr>
        <tr><td style="padding:0 18px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#cdb894;">Subtotal</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.subtotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:6px 0;color:#cdb894;">Shipping (${escapeHtml(payload.shippingMethod)})</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.shippingTotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:6px 0;color:#cdb894;">Tax</td><td style="padding:6px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.taxTotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;font-weight:700;">Total</td><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;text-align:right;font-weight:700;">${escapeHtml(formatAmount(payload.total, payload.currencyCode))}</td></tr>
          </table>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Shipping destination</td></tr>
        <tr><td style="padding:0 18px 16px;color:#d9c39a;">${escapeHtml(payload.shippingAddress)}</td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 4px;">
        <tr>
          <td style="border-radius:999px;background:#d1ae72;">
            <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:11px 18px;color:#161109;font-size:13px;font-weight:700;letter-spacing:0.3px;text-decoration:none;">Visit The Mystic Aroma</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:#bda57a;font-size:12px;">Need any changes? Reply directly to this email and our team will help right away.</p>
    `.trim(),
    footerText: "You are receiving this message because an order was placed with your email address.",
  });

  const defaultContent: RenderedEmailContent = {
    subject: `Order confirmation - The Mystic Aroma`,
    text: [
      `Thank you for your order with The Mystic Aroma.`,
      "",
      `Placed at: ${placedAt}`,
      "",
      "Items:",
      itemsText,
      "",
      `Subtotal: ${formatAmount(payload.subtotal, payload.currencyCode)}`,
      `Shipping: ${formatAmount(payload.shippingTotal, payload.currencyCode)} (${payload.shippingMethod})`,
      `Tax: ${formatAmount(payload.taxTotal, payload.currencyCode)}`,
      `Total: ${formatAmount(payload.total, payload.currencyCode)}`,
      "",
      `Shipping address: ${payload.shippingAddress}`,
      "",
      "If anything needs to be updated, reply to this email and our team will help right away.",
      "",
      "The Mystic Aroma",
    ].join("\n"),
    html,
  };

  const rendered = templateRenderer?.renderOrderCustomerConfirmationEmail?.(payload) || defaultContent;

  await sendEmail({
    to: [payload.customerEmail],
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

export async function sendOrderInternalAlertEmail(
  payload: OrderEmailPayload,
  templateRenderer?: EmailTemplateRenderer,
): Promise<void> {
  const recipients = getOrderNotifyEmails();
  if (!recipients.length) {
    return;
  }

  const orderRef = payload.displayId || payload.orderId;
  const placedAt = formatDateTime(payload.createdAt);
  const adminBaseUrl = getAdminBaseUrl();
  const orderAdminUrl = adminBaseUrl ? `${adminBaseUrl}/a/orders/${encodeURIComponent(payload.orderId)}` : "";
  const itemsText = payload.items
    .map(
      (item) =>
        `- ${item.title} x${item.quantity} (${formatAmount(item.unitPrice, payload.currencyCode)} each) = ${formatAmount(item.total, payload.currencyCode)}`,
    )
    .join("\n");

  const itemRowsHtml = payload.items.length
    ? payload.items
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
        .join("")
    : `<tr><td colspan="4" style="padding:12px 0;color:#d7c5a1;">No item details available yet.</td></tr>`;

  const html = renderEmailFrame({
    preheader: `New order received (${formatAmount(payload.total, payload.currencyCode)})`,
    eyebrow: "New Order Alert",
    title: "New order received",
    intro: "A new paid order entered your pipeline and is ready for processing.",
    contentHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr>
          <td style="padding:14px 18px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Order Snapshot</td>
        </tr>
        <tr>
          <td style="padding:0 18px 16px;">
            <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
            <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Placed at:</strong> ${escapeHtml(placedAt)}</p>
            <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Customer:</strong> ${escapeHtml(payload.customerEmail || "n/a")}</p>
            <p style="margin:0;color:#f2dfb6;"><strong>Total:</strong> ${escapeHtml(formatAmount(payload.total, payload.currencyCode))}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
        <tr>
          <td>
            <p style="margin:0 0 10px;color:#e7d0a2;font-size:15px;font-weight:700;">Items</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <th align="left" style="padding:0 10px 8px 0;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Product</th>
                <th align="center" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Qty</th>
                <th align="right" style="padding:0 10px 8px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Unit</th>
                <th align="right" style="padding:0 0 8px 10px;color:#a99267;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;font-weight:600;">Line Total</th>
              </tr>
              ${itemRowsHtml}
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Delivery and totals</td></tr>
        <tr><td style="padding:0 18px 16px;">
          <p style="margin:0 0 6px;color:#d9c39a;"><strong>Shipping method:</strong> ${escapeHtml(payload.shippingMethod)}</p>
          <p style="margin:0 0 10px;color:#d9c39a;"><strong>Shipping address:</strong> ${escapeHtml(payload.shippingAddress)}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
            <tr><td style="padding:4px 0;color:#cdb894;">Subtotal</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.subtotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:4px 0;color:#cdb894;">Shipping</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.shippingTotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:4px 0;color:#cdb894;">Tax</td><td style="padding:4px 0;color:#f3e7ce;text-align:right;">${escapeHtml(formatAmount(payload.taxTotal, payload.currencyCode))}</td></tr>
            <tr><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;font-weight:700;">Total</td><td style="padding:8px 0 0;border-top:1px solid #2f2618;color:#f2dfb6;text-align:right;font-weight:700;">${escapeHtml(formatAmount(payload.total, payload.currencyCode))}</td></tr>
          </table>
        </td></tr>
      </table>

      ${
        orderAdminUrl
          ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="border-radius:999px;background:#d1ae72;"><a href="${escapeHtml(orderAdminUrl)}" style="display:inline-block;padding:11px 18px;color:#161109;font-size:13px;font-weight:700;text-decoration:none;">Open in Medusa Admin</a></td></tr></table>`
          : ""
      }
    `.trim(),
    footerText: "Internal notification from Natural Mystic Aroma order system.",
  });

  const defaultContent: RenderedEmailContent = {
    subject: `New order received - ${formatAmount(payload.total, payload.currencyCode)}`,
    text: [
      "A new order has been placed.",
      "",
      `Order ID: ${payload.orderId}`,
      `Placed at: ${placedAt}`,
      `Customer email: ${payload.customerEmail || "n/a"}`,
      "",
      "Items:",
      itemsText,
      "",
      `Subtotal: ${formatAmount(payload.subtotal, payload.currencyCode)}`,
      `Shipping: ${formatAmount(payload.shippingTotal, payload.currencyCode)} (${payload.shippingMethod})`,
      `Tax: ${formatAmount(payload.taxTotal, payload.currencyCode)}`,
      `Total: ${formatAmount(payload.total, payload.currencyCode)}`,
      "",
      `Shipping address: ${payload.shippingAddress}`,
      orderAdminUrl ? "" : "",
      orderAdminUrl ? `Admin: ${orderAdminUrl}` : "",
    ].join("\n"),
    html,
  };

  const rendered = templateRenderer?.renderOrderInternalAlertEmail?.(payload) || defaultContent;

  await sendEmail({
    to: recipients,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

export async function sendLeadInternalAlertEmail(
  payload: LeadEmailPayload,
  templateRenderer?: EmailTemplateRenderer,
): Promise<void> {
  const recipients = getLeadNotifyEmails();
  if (!recipients.length) {
    return;
  }

  const safeMessage = payload.message || "(no message)";
  const createdAt = formatDateTime(payload.createdAt);
  const adminBaseUrl = getAdminBaseUrl();
  const leadAdminUrl = adminBaseUrl ? `${adminBaseUrl}/a/leads` : "";

  const html = renderEmailFrame({
    preheader: `New lead from ${payload.name} (${payload.country})`,
    eyebrow: "New Lead Alert",
    title: "A new B2B lead just arrived",
    intro: "A new inquiry has been submitted and is now available in your Medusa lead inbox.",
    contentHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px;color:#d9c39a;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">Lead Snapshot</td></tr>
        <tr><td style="padding:0 18px 16px;">
          <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Lead ID:</strong> ${escapeHtml(payload.leadId)}</p>
          <p style="margin:0 0 6px;color:#f4e8d0;"><strong>Created at:</strong> ${escapeHtml(createdAt)}</p>
          <p style="margin:0;color:#f4e8d0;"><strong>Source:</strong> ${escapeHtml(payload.source || "quote_form")}</p>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Contact details</td></tr>
        <tr><td style="padding:0 18px 16px;">
          <p style="margin:0 0 6px;color:#d9c39a;"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
          <p style="margin:0 0 6px;color:#d9c39a;"><strong>Company:</strong> ${escapeHtml(payload.company || "n/a")}</p>
          <p style="margin:0 0 6px;color:#d9c39a;"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p style="margin:0 0 6px;color:#d9c39a;"><strong>Phone:</strong> ${escapeHtml(payload.phone || "n/a")}</p>
          <p style="margin:0;color:#d9c39a;"><strong>Country:</strong> ${escapeHtml(payload.country)}</p>
        </td></tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;border:1px solid #3f321f;border-radius:14px;overflow:hidden;background:#16120c;">
        <tr><td style="padding:14px 18px 6px;color:#e7d0a2;font-size:15px;font-weight:700;">Inquiry details</td></tr>
        <tr><td style="padding:0 18px 8px;color:#d9c39a;"><strong>Product:</strong> ${escapeHtml(payload.product || "n/a")}</td></tr>
        <tr><td style="padding:0 18px 12px;color:#d9c39a;"><strong>Quantity:</strong> ${escapeHtml(payload.quantity || "n/a")}</td></tr>
        <tr><td style="padding:0 18px 16px;">
          <p style="margin:0 0 8px;color:#d9c39a;"><strong>Message:</strong></p>
          <pre style="white-space:pre-wrap;margin:0;padding:12px;border:1px solid #2f2618;border-radius:10px;background:#11100c;color:#f3e7ce;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;">${escapeHtml(safeMessage)}</pre>
        </td></tr>
      </table>

      ${
        leadAdminUrl
          ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="border-radius:999px;background:#d1ae72;"><a href="${escapeHtml(leadAdminUrl)}" style="display:inline-block;padding:11px 18px;color:#161109;font-size:13px;font-weight:700;text-decoration:none;">Open Leads Dashboard</a></td></tr></table>`
          : ""
      }
    `.trim(),
    footerText: "Internal notification from Natural Mystic Aroma lead capture.",
  });

  const defaultContent: RenderedEmailContent = {
    subject: `New lead: ${payload.name} (${payload.country})`,
    text: [
      "A new lead was created in Medusa.",
      "",
      `Lead ID: ${payload.leadId}`,
      `Created at: ${createdAt}`,
      `Source: ${payload.source || "quote_form"}`,
      "",
      `Name: ${payload.name}`,
      `Company: ${payload.company || "n/a"}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "n/a"}`,
      `Country: ${payload.country}`,
      `Product: ${payload.product || "n/a"}`,
      `Quantity: ${payload.quantity || "n/a"}`,
      "",
      "Message:",
      safeMessage,
      "",
      leadAdminUrl ? `Dashboard: ${leadAdminUrl}` : "",
    ].join("\n"),
    html,
  };

  const rendered = templateRenderer?.renderLeadInternalAlertEmail?.(payload) || defaultContent;

  await sendEmail({
    to: recipients,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}
