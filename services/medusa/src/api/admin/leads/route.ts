import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getLeadService, listLeadsWithCount } from "../../utils/lead-service";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "spam";

const validStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "spam"];

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
