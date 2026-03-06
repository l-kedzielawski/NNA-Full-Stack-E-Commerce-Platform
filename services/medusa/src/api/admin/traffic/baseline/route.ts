import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseTrafficRange } from "../../../utils/ga4";
import { getTrafficHitService, listTrafficHitsWithCount } from "../../../utils/traffic-hit-service";

const DAY_MS = 24 * 60 * 60 * 1000;

type RankedRow = {
  label: string;
  hits: number;
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function topEntries(map: Map<string, number>, limit = 12): RankedRow[] {
  return [...map.entries()]
    .filter(([label]) => !!label)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, hits]) => ({ label, hits }));
}

function getRangeStartMs(rangeKey: "7d" | "30d" | "90d", nowMs: number): number {
  if (rangeKey === "7d") {
    return nowMs - 7 * DAY_MS;
  }

  if (rangeKey === "90d") {
    return nowMs - 90 * DAY_MS;
  }

  return nowMs - 30 * DAY_MS;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const range = parseTrafficRange(req.query.range);
  const now = Date.now();
  const sinceMs = getRangeStartMs(range.key, now);

  const trafficService = getTrafficHitService(req.scope);
  const [rows] = await listTrafficHitsWithCount(trafficService, {}, {
    take: 50000,
    skip: 0,
    order: {
      created_at: "DESC",
    },
  });

  const trendMap = new Map<string, number>();
  const trendDays = range.key === "7d" ? 7 : range.key === "90d" ? 90 : 30;

  for (let i = trendDays - 1; i >= 0; i -= 1) {
    trendMap.set(toDateKey(new Date(now - i * DAY_MS)), 0);
  }

  const pageMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const localeMap = new Map<string, number>();
  const uniquePages = new Set<string>();
  const uniqueCountries = new Set<string>();
  const uniqueReferrers = new Set<string>();

  let totalHits = 0;
  let mobileHits = 0;

  for (const row of rows) {
    const createdAt = new Date(String(row.created_at || ""));
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    const createdMs = createdAt.getTime();
    if (createdMs < sinceMs) {
      continue;
    }

    totalHits += 1;

    const path = String(row.path || "").trim() || "(unknown)";
    const country = String(row.country_code || "").trim().toUpperCase() || "Unknown";
    const referrer = String(row.referrer_domain || "").trim().toLowerCase() || "Direct";
    const device = String(row.device_category || "").trim().toLowerCase() || "unknown";
    const locale = String(row.locale || "").trim().toLowerCase() || "unknown";

    pageMap.set(path, (pageMap.get(path) || 0) + 1);
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    localeMap.set(locale, (localeMap.get(locale) || 0) + 1);

    uniquePages.add(path);
    if (country !== "Unknown") {
      uniqueCountries.add(country);
    }
    if (referrer !== "Direct") {
      uniqueReferrers.add(referrer);
    }

    if (device === "mobile") {
      mobileHits += 1;
    }

    const dateKey = toDateKey(createdAt);
    if (trendMap.has(dateKey)) {
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
    }
  }

  const mobileSharePct = totalHits > 0 ? Number(((mobileHits / totalHits) * 100).toFixed(2)) : 0;

  return res.status(200).json({
    range,
    overview: {
      totalHits,
      uniquePages: uniquePages.size,
      countries: uniqueCountries.size,
      referrers: uniqueReferrers.size,
      mobileSharePct,
    },
    trend: [...trendMap.entries()].map(([date, hits]) => ({ date, hits })),
    topPages: topEntries(pageMap, 12),
    countries: topEntries(countryMap, 12),
    referrers: topEntries(referrerMap, 12),
    devices: topEntries(deviceMap, 6),
    locales: topEntries(localeMap, 6),
  });
}
