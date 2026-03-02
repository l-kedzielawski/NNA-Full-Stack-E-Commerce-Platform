import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  formatGaDate,
  getGa4Config,
  parseTrafficRange,
  runGa4Report,
} from "../../utils/ga4";

type RankedRow = {
  label: string;
  sessions: number;
  users: number;
  conversions?: number;
  pageviews?: number;
};

function asNumber(value: number | undefined, fractionDigits = 0): number {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  if (fractionDigits <= 0) {
    return Math.round(parsed);
  }

  return Number(parsed.toFixed(fractionDigits));
}

function pickTop(rows: RankedRow[], limit = 10): RankedRow[] {
  return rows
    .filter((row) => !!row.label)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, limit);
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = getGa4Config();

  if (!config) {
    return res.status(503).json({
      message:
        "Traffic dashboard is not configured. Set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY in Medusa env.",
    });
  }

  const range = parseTrafficRange(req.query.range);

  try {
    const dateRanges = [{ startDate: range.startDate, endDate: range.endDate }];

    const [overviewRows, trendRows, channelRows, pageRows, countryRows, sourceRows, deviceRows] =
      await Promise.all([
        runGa4Report(config, {
          dateRanges,
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "newUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
            { name: "conversions" },
          ],
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "conversions" },
          ],
          orderBys: [{ dimension: { dimensionName: "date", orderType: "NUMERIC" } }],
          limit: "120",
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "12",
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: "12",
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "country" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "12",
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "sessionSourceMedium" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "12",
        }),
        runGa4Report(config, {
          dateRanges,
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: "6",
        }),
      ]);

    const overview = overviewRows[0] || { dimensions: [], metrics: [] };

    const trend = trendRows.map((row) => ({
      date: formatGaDate(row.dimensions[0] || ""),
      sessions: asNumber(row.metrics[0]),
      users: asNumber(row.metrics[1]),
      pageviews: asNumber(row.metrics[2]),
      conversions: asNumber(row.metrics[3]),
    }));

    const channels = pickTop(
      channelRows.map((row) => ({
        label: row.dimensions[0] || "(not set)",
        sessions: asNumber(row.metrics[0]),
        users: asNumber(row.metrics[1]),
        conversions: asNumber(row.metrics[2]),
      })),
    );

    const topPages = pageRows
      .map((row) => ({
        label: row.dimensions[0] || "(not set)",
        sessions: asNumber(row.metrics[1]),
        users: 0,
        pageviews: asNumber(row.metrics[0]),
      }))
      .filter((row) => !!row.label)
      .sort((a, b) => (b.pageviews || 0) - (a.pageviews || 0))
      .slice(0, 12);

    const countries = pickTop(
      countryRows.map((row) => ({
        label: row.dimensions[0] || "(not set)",
        sessions: asNumber(row.metrics[0]),
        users: asNumber(row.metrics[1]),
      })),
    );

    const sources = pickTop(
      sourceRows.map((row) => ({
        label: row.dimensions[0] || "(not set)",
        sessions: asNumber(row.metrics[0]),
        users: asNumber(row.metrics[1]),
        conversions: asNumber(row.metrics[2]),
      })),
    );

    const devices = pickTop(
      deviceRows.map((row) => ({
        label: row.dimensions[0] || "(not set)",
        sessions: asNumber(row.metrics[0]),
        users: asNumber(row.metrics[1]),
      })),
      6,
    );

    const sessions = asNumber(overview.metrics[0]);
    const users = asNumber(overview.metrics[1]);
    const newUsers = asNumber(overview.metrics[2]);
    const pageviews = asNumber(overview.metrics[3]);
    const bounceRatePct = asNumber((overview.metrics[4] || 0) * 100, 2);
    const avgSessionDurationSec = asNumber(overview.metrics[5], 2);
    const conversions = asNumber(overview.metrics[6], 2);

    return res.status(200).json({
      range,
      overview: {
        sessions,
        users,
        newUsers,
        pageviews,
        bounceRatePct,
        avgSessionDurationSec,
        conversions,
      },
      trend,
      channels,
      topPages,
      countries,
      sources,
      devices,
    });
  } catch (error) {
    return res.status(502).json({
      message: error instanceof Error ? error.message : "Could not load traffic analytics.",
    });
  }
}
