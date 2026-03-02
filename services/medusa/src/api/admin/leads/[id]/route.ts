import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getLeadService, retrieveLeadRecord, updateLeadRecord } from "../../../utils/lead-service";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "spam";

const validStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "spam"];
const validPriorities = ["low", "normal", "high"] as const;

function sanitize(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeLead(lead: Record<string, unknown>) {
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
    created_at: lead.created_at,
    updated_at: lead.updated_at,
  };
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

  return res.status(200).json({ lead: normalizeLead(lead) });
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = String(req.params.id || "").trim();
  if (!id) {
    return res.status(400).json({ message: "Lead ID is required." });
  }

  const body = (req.body || {}) as {
    status?: unknown;
    priority?: unknown;
    notes?: unknown;
    assignee?: unknown;
  };

  const status = sanitize(body.status, 30).toLowerCase();
  const priority = sanitize(body.priority, 30).toLowerCase();
  const notes = sanitize(body.notes, 5000);
  const assignee = sanitize(body.assignee, 120);

  const update: Record<string, unknown> = { id };

  if (status) {
    if (!validStatuses.includes(status as LeadStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    update.status = status;
  }

  if (priority) {
    if (!validPriorities.includes(priority as (typeof validPriorities)[number])) {
      return res.status(400).json({ message: "Invalid priority value." });
    }
    update.priority = priority;
  }

  if (body.notes !== undefined) {
    update.notes = notes;
  }

  if (body.assignee !== undefined) {
    update.assignee = assignee;
  }

  const leadService = getLeadService(req.scope);
  await updateLeadRecord(leadService, update);
  const updated = await retrieveLeadRecord(leadService, id);

  if (!updated) {
    return res.status(404).json({ message: "Lead not found after update." });
  }

  return res.status(200).json({ lead: normalizeLead(updated) });
}
