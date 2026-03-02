import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  product: string;
  quantity: string;
  message: string;
  consent: boolean;
  ip: string;
  user_agent: string;
  status: string;
  priority: string;
  assignee: string;
  notes: string;
  source: string;
  created_at?: string;
  updated_at?: string;
};

type LeadStats = {
  total: number;
  counts: Record<string, number>;
  last24h?: number;
  last7d?: number;
  last30d?: number;
  wonRate?: number;
};

const statuses = ["new", "contacted", "qualified", "won", "lost", "spam"] as const;
const priorities = ["low", "normal", "high"] as const;

const theme = {
  pageBg: "linear-gradient(180deg, #0b1020 0%, #0f172a 100%)",
  panelBg: "rgba(15, 23, 42, 0.88)",
  panelBgStrong: "rgba(15, 23, 42, 0.98)",
  panelBgSoft: "rgba(30, 41, 59, 0.42)",
  border: "#334155",
  borderSoft: "#475569",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#c9a96e",
  accentText: "#0f172a",
  danger: "#fca5a5",
  success: "#86efac",
};

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function excerpt(value: string, maxLength = 80): string {
  const cleaned = String(value || "").trim();
  if (!cleaned) {
    return "-";
  }
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength - 1)}…`;
}

const LeadsPage = () => {
  const [items, setItems] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ total: 0, counts: {} });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const activeCount = useMemo(() => items.length, [items.length]);
  const selectedLead = useMemo(
    () => items.find((item) => item.id === selectedLeadId) || null,
    [items, selectedLeadId],
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [listResponse, statsResponse] = await Promise.all([
        fetch(
          `/admin/leads?limit=150&offset=0${
            statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
          }${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`,
          { credentials: "include" },
        ),
        fetch("/admin/leads/stats", { credentials: "include" }),
      ]);

      const listPayload = (await listResponse.json()) as { leads?: Lead[]; message?: string };
      const statsPayload = (await statsResponse.json()) as {
        total?: number;
        counts?: Record<string, number>;
        last24h?: number;
        last7d?: number;
        last30d?: number;
        wonRate?: number;
      };

      if (!listResponse.ok) {
        throw new Error(listPayload.message || "Could not load leads.");
      }

      if (!statsResponse.ok) {
        throw new Error("Could not load lead stats.");
      }

      setItems(listPayload.leads || []);
      setStats({
        total: Number(statsPayload.total || 0),
        counts: statsPayload.counts || {},
        last24h: Number(statsPayload.last24h || 0),
        last7d: Number(statsPayload.last7d || 0),
        last30d: Number(statsPayload.last30d || 0),
        wonRate: Number(statsPayload.wonRate || 0),
      });

      if (!selectedLeadId && listPayload.leads && listPayload.leads.length > 0) {
        setSelectedLeadId(listPayload.leads[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div
      style={{
        padding: 20,
        display: "grid",
        gap: 14,
        color: theme.text,
        background: theme.pageBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        boxShadow: "0 20px 45px rgba(2, 6, 23, 0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>Leads</h1>
          <p style={{ margin: "6px 0 0", color: theme.muted, fontSize: 13 }}>
            Full quote form inbox from storefront with status workflow.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, email, company, product"
            style={{
              minWidth: 280,
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "9px 12px",
              background: theme.panelBgStrong,
              color: "#f8fafc",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={() => void load()}
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.panelBgSoft,
              color: theme.text,
              fontWeight: 600,
            }}
          >
            Apply
          </button>
          <a
            href="/a/leads-analytics"
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              textDecoration: "none",
              background: theme.panelBgSoft,
              color: theme.text,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Analytics
          </a>
          <a
            href="/a/traffic"
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              textDecoration: "none",
              background: theme.panelBgSoft,
              color: theme.text,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Traffic
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
        <StatCard label="Total" value={stats.total} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        {statuses.map((status) => (
          <StatCard
            key={status}
            label={status}
            value={stats.counts[status] || 0}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          />
        ))}
        <StatInfo label="24h" value={stats.last24h || 0} />
        <StatInfo label="7d" value={stats.last7d || 0} />
        <StatInfo label="30d" value={stats.last30d || 0} />
        <StatInfo label="Won %" value={`${(stats.wonRate || 0).toFixed(2)}%`} />
      </div>

      {error ? (
        <p style={{ margin: 0, color: theme.danger, fontSize: 13 }}>{error}</p>
      ) : (
        <p style={{ margin: 0, color: theme.muted, fontSize: 13 }}>
          Showing {activeCount} lead{activeCount === 1 ? "" : "s"}
        </p>
      )}

      <div
        style={{
          overflow: "auto",
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          background: theme.panelBg,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr style={{ background: "rgba(15, 23, 42, 0.98)" }}>
              {[
                "Created",
                "Name",
                "Email",
                "Phone",
                "Country",
                "Product",
                "Message",
                "Status",
                "Priority",
                "Open",
              ].map((head) => (
                <th
                  key={head}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "10px 12px",
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.muted,
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ padding: 16, fontSize: 13, color: theme.muted }}>
                  Loading leads...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: 16, fontSize: 13, color: theme.muted }}>
                  No leads found for current filter.
                </td>
              </tr>
            ) : (
              items.map((lead) => {
                const selected = selectedLeadId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    style={
                      selected
                        ? { background: "rgba(30, 41, 59, 0.8)" }
                        : { background: "rgba(15, 23, 42, 0.38)" }
                    }
                  >
                    <td style={cell}>{formatDate(lead.created_at)}</td>
                    <td style={cell}>{lead.name || "-"}</td>
                    <td style={cell}>{lead.email || "-"}</td>
                    <td style={cell}>{lead.phone || "-"}</td>
                    <td style={cell}>{lead.country || "-"}</td>
                    <td style={{ ...cell, maxWidth: 240 }}>{excerpt(lead.product, 55)}</td>
                    <td style={{ ...cell, maxWidth: 280 }}>{excerpt(lead.message, 90)}</td>
                    <td style={cell}>{lead.status || "new"}</td>
                    <td style={cell}>{lead.priority || "normal"}</td>
                    <td style={cell}>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadId(lead.id)}
                        style={{
                          border: `1px solid ${selected ? theme.accent : theme.borderSoft}`,
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 12,
                          background: selected ? theme.accent : theme.panelBgStrong,
                          color: selected ? theme.accentText : theme.text,
                          fontWeight: 600,
                        }}
                      >
                        {selected ? "Opened" : "Open"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedLead ? (
        <LeadDetails lead={selectedLead} onUpdated={load} />
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>
          Select a lead to view full details and update status.
        </p>
      )}
    </div>
  );
};

const LeadDetails = ({ lead, onUpdated }: { lead: Lead; onUpdated: () => Promise<void> }) => {
  const [status, setStatus] = useState(lead.status || "new");
  const [priority, setPriority] = useState(lead.priority || "normal");
  const [assignee, setAssignee] = useState(lead.assignee || "");
  const [notes, setNotes] = useState(lead.notes || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(lead.status || "new");
    setPriority(lead.priority || "normal");
    setAssignee(lead.assignee || "");
    setNotes(lead.notes || "");
    setMessage(null);
  }, [lead.id, lead.status, lead.priority, lead.assignee, lead.notes]);

  const save = async () => {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, priority, assignee, notes }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Could not update lead.");
      }

      await onUpdated();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update lead.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 16,
        display: "grid",
        gap: 14,
        background: theme.panelBg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#f8fafc" }}>Lead Detail</h2>
          <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: 12 }}>
            ID: {lead.id}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          style={{
            border: `1px solid ${theme.accent}`,
            background: theme.accent,
            color: theme.accentText,
            borderRadius: 10,
            padding: "8px 12px",
            minWidth: 110,
            opacity: pending ? 0.7 : 1,
            fontWeight: 700,
          }}
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        <InfoCard label="Created" value={formatDate(lead.created_at)} />
        <InfoCard label="Updated" value={formatDate(lead.updated_at)} />
        <InfoCard label="Name" value={lead.name || "-"} />
        <InfoCard label="Company" value={lead.company || "-"} />
        <InfoCard label="Email" value={lead.email || "-"} />
        <InfoCard label="Phone" value={lead.phone || "-"} />
        <InfoCard label="Country" value={lead.country || "-"} />
        <InfoCard label="Product" value={lead.product || "-"} />
        <InfoCard label="Quantity" value={lead.quantity || "-"} />
        <InfoCard label="Consent" value={lead.consent ? "Yes" : "No"} />
        <InfoCard label="Source" value={lead.source || "quote_form"} />
        <InfoCard label="IP" value={lead.ip || "-"} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={labelStyle}>User Agent</label>
        <div style={readonlyStyle}>{lead.user_agent || "-"}</div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={labelStyle}>Message</label>
        <div style={readonlyStyle}>{lead.message || "-"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={inputStyle}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Priority</label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            style={inputStyle}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Assignee</label>
          <input
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            placeholder="Owner or team"
            style={inputStyle}
            maxLength={120}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={labelStyle}>Internal Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Follow-up notes"
          maxLength={5000}
        />
      </div>

      {message ? (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: message === "Saved." ? theme.success : theme.danger,
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
};

const cell: CSSProperties = {
  padding: "10px 12px",
  borderBottom: `1px solid ${theme.border}`,
  fontSize: 13,
  verticalAlign: "top",
  color: theme.text,
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: theme.muted,
};

const inputStyle: CSSProperties = {
  border: `1px solid ${theme.borderSoft}`,
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 13,
  background: "rgba(15, 23, 42, 0.98)",
  color: "#f8fafc",
};

const readonlyStyle: CSSProperties = {
  border: `1px solid ${theme.borderSoft}`,
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13,
  background: "rgba(15, 23, 42, 0.98)",
  color: theme.text,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const StatCard = ({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        border: `1px solid ${active ? theme.accent : theme.borderSoft}`,
        background: active ? theme.accent : "rgba(15, 23, 42, 0.82)",
        color: active ? theme.accentText : theme.text,
        borderRadius: 12,
        padding: "11px 12px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: active ? "rgba(15, 23, 42, 0.75)" : theme.muted,
        }}
      >
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700 }}>{value}</p>
    </button>
  );
};

const StatInfo = ({ label, value }: { label: string; value: number | string }) => {
  return (
    <div
      style={{
        textAlign: "left",
        border: `1px solid ${theme.borderSoft}`,
        borderRadius: 12,
        padding: "11px 12px",
        background: "rgba(15, 23, 42, 0.82)",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: theme.muted }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>{value}</p>
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div
      style={{
        border: `1px solid ${theme.borderSoft}`,
        borderRadius: 10,
        padding: "10px 12px",
        background: "rgba(15, 23, 42, 0.98)",
      }}
    >
      <p style={labelStyle}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 13, wordBreak: "break-word", color: theme.text }}>
        {value}
      </p>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Leads",
  // top-level route at /a/leads in Medusa admin
});

export default LeadsPage;
