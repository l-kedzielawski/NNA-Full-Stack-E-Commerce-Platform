import { TRAFFIC_HIT_MODULE } from "../../modules/traffic-hit";

type TrafficHitService = {
  createTrafficHits?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  createTrafficHit?: (input: Record<string, unknown> | Record<string, unknown>[]) => Promise<unknown>;
  listAndCountTrafficHits?: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<[unknown[], number]>;
  listAndCountTrafficHit?: (
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<[unknown[], number]>;
};

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

export function getTrafficHitService(scope: { resolve: (key: string) => unknown }): TrafficHitService {
  return scope.resolve(TRAFFIC_HIT_MODULE) as TrafficHitService;
}

export async function createTrafficHitRecord(
  service: TrafficHitService,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const creator = service.createTrafficHits || service.createTrafficHit;

  if (!creator) {
    throw new Error("Traffic service is missing create method.");
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
    throw new Error("Traffic hit create did not return a record.");
  }

  return normalized;
}

export async function listTrafficHitsWithCount(
  service: TrafficHitService,
  filters: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<[Record<string, unknown>[], number]> {
  const listAndCount = service.listAndCountTrafficHits || service.listAndCountTrafficHit;

  if (!listAndCount) {
    throw new Error("Traffic service is missing list method.");
  }

  const [rows, count] = await listAndCount.call(service, filters, config);
  return [
    (Array.isArray(rows) ? rows : []).filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null,
    ),
    Number(count) || 0,
  ];
}
