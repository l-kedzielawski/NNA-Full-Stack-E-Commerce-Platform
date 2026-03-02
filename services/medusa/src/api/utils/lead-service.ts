import { LEAD_MODULE } from "../../modules/lead";

type LeadService = {
  createLeads?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  createLead?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  listLeads?: (filters?: Record<string, unknown>, config?: Record<string, unknown>) => Promise<unknown[]>;
  listAndCountLeads?: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<[unknown[], number]>;
  listAndCountLead?: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<[unknown[], number]>;
  updateLeads?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  updateLead?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  retrieveLead?: (id: string) => Promise<unknown>;
  retrieveLeads?: (id: string) => Promise<unknown>;
};

export function getLeadService(scope: { resolve: (key: string) => unknown }): LeadService {
  return scope.resolve(LEAD_MODULE) as LeadService;
}

function asFirstItem(result: unknown): Record<string, unknown> | null {
  if (!result) {
    return null;
  }

  if (Array.isArray(result)) {
    const first = result[0];
    return first && typeof first === "object" ? (first as Record<string, unknown>) : null;
  }

  if (typeof result === "object") {
    return result as Record<string, unknown>;
  }

  return null;
}

export async function createLeadRecord(
  service: LeadService,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const creator = service.createLeads || service.createLead;

  if (!creator) {
    throw new Error("Lead service is missing create method.");
  }

  try {
    const result = await creator.call(service, input);
    const normalized = asFirstItem(result);
    if (normalized) {
      return normalized;
    }
  } catch {
    // fallback to array input
  }

  const arrayResult = await creator.call(service, [input]);
  const normalized = asFirstItem(arrayResult);
  if (!normalized) {
    throw new Error("Lead create did not return a record.");
  }

  return normalized;
}

export async function listLeadsWithCount(
  service: LeadService,
  filters: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<[Record<string, unknown>[], number]> {
  const listAndCount = service.listAndCountLeads || service.listAndCountLead;

  if (listAndCount) {
    const [rows, count] = await listAndCount.call(service, filters, config);
    return [
      (Array.isArray(rows) ? rows : []).filter((item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
      ),
      Number(count) || 0,
    ];
  }

  const list = service.listLeads;
  if (!list) {
    throw new Error("Lead service is missing list method.");
  }

  const rows = await list.call(service, filters, config);
  const normalized = (Array.isArray(rows) ? rows : []).filter(
    (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
  );

  return [normalized, normalized.length];
}

export async function updateLeadRecord(
  service: LeadService,
  input: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const updater = service.updateLeads || service.updateLead;

  if (!updater) {
    throw new Error("Lead service is missing update method.");
  }

  try {
    const result = await updater.call(service, input);
    const normalized = asFirstItem(result);
    if (normalized) {
      return normalized;
    }
  } catch {
    // fallback to array input
  }

  const arrayResult = await updater.call(service, [input]);
  return asFirstItem(arrayResult);
}

export async function retrieveLeadRecord(
  service: LeadService,
  id: string,
): Promise<Record<string, unknown> | null> {
  const retriever = service.retrieveLead || service.retrieveLeads;

  if (!retriever) {
    return null;
  }

  const result = await retriever.call(service, id);
  return asFirstItem(result);
}
