import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useMemo, useState } from "react";

type RankedItem = {
  label: string;
  count: number;
};

type TrendPoint = {
  date: string;
  count: number;
};

type AnalyticsPayload = {
  total: number;
  counts: Record<string, number>;
  wonRate: number;
  last24h: number;
  last7d: number;
  last30d: number;
  topCountries: RankedItem[];
  topProducts: RankedItem[];
  sources: RankedItem[];
  trend: TrendPoint[];
};

const statuses = ["new", "contacted", "qualified", "won", "lost", "spam"] as const;

function shortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const LeadsAnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxTrend = useMemo(() => {
    const values = data?.trend || [];
    return Math.max(1, ...values.map((item) => item.count));
  }, [data]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/admin/leads/stats", { credentials: "include" });
      const payload = (await response.json()) as Partial<AnalyticsPayload> & { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Could not load analytics.");
      }

      setData({
        total: Number(payload.total || 0),
        counts: payload.counts || {},
        wonRate: Number(payload.wonRate || 0),
        last24h: Number(payload.last24h || 0),
        last7d: Number(payload.last7d || 0),
        last30d: Number(payload.last30d || 0),
        topCountries: payload.topCountries || [],
        topProducts: payload.topProducts || [],
        sources: payload.sources || [],
        trend: payload.trend || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Lead Analytics</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
            Operational visibility for quote form intake and sales funnel.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/a/leads"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "8px 12px",
              textDecoration: "none",
              color: "#111827",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Inbox
          </a>
          <button
            type="button"
            onClick={() => void load()}
            style={{ border: "1px solid #111827", background: "#111827", color: "#fff", borderRadius: 8, padding: "8px 12px" }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <a
            href="/a/traffic"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "8px 12px",
              textDecoration: "none",
              color: "#111827",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Traffic
          </a>
        </div>
      </div>

      {error ? <p style={{ margin: 0, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        <Metric label="Total Leads" value={data?.total || 0} />
        <Metric label="Last 24h" value={data?.last24h || 0} />
        <Metric label="Last 7d" value={data?.last7d || 0} />
        <Metric label="Last 30d" value={data?.last30d || 0} />
        <Metric label="Won %" value={`${(data?.wonRate || 0).toFixed(2)}%`} />
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Status Breakdown</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
          {statuses.map((status) => (
            <Metric key={status} label={status} value={data?.counts?.[status] || 0} small />
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Daily Trend (Last 14 Days)</h2>
        {data?.trend?.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(60px,1fr))", gap: 8, alignItems: "end", minHeight: 170 }}>
            {data.trend.map((point) => {
              const height = `${Math.max(8, Math.round((point.count / maxTrend) * 120))}px`;
              return (
                <div key={point.date} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{point.count}</div>
                  <div style={{ width: 20, height, borderRadius: 6, background: "#111827" }} />
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{shortDate(point.date)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>No trend data yet.</p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
        <RankedList title="Top Countries" rows={data?.topCountries || []} />
        <RankedList title="Top Products" rows={data?.topProducts || []} />
        <RankedList title="Lead Sources" rows={data?.sources || []} />
      </div>
    </div>
  );
};

const Metric = ({ label, value, small = false }: { label: string; value: string | number; small?: boolean }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: small ? "8px 10px" : "10px 12px" }}>
      <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8 }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: small ? 18 : 24, fontWeight: 700 }}>{value}</p>
    </div>
  );
};

const RankedList = ({ title, rows }: { title: string; rows: RankedItem[] }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      {rows.length === 0 ? (
        <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>No data yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.label}`}>
                <td style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13, wordBreak: "break-word" }}>
                  {row.label}
                </td>
                <td style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13, textAlign: "right", fontWeight: 700 }}>
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Lead Analytics",
});

export default LeadsAnalyticsPage;
