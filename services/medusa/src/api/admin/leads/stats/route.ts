import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getLeadService, listLeadsWithCount } from "../../../utils/lead-service";

const statuses = ["new", "contacted", "qualified", "won", "lost", "spam"] as const;

const dayMs = 24 * 60 * 60 * 1000;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function topEntries(map: Map<string, number>, limit = 8): Array<{ label: string; count: number }> {
  return [...map.entries()]
    .filter(([label]) => !!label)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const leadService = getLeadService(req.scope);

  const [rows] = await listLeadsWithCount(leadService, {}, {
    take: 2000,
    skip: 0,
    order: {
      created_at: "DESC",
    },
  });

  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<string, number>;
  const now = Date.now();
  const since24h = now - dayMs;
  const since7d = now - 7 * dayMs;
  const since30d = now - 30 * dayMs;

  let last24h = 0;
  let last7d = 0;
  let last30d = 0;

  const countryCounts = new Map<string, number>();
  const productCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();

  const trendDays = 14;
  const trendMap = new Map<string, number>();
  for (let i = trendDays - 1; i >= 0; i -= 1) {
    const dateKey = toDateKey(new Date(now - i * dayMs));
    trendMap.set(dateKey, 0);
  }

  for (const row of rows) {
    const status = String(row.status || "new").toLowerCase();
    if (status in counts) {
      counts[status] += 1;
    }

    const country = String(row.country || "").trim();
    if (country) {
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    }

    const product = String(row.product || "").trim();
    if (product) {
      productCounts.set(product, (productCounts.get(product) || 0) + 1);
    }

    const source = String(row.source || "quote_form").trim() || "quote_form";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);

    const createdAt = new Date(String(row.created_at || ""));
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    const createdMs = createdAt.getTime();
    if (createdMs >= since24h) {
      last24h += 1;
    }
    if (createdMs >= since7d) {
      last7d += 1;
    }
    if (createdMs >= since30d) {
      last30d += 1;
    }

    const dateKey = toDateKey(createdAt);
    if (trendMap.has(dateKey)) {
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
    }
  }

  const total = rows.length;
  const won = counts.won || 0;
  const wonRate = total > 0 ? Number(((won / total) * 100).toFixed(2)) : 0;

  return res.status(200).json({
    total,
    counts,
    wonRate,
    last24h,
    last7d,
    last30d,
    topCountries: topEntries(countryCounts),
    topProducts: topEntries(productCounts),
    sources: topEntries(sourceCounts, 12),
    trend: [...trendMap.entries()].map(([date, count]) => ({ date, count })),
  });
}
