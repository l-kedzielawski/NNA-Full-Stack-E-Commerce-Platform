import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getLeadService, retrieveLeadRecord, updateLeadRecord } from "../../../../utils/lead-service";
import { createLeadCheckoutSession, retrieveCheckoutSession } from "../../../../utils/stripe-checkout";

function sanitize(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = String(req.params.id || "").trim();
  if (!id) {
    return res.status(400).json({ message: "Lead ID is required." });
  }

  const body = (req.body || {}) as {
    amount?: unknown;
    currency?: unknown;
    description?: unknown;
    expiresInHours?: unknown;
  };

  const leadService = getLeadService(req.scope);
  const lead = await retrieveLeadRecord(leadService, id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found." });
  }

  const currency = normalizeCurrency(body.currency || "eur");
  if (!currency) {
    return res.status(400).json({ message: "Currency must be a 3-letter ISO code, for example EUR." });
  }

  const name = String(lead.name || "");
  const email = String(lead.email || "");
  const fallbackDescription = `Payment request for ${name || "client"}`;
  const description = sanitize(body.description, 180) || fallbackDescription;
  const expiresInHours = normalizeExpiresInHours(body.expiresInHours);

  let session;
  try {
    session = await createLeadCheckoutSession({
      leadId: id,
      name,
      email,
      amount: body.amount,
      currency,
      description,
      expiresInHours,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Stripe checkout session.";
    return res.status(400).json({ message });
  }

  const updatePayload: Record<string, unknown> = {
    id,
    payment_link_url: session.url || "",
    payment_link_session_id: session.id,
    payment_link_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    payment_status: session.payment_status || "unpaid",
    payment_amount: typeof session.amount_total === "number" ? session.amount_total : null,
    payment_currency: session.currency || currency,
    payment_created_at: new Date().toISOString(),
  };

  if (session.payment_status === "paid") {
    updatePayload.payment_paid_at = new Date().toISOString();
  }

  await updateLeadRecord(leadService, updatePayload);
  const updated = await retrieveLeadRecord(leadService, id);

  return res.status(200).json({
    checkout_url: session.url,
    checkout_session_id: session.id,
    expires_at: session.expires_at,
    lead: updated ? normalizeLead(updated) : null,
  });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = String(req.params.id || "").trim();
  if (!id) {
    return res.status(400).json({ message: "Lead ID is required." });
  }

  const leadService = getLeadService(req.scope);
  const lead = await retrieveLeadRecord(leadService, id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found." });
  }

  const sessionId = String(lead.payment_link_session_id || "").trim();
  if (!sessionId) {
    return res.status(400).json({ message: "No Stripe checkout session is attached to this lead yet." });
  }

  let session;
  try {
    session = await retrieveCheckoutSession(sessionId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not retrieve Stripe checkout session.";
    return res.status(502).json({ message });
  }

  const updatePayload: Record<string, unknown> = {
    id,
    payment_status: session.payment_status || "unpaid",
    payment_amount: typeof session.amount_total === "number" ? session.amount_total : lead.payment_amount || null,
    payment_currency: session.currency || String(lead.payment_currency || ""),
    payment_link_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : lead.payment_link_expires_at || null,
    payment_link_url: session.url || String(lead.payment_link_url || ""),
  };

  if (session.payment_status === "paid") {
    updatePayload.payment_paid_at = String(lead.payment_paid_at || "") || new Date().toISOString();
  }

  await updateLeadRecord(leadService, updatePayload);
  const refreshed = await retrieveLeadRecord(leadService, id);

  return res.status(200).json({
    payment_status: session.payment_status || "unpaid",
    lead: refreshed ? normalizeLead(refreshed) : null,
  });
}
