import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createLeadRecord, getLeadService, listLeadsWithCount } from "../../utils/lead-service";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "spam";

const validStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "spam"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitize(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function toString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function includesSearch(lead: Record<string, unknown>, q: string): boolean {
  const haystack = [
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.country,
    lead.product,
    lead.message,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  return haystack.includes(q);
}

function normalizeLead(lead: Record<string, unknown>) {
  const paymentAmount = Number(lead.payment_amount);

  return {
    id: String(lead.id || ""),
    name: String(lead.name || ""),
    company: String(lead.company || ""),
    email: String(lead.email || ""),
    phone: String(lead.phone || ""),
    country: String(lead.country || ""),
    product: String(lead.product || ""),
    quantity: String(lead.quantity || ""),
    message: String(lead.message || ""),
    consent: lead.consent === true,
    ip: String(lead.ip || ""),
    user_agent: String(lead.user_agent || ""),
    status: String(lead.status || "new"),
    priority: String(lead.priority || "normal"),
    assignee: String(lead.assignee || ""),
    notes: String(lead.notes || ""),
    source: String(lead.source || ""),
    payment_link_url: String(lead.payment_link_url || ""),
    payment_link_session_id: String(lead.payment_link_session_id || ""),
    payment_link_expires_at: lead.payment_link_expires_at,
    payment_status: String(lead.payment_status || ""),
    payment_amount: Number.isFinite(paymentAmount) ? paymentAmount : null,
    payment_currency: String(lead.payment_currency || ""),
    payment_created_at: lead.payment_created_at,
    payment_paid_at: lead.payment_paid_at,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
  };
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const status = toString(req.query.status).toLowerCase();
  const q = toString(req.query.q).toLowerCase();
  const limit = Math.min(Math.max(toNumber(req.query.limit, 50), 1), 200);
  const offset = Math.max(toNumber(req.query.offset, 0), 0);

  const filters: Record<string, unknown> = {};
  if (validStatuses.includes(status as LeadStatus)) {
    filters.status = status;
  }

  const leadService = getLeadService(req.scope);

  const [rows] = await listLeadsWithCount(leadService, filters, {
    take: 500,
    skip: 0,
    order: {
      created_at: "DESC",
    },
  });

  const searched = q ? rows.filter((lead) => includesSearch(lead, q)) : rows;
  const paginated = searched.slice(offset, offset + limit).map(normalizeLead);

  return res.status(200).json({
    leads: paginated,
    count: searched.length,
    limit,
    offset,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    name?: unknown;
    company?: unknown;
    email?: unknown;
    phone?: unknown;
    country?: unknown;
    product?: unknown;
    quantity?: unknown;
    message?: unknown;
    consent?: unknown;
    source?: unknown;
  };

  const name = sanitize(body.name, 120);
  const company = sanitize(body.company, 140);
  const email = sanitize(body.email, 254).toLowerCase();
  const phone = sanitize(body.phone, 60);
  const country = sanitize(body.country, 80);
  const product = sanitize(body.product, 160);
  const quantity = sanitize(body.quantity, 120);
  const message = sanitize(body.message, 2000);
  const source = sanitize(body.source, 60) || "manual_admin";
  const consent = body.consent === true;

  if (!name || !country || !email || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({
      message: "Please provide valid name, email, and country fields.",
    });
  }

  const leadService = getLeadService(req.scope);
  const created = await createLeadRecord(leadService, {
    name,
    company,
    email,
    phone,
    country,
    product,
    quantity,
    message,
    consent,
    source,
    status: "new",
    priority: "normal",
  });

  return res.status(200).json({
    lead: normalizeLead(created),
  });
}
