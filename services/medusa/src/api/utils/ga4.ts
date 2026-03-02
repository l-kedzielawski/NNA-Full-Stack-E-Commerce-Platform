import { JWT } from "google-auth-library";

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export type TrafficRangeKey = "7d" | "30d" | "90d";

export type TrafficRange = {
  key: TrafficRangeKey;
  label: string;
  startDate: string;
  endDate: string;
};

type RunReportRequest = {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  metrics: Array<{ name: string }>;
  dimensions?: Array<{ name: string }>;
  orderBys?: Array<{
    metric?: { metricName: string };
    dimension?: { dimensionName: string; orderType?: "ALPHANUMERIC" | "NUMERIC" | "CASE_INSENSITIVE_ALPHANUMERIC" };
    desc?: boolean;
  }>;
  limit?: string;
};

type RunReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

type RunReportResponse = {
  rows?: RunReportRow[];
};

export type GaReportRow = {
  dimensions: string[];
  metrics: number[];
};

export type Ga4Config = {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
};

function readEnv(name: string): string {
  return String(process.env[name] || "").trim();
}

export function getGa4Config(): Ga4Config | null {
  const propertyId = readEnv("GA4_PROPERTY_ID");
  const clientEmail = readEnv("GA4_CLIENT_EMAIL");
  const rawPrivateKey = readEnv("GA4_PRIVATE_KEY");
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  if (!propertyId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

export function parseTrafficRange(input: unknown): TrafficRange {
  const key = String(input || "30d") as TrafficRangeKey;

  if (key === "7d") {
    return { key, label: "Last 7 days", startDate: "7daysAgo", endDate: "today" };
  }

  if (key === "90d") {
    return { key, label: "Last 90 days", startDate: "90daysAgo", endDate: "today" };
  }

  return { key: "30d", label: "Last 30 days", startDate: "30daysAgo", endDate: "today" };
}

async function getAccessToken(config: Ga4Config): Promise<string> {
  const auth = new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [GA_SCOPE],
  });

  const token = await auth.getAccessToken();
  if (!token || !token.token) {
    throw new Error("Could not authorize with GA4 Data API.");
  }

  return token.token;
}

export async function runGa4Report(
  config: Ga4Config,
  request: RunReportRequest,
): Promise<GaReportRow[]> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | (RunReportResponse & { error?: { message?: string } })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || `GA4 report failed with ${response.status}`);
  }

  const rows = payload?.rows || [];
  return rows.map((row) => ({
    dimensions: (row.dimensionValues || []).map((item) => String(item.value || "")),
    metrics: (row.metricValues || []).map((item) => {
      const parsed = Number(item.value || 0);
      return Number.isFinite(parsed) ? parsed : 0;
    }),
  }));
}

export function formatGaDate(yyyymmdd: string): string {
  const value = String(yyyymmdd || "").trim();
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
