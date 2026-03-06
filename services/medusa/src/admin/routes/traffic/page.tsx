import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type TrafficRangeKey = "7d" | "30d" | "90d";

type RankedRow = {
  label: string;
  sessions: number;
  users: number;
  conversions?: number;
  pageviews?: number;
};

type TrendPoint = {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  conversions: number;
};

type TrafficPayload = {
  range: {
    key: TrafficRangeKey;
    label: string;
    startDate: string;
    endDate: string;
  };
  overview: {
    sessions: number;
    users: number;
    newUsers: number;
    pageviews: number;
    bounceRatePct: number;
    avgSessionDurationSec: number;
    conversions: number;
  };
  trend: TrendPoint[];
  channels: RankedRow[];
  topPages: RankedRow[];
  countries: RankedRow[];
  sources: RankedRow[];
  devices: RankedRow[];
};

type BaselineRow = {
  label: string;
  hits: number;
};

type BaselineTrendPoint = {
  date: string;
  hits: number;
};

type BaselineTrafficPayload = {
  range: {
    key: TrafficRangeKey;
    label: string;
    startDate: string;
    endDate: string;
  };
  overview: {
    totalHits: number;
    uniquePages: number;
    countries: number;
    referrers: number;
    mobileSharePct: number;
  };
  trend: BaselineTrendPoint[];
  topPages: BaselineRow[];
  countries: BaselineRow[];
  referrers: BaselineRow[];
  devices: BaselineRow[];
  locales: BaselineRow[];
};

