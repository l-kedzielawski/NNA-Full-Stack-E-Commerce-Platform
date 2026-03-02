import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createLeadRecord, getLeadService } from "../../utils/lead-service";
import { sendLeadInternalAlertEmail } from "../../../lib/email";

type LeadInput = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  country?: unknown;
  product?: unknown;
  quantity?: unknown;
  message?: unknown;
  consent?: unknown;
  ip?: unknown;
  userAgent?: unknown;
  source?: unknown;
};

function sanitize(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as LeadInput;

  const name = sanitize(body.name, 120);
  const company = sanitize(body.company, 140);
  const email = sanitize(body.email, 254).toLowerCase();
  const phone = sanitize(body.phone, 60);
  const country = sanitize(body.country, 80);
  const product = sanitize(body.product, 160);
  const quantity = sanitize(body.quantity, 120);
  const message = sanitize(body.message, 2000);
  const ip = sanitize(body.ip, 80);
  const userAgent = sanitize(body.userAgent, 255);
  const source = sanitize(body.source, 60) || "quote_form";
  const consent = body.consent === true;

  if (!name || !country || !email || !EMAIL_PATTERN.test(email) || !consent) {
    return res.status(400).json({
      message: "Invalid lead payload.",
    });
  }

  const leadService = getLeadService(req.scope);

  const lead = await createLeadRecord(leadService, {
    name,
    company,
    email,
    phone,
    country,
    product,
    quantity,
    message,
    consent,
    ip,
    user_agent: userAgent,
    source,
    status: "new",
    priority: "normal",
  });

  try {
    await sendLeadInternalAlertEmail({
      leadId: String(lead.id || ""),
      createdAt: String(lead.created_at || new Date().toISOString()),
      name,
      company,
      email,
      phone,
      country,
      product,
      quantity,
      message,
      source,
    });
  } catch (error) {
    console.error("lead_email_notification_failed", {
      error: error instanceof Error ? error.message : String(error),
      leadId: String(lead.id || ""),
    });
  }

  return res.status(200).json({
    id: lead.id,
    status: lead.status,
    created_at: lead.created_at,
  });
}