const rangeOptions: Array<{ value: TrafficRangeKey; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}m ${sec}s`;
}

function shortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const TrafficPage = () => {
  const [range, setRange] = useState<TrafficRangeKey>("30d");
  const [data, setData] = useState<TrafficPayload | null>(null);
  const [baseline, setBaseline] = useState<BaselineTrafficPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baselineError, setBaselineError] = useState<string | null>(null);

  const maxTrend = useMemo(() => {
    const values = data?.trend || [];
    return Math.max(1, ...values.map((item) => item.sessions));
  }, [data]);

  const maxBaselineTrend = useMemo(() => {
    const values = baseline?.trend || [];
    return Math.max(1, ...values.map((item) => item.hits));
  }, [baseline]);

  const load = async (selectedRange: TrafficRangeKey) => {
    setLoading(true);
    setError(null);
    setBaselineError(null);

    try {
      const [gaResult, baselineResult] = await Promise.allSettled([
        fetch(`/admin/traffic?range=${selectedRange}`, {
          credentials: "include",
        }),
        fetch(`/admin/traffic/baseline?range=${selectedRange}`, {
          credentials: "include",
        }),
      ]);

      if (gaResult.status === "fulfilled") {
        const payload = (await gaResult.value.json()) as Partial<TrafficPayload> & { message?: string };

        if (!gaResult.value.ok) {
          setError(payload.message || "Could not load GA4 analytics.");
          setData(null);
        } else {
          setData(payload as TrafficPayload);
        }
      } else {
        setError("Could not load GA4 analytics.");
        setData(null);
      }

      if (baselineResult.status === "fulfilled") {
        const payload = (await baselineResult.value.json()) as Partial<BaselineTrafficPayload> & { message?: string };

        if (!baselineResult.value.ok) {
          setBaselineError(payload.message || "Could not load baseline analytics.");
          setBaseline(null);
        } else {
          setBaseline(payload as BaselineTrafficPayload);
        }
      } else {
        setBaselineError("Could not load baseline analytics.");
        setBaseline(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(range);
  }, [range]);

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Traffic Analytics</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
            GA4 (consented) + first-party cookieless baseline analytics inside Medusa.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as TrafficRangeKey)}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load(range)}
            style={{ border: "1px solid #111827", background: "#111827", color: "#fff", borderRadius: 8, padding: "8px 12px" }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
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
            Leads
          </a>
        </div>
      </div>

      {error ? <p style={{ margin: 0, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
      {baselineError ? <p style={{ margin: 0, color: "#b45309", fontSize: 13 }}>{baselineError}</p> : null}

      {data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
            <Metric label="Sessions" value={data.overview.sessions} />
            <Metric label="Users" value={data.overview.users} />
            <Metric label="New Users" value={data.overview.newUsers} />
            <Metric label="Pageviews" value={data.overview.pageviews} />
            <Metric label="Conversions" value={data.overview.conversions} />
            <Metric label="Bounce Rate" value={`${data.overview.bounceRatePct.toFixed(2)}%`} />
            <Metric label="Avg Session" value={formatDuration(data.overview.avgSessionDurationSec)} />
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Session Trend ({data.range.label})</h2>
            {data.trend.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(46px,1fr))", gap: 6, alignItems: "end", minHeight: 170 }}>
                {data.trend.map((point) => {
                  const height = `${Math.max(8, Math.round((point.sessions / maxTrend) * 120))}px`;
                  return (
                    <div key={point.date} style={{ display: "grid", gap: 5, justifyItems: "center" }}>
                      <div style={{ fontSize: 10, opacity: 0.75 }}>{point.sessions}</div>
                      <div style={{ width: 18, height, borderRadius: 6, background: "#111827" }} />
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{shortDate(point.date)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>No trend data.</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
            <RankedTable title="Channels" rows={data.channels} columns={["sessions", "users", "conversions"]} />
            <RankedTable title="Top Pages" rows={data.topPages} columns={["pageviews", "sessions"]} />
            <RankedTable title="Countries" rows={data.countries} columns={["sessions", "users"]} />
            <RankedTable title="Sources" rows={data.sources} columns={["sessions", "users", "conversions"]} />
            <RankedTable title="Devices" rows={data.devices} columns={["sessions", "users"]} />
          </div>
        </>
      ) : null}

      {baseline ? (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Cookieless Baseline</h2>
            <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.75 }}>
              Anonymous first-party page hit metrics for all visitors, regardless of consent choice.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
            <Metric label="Total Hits" value={baseline.overview.totalHits} />
            <Metric label="Unique Pages" value={baseline.overview.uniquePages} />
            <Metric label="Countries" value={baseline.overview.countries} />
            <Metric label="Referrer Domains" value={baseline.overview.referrers} />
            <Metric label="Mobile Share" value={`${baseline.overview.mobileSharePct.toFixed(2)}%`} />
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Cookieless Hit Trend ({baseline.range.label})</h2>
            {baseline.trend.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(46px,1fr))", gap: 6, alignItems: "end", minHeight: 170 }}>
                {baseline.trend.map((point) => {
                  const height = `${Math.max(8, Math.round((point.hits / maxBaselineTrend) * 120))}px`;
                  return (
                    <div key={`baseline-${point.date}`} style={{ display: "grid", gap: 5, justifyItems: "center" }}>
                      <div style={{ fontSize: 10, opacity: 0.75 }}>{point.hits}</div>
                      <div style={{ width: 18, height, borderRadius: 6, background: "#334155" }} />
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{shortDate(point.date)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>No baseline trend data.</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
            <BaselineRankedTable title="Top Pages" rows={baseline.topPages} />
            <BaselineRankedTable title="Referrer Domains" rows={baseline.referrers} />
            <BaselineRankedTable title="Countries" rows={baseline.countries} />
            <BaselineRankedTable title="Devices" rows={baseline.devices} />
            <BaselineRankedTable title="Locales" rows={baseline.locales} />
          </div>
        </>
      ) : null}

      {!data && !baseline && loading ? (
        <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Loading traffic analytics...</p>
      ) : null}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px" }}>
      <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8 }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700 }}>{value}</p>
    </div>
  );
};

const RankedTable = ({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: RankedRow[];
  columns: Array<"sessions" | "users" | "conversions" | "pageviews">;
}) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      {rows.length === 0 ? (
        <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>No data yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Label</th>
              {columns.map((column) => (
                <th key={column} style={{ ...thStyle, textAlign: "right" }}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.label}`}>
                <td style={tdStyle}>{row.label}</td>
                {columns.map((column) => (
                  <td key={`${row.label}-${column}`} style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                    {Number(row[column] || 0).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const BaselineRankedTable = ({ title, rows }: { title: string; rows: BaselineRow[] }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      {rows.length === 0 ? (
        <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>No data yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Label</th>
              <th style={{ ...thStyle, textAlign: "right" }}>hits</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.label}`}>
                <td style={tdStyle}>{row.label}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{row.hits.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  padding: "0 0 6px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  opacity: 0.7,
};

const tdStyle: CSSProperties = {
  padding: "8px 0",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 13,
  wordBreak: "break-word",
};

export const config = defineRouteConfig({
  label: "Traffic",
});

export default TrafficPage;
