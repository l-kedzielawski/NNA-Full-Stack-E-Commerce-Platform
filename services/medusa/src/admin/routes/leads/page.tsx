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
  payment_link_url: string;
  payment_link_session_id: string;
  payment_link_expires_at?: string;
  payment_status: string;
  payment_amount?: number | null;
  payment_currency: string;
  payment_created_at?: string;
  payment_paid_at?: string;
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

type CatalogVariant = {
  id: string;
  title: string;
  sku: string;
  product_id: string;
  product_title: string;
};

type SpecialOrderLine = {
  id: string;
  variant_id: string;
  quantity: string;
  unit_price: string;
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

function formatPaymentAmount(amountMinor?: number | null, currencyCode?: string): string {
  if (!Number.isFinite(amountMinor)) {
    return "-";
  }

  const amount = Number(amountMinor);
  const currency = String(currencyCode || "").trim().toUpperCase() || "EUR";
  const zeroDecimalCurrencies = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ]);
  const divisor = zeroDecimalCurrencies.has(currency) ? 1 : 100;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: divisor === 1 ? 0 : 2,
  }).format(amount / divisor);
}

function parseDecimalInput(value: string): number {
  const parsed = Number(String(value || "").replace(",", ".").trim());
  if (!Number.isFinite(parsed)) {
    return NaN;
  }

  return parsed;
}

function formatMajorAmount(amountMajor: number, currencyCode?: string): string {
  if (!Number.isFinite(amountMajor)) {
    return "-";
  }

  const currency = String(currencyCode || "").trim().toUpperCase() || "EUR";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMajor);
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
  const [showCreateLeadForm, setShowCreateLeadForm] = useState(false);
  const [createLeadPending, setCreateLeadPending] = useState(false);
  const [createLeadMessage, setCreateLeadMessage] = useState<string | null>(null);
  const [createLeadForm, setCreateLeadForm] = useState({
    name: "",
    email: "",
    country: "",
    company: "",
    phone: "",
    product: "",
    quantity: "",
    message: "",
    consent: false,
  });

  const activeCount = useMemo(() => items.length, [items.length]);
  const selectedLead = useMemo(
    () => items.find((item) => item.id === selectedLeadId) || null,
    [items, selectedLeadId],
  );

  const load = async (preferredLeadId?: string) => {
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

      if (preferredLeadId) {
        const match = (listPayload.leads || []).find((entry) => entry.id === preferredLeadId);
        if (match) {
          setSelectedLeadId(match.id);
        }
      } else if (!selectedLeadId && listPayload.leads && listPayload.leads.length > 0) {
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

  const createLead = async () => {
    setCreateLeadPending(true);
    setCreateLeadMessage(null);

    try {
      const response = await fetch("/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createLeadForm),
      });

      const payload = (await response.json().catch(() => null)) as
        | { lead?: Lead; message?: string }
        | null;

      if (!response.ok || !payload?.lead?.id) {
        throw new Error(payload?.message || "Could not create lead.");
      }

      setCreateLeadForm({
        name: "",
        email: "",
        country: "",
        company: "",
        phone: "",
        product: "",
        quantity: "",
        message: "",
        consent: false,
      });
      setCreateLeadMessage("Lead created.");
      setShowCreateLeadForm(false);
      await load(payload.lead.id);
    } catch (err) {
      setCreateLeadMessage(err instanceof Error ? err.message : "Could not create lead.");
    } finally {
      setCreateLeadPending(false);
    }
  };

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
          <button
            type="button"
            onClick={() => {
              setShowCreateLeadForm((previous) => !previous);
              setCreateLeadMessage(null);
            }}
            style={{
              border: `1px solid ${theme.accent}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: showCreateLeadForm ? theme.accent : theme.panelBgSoft,
              color: showCreateLeadForm ? theme.accentText : theme.text,
              fontWeight: 700,
            }}
          >
            {showCreateLeadForm ? "Close New Lead" : "Add Lead"}
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

      {showCreateLeadForm ? (
        <div
          style={{
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 14,
            background: theme.panelBg,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "#f8fafc" }}>Create Lead</h2>
            <p style={{ margin: 0, color: theme.muted, fontSize: 12 }}>
              Add a client manually when they came from phone, email, or messaging apps.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Name *</label>
              <input
                value={createLeadForm.name}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Client name"
                style={inputStyle}
                maxLength={120}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Email *</label>
              <input
                value={createLeadForm.email}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="client@example.com"
                style={inputStyle}
                maxLength={254}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Country *</label>
              <input
                value={createLeadForm.country}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, country: event.target.value }))}
                placeholder="Poland"
                style={inputStyle}
                maxLength={80}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Company</label>
              <input
                value={createLeadForm.company}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, company: event.target.value }))}
                placeholder="Optional"
                style={inputStyle}
                maxLength={140}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Phone</label>
              <input
                value={createLeadForm.phone}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Optional"
                style={inputStyle}
                maxLength={60}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Product</label>
              <input
                value={createLeadForm.product}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, product: event.target.value }))}
                placeholder="Optional"
                style={inputStyle}
                maxLength={160}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Quantity</label>
              <input
                value={createLeadForm.quantity}
                onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, quantity: event.target.value }))}
                placeholder="Optional"
                style={inputStyle}
                maxLength={120}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={createLeadForm.message}
              onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, message: event.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Optional context from call or chat"
              maxLength={2000}
            />
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: theme.text }}>
            <input
              type="checkbox"
              checked={createLeadForm.consent}
              onChange={(event) => setCreateLeadForm((prev) => ({ ...prev, consent: event.target.checked }))}
            />
            Consent captured from client
          </label>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => void createLead()}
              disabled={createLeadPending}
              style={{
                border: `1px solid ${theme.accent}`,
                borderRadius: 10,
                padding: "8px 12px",
                background: theme.accent,
                color: theme.accentText,
                fontWeight: 700,
                opacity: createLeadPending ? 0.7 : 1,
              }}
            >
              {createLeadPending ? "Creating..." : "Create Lead"}
            </button>
            {createLeadMessage ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: createLeadMessage === "Lead created." ? theme.success : theme.danger,
                  alignSelf: "center",
                }}
              >
                {createLeadMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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

const LeadDetails = ({
  lead,
  onUpdated,
}: {
  lead: Lead;
  onUpdated: (preferredLeadId?: string) => Promise<void>;
}) => {
  const [status, setStatus] = useState(lead.status || "new");
  const [priority, setPriority] = useState(lead.priority || "normal");
  const [assignee, setAssignee] = useState(lead.assignee || "");
  const [notes, setNotes] = useState(lead.notes || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState(
    String(lead.payment_currency || "eur").toUpperCase() || "EUR",
  );
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentExpiresInHours, setPaymentExpiresInHours] = useState("24");
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentStatusPending, setPaymentStatusPending] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogVariants, setCatalogVariants] = useState<CatalogVariant[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState<string | null>(null);
  const [specialOrderLines, setSpecialOrderLines] = useState<SpecialOrderLine[]>([
    { id: "line-1", variant_id: "", quantity: "1", unit_price: "" },
  ]);
  const [specialOrderPending, setSpecialOrderPending] = useState(false);

  useEffect(() => {
    setStatus(lead.status || "new");
    setPriority(lead.priority || "normal");
    setAssignee(lead.assignee || "");
    setNotes(lead.notes || "");
    setMessage(null);
    setPaymentCurrency(String(lead.payment_currency || "eur").toUpperCase() || "EUR");
    setPaymentDescription(lead.product ? `Payment for ${lead.product}` : `Payment request for ${lead.name || "client"}`);
    setPaymentMessage(null);
    setCatalogQuery("");
    setCatalogMessage(null);
    setSpecialOrderLines([{ id: "line-1", variant_id: "", quantity: "1", unit_price: "" }]);
  }, [
    lead.id,
    lead.status,
    lead.priority,
    lead.assignee,
    lead.notes,
    lead.payment_currency,
    lead.product,
    lead.name,
  ]);

  const loadCatalogVariants = async (query?: string) => {
    setCatalogLoading(true);
    setCatalogMessage(null);

    try {
      const response = await fetch(
        `/admin/leads/catalog-variants?limit=300${query ? `&q=${encodeURIComponent(query)}` : ""}`,
        {
          credentials: "include",
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | { variants?: CatalogVariant[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not load catalog products.");
      }

      setCatalogVariants(Array.isArray(payload?.variants) ? payload.variants : []);
      if (!payload?.variants?.length) {
        setCatalogMessage("No catalog variants found for this search.");
      }
    } catch (err) {
      setCatalogMessage(err instanceof Error ? err.message : "Could not load catalog products.");
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

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

  const createPaymentLink = async () => {
    setPaymentPending(true);
    setPaymentMessage(null);

    try {
      const response = await fetch(`/admin/leads/${lead.id}/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: paymentAmount,
          currency: paymentCurrency,
          description: paymentDescription,
          expiresInHours: paymentExpiresInHours,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { checkout_url?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not create payment link.");
      }

      await onUpdated(lead.id);
      setPaymentMessage(payload?.checkout_url ? "Payment link created." : "Payment link created, but URL was not returned.");
    } catch (err) {
      setPaymentMessage(err instanceof Error ? err.message : "Could not create payment link.");
    } finally {
      setPaymentPending(false);
    }
  };

  const refreshPaymentStatus = async () => {
    setPaymentStatusPending(true);
    setPaymentMessage(null);

    try {
      const response = await fetch(`/admin/leads/${lead.id}/payment-link`, {
        method: "GET",
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as
        | { payment_status?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not refresh payment status.");
      }

      await onUpdated(lead.id);
      setPaymentMessage(
        payload?.payment_status
          ? `Payment status refreshed: ${payload.payment_status}.`
          : "Payment status refreshed.",
      );
    } catch (err) {
      setPaymentMessage(err instanceof Error ? err.message : "Could not refresh payment status.");
    } finally {
      setPaymentStatusPending(false);
    }
  };

  const copyPaymentUrl = async () => {
    if (!lead.payment_link_url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(lead.payment_link_url);
      setPaymentMessage("Payment link copied.");
    } catch {
      setPaymentMessage("Could not copy automatically. Copy the URL manually.");
    }
  };

  const updateSpecialOrderLine = (lineId: string, patch: Partial<SpecialOrderLine>) => {
    setSpecialOrderLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const addSpecialOrderLine = () => {
    const id = `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSpecialOrderLines((current) => [...current, { id, variant_id: "", quantity: "1", unit_price: "" }]);
  };

  const removeSpecialOrderLine = (lineId: string) => {
    setSpecialOrderLines((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((line) => line.id !== lineId);
    });
  };

  const createSpecialOrderPaymentLink = async () => {
    setSpecialOrderPending(true);
    setPaymentMessage(null);

    const lines = specialOrderLines
      .map((line) => ({
        variant_id: line.variant_id,
        quantity: line.quantity,
        unit_price: line.unit_price,
      }))
      .filter((line) => line.variant_id && String(line.quantity).trim() && String(line.unit_price).trim());

    if (!lines.length) {
      setPaymentMessage("Select at least one catalog product and enter quantity + custom price.");
      setSpecialOrderPending(false);
      return;
    }

    try {
      const response = await fetch(`/admin/leads/${lead.id}/special-order-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currency: paymentCurrency,
          expiresInHours: paymentExpiresInHours,
          lines,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { checkout_url?: string; message?: string; line_count?: number }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not create special-order payment link.");
      }

      await onUpdated(lead.id);
      setPaymentMessage(
        payload?.checkout_url
          ? `Special-order link created with ${payload?.line_count || lines.length} line item(s).`
          : "Special-order link created, but URL was not returned.",
      );
    } catch (err) {
      setPaymentMessage(err instanceof Error ? err.message : "Could not create special-order payment link.");
    } finally {
      setSpecialOrderPending(false);
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
        <InfoCard label="Payment Status" value={lead.payment_status || "-"} />
        <InfoCard label="Payment Amount" value={formatPaymentAmount(lead.payment_amount, lead.payment_currency)} />
        <InfoCard label="Payment Currency" value={(lead.payment_currency || "-").toUpperCase()} />
        <InfoCard label="Paid At" value={formatDate(lead.payment_paid_at)} />
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

      <div
        style={{
          border: `1px solid ${theme.borderSoft}`,
          borderRadius: 12,
          padding: 12,
          display: "grid",
          gap: 10,
          background: "rgba(15, 23, 42, 0.82)",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <p style={{ ...labelStyle, margin: 0 }}>Custom Stripe Checkout</p>
          <p style={{ margin: 0, fontSize: 12, color: theme.muted }}>
            Generate a custom amount checkout link for this lead and refresh payment status any time.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Amount *</label>
            <input
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="120.00"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Currency *</label>
            <input
              value={paymentCurrency}
              onChange={(event) => setPaymentCurrency(event.target.value.toUpperCase().slice(0, 3))}
              placeholder="EUR"
              style={inputStyle}
              maxLength={3}
            />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Expires (hours)</label>
            <input
              value={paymentExpiresInHours}
              onChange={(event) => setPaymentExpiresInHours(event.target.value)}
              placeholder="24"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Description</label>
          <input
            value={paymentDescription}
            onChange={(event) => setPaymentDescription(event.target.value)}
            placeholder="Payment for custom order"
            style={inputStyle}
            maxLength={180}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={() => void createPaymentLink()}
            disabled={paymentPending}
            style={{
              border: `1px solid ${theme.accent}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.accent,
              color: theme.accentText,
              fontWeight: 700,
              opacity: paymentPending ? 0.7 : 1,
            }}
          >
            {paymentPending ? "Creating link..." : "Create Checkout Link"}
          </button>
          <button
            type="button"
            onClick={() => void refreshPaymentStatus()}
            disabled={paymentStatusPending}
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.panelBgSoft,
              color: theme.text,
              fontWeight: 600,
              opacity: paymentStatusPending ? 0.7 : 1,
            }}
          >
            {paymentStatusPending ? "Refreshing..." : "Refresh Payment Status"}
          </button>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Current Checkout URL</label>
          <div style={readonlyStyle}>{lead.payment_link_url || "No payment link created yet."}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() => void copyPaymentUrl()}
              disabled={!lead.payment_link_url}
              style={{
                border: `1px solid ${theme.borderSoft}`,
                borderRadius: 10,
                padding: "8px 12px",
                background: theme.panelBgSoft,
                color: theme.text,
                fontWeight: 600,
                opacity: lead.payment_link_url ? 1 : 0.6,
              }}
            >
              Copy Link
            </button>
            <InfoChip label="Session" value={lead.payment_link_session_id || "-"} />
            <InfoChip label="Expires" value={formatDate(lead.payment_link_expires_at)} />
          </div>
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${theme.borderSoft}`,
          borderRadius: 12,
          padding: 12,
          display: "grid",
          gap: 10,
          background: "rgba(15, 23, 42, 0.82)",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <p style={{ ...labelStyle, margin: 0 }}>Special Order Builder (Catalog + Custom Pricing)</p>
          <p style={{ margin: 0, fontSize: 12, color: theme.muted }}>
            Choose products from your store catalog, set your own unit prices, and generate a Stripe checkout link.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) auto", gap: 8 }}>
          <input
            value={catalogQuery}
            onChange={(event) => setCatalogQuery(event.target.value)}
            placeholder="Search by product, variant, or SKU"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => void loadCatalogVariants(catalogQuery)}
            disabled={catalogLoading}
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.panelBgSoft,
              color: theme.text,
              fontWeight: 600,
              opacity: catalogLoading ? 0.7 : 1,
            }}
          >
            {catalogLoading ? "Loading..." : "Search Catalog"}
          </button>
        </div>

        {catalogMessage ? <p style={{ margin: 0, fontSize: 12, color: theme.muted }}>{catalogMessage}</p> : null}

        <div style={{ display: "grid", gap: 8 }}>
          {specialOrderLines.map((line, index) => {
            const quantity = Math.max(1, Math.round(Number(line.quantity) || 1));
            const unitPrice = parseDecimalInput(line.unit_price);
            const lineTotal = Number.isFinite(unitPrice) ? quantity * unitPrice : NaN;

            return (
              <div
                key={line.id}
                style={{
                  border: `1px solid ${theme.borderSoft}`,
                  borderRadius: 10,
                  padding: 10,
                  display: "grid",
                  gap: 8,
                  background: "rgba(15, 23, 42, 0.98)",
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={labelStyle}>Product Variant #{index + 1}</label>
                  <select
                    value={line.variant_id}
                    onChange={(event) => updateSpecialOrderLine(line.id, { variant_id: event.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select a catalog variant</option>
                    {catalogVariants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.product_title}
                        {variant.title && variant.title.toLowerCase() !== "default" ? ` - ${variant.title}` : ""}
                        {variant.sku ? ` [${variant.sku}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Quantity *</label>
                    <input
                      value={line.quantity}
                      onChange={(event) => updateSpecialOrderLine(line.id, { quantity: event.target.value })}
                      placeholder="1"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Unit Price ({paymentCurrency}) *</label>
                    <input
                      value={line.unit_price}
                      onChange={(event) => updateSpecialOrderLine(line.id, { unit_price: event.target.value })}
                      placeholder="49.90"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Line Total</label>
                    <div style={readonlyStyle}>{formatMajorAmount(lineTotal, paymentCurrency)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => removeSpecialOrderLine(line.id)}
                    disabled={specialOrderLines.length <= 1}
                    style={{
                      border: `1px solid ${theme.borderSoft}`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      background: theme.panelBgSoft,
                      color: theme.text,
                      fontSize: 12,
                      opacity: specialOrderLines.length <= 1 ? 0.6 : 1,
                    }}
                  >
                    Remove Line
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={addSpecialOrderLine}
            style={{
              border: `1px solid ${theme.borderSoft}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.panelBgSoft,
              color: theme.text,
              fontWeight: 600,
            }}
          >
            Add Product Line
          </button>
          <button
            type="button"
            onClick={() => void createSpecialOrderPaymentLink()}
            disabled={specialOrderPending}
            style={{
              border: `1px solid ${theme.accent}`,
              borderRadius: 10,
              padding: "8px 12px",
              background: theme.accent,
              color: theme.accentText,
              fontWeight: 700,
              opacity: specialOrderPending ? 0.7 : 1,
            }}
          >
            {specialOrderPending ? "Creating special link..." : "Create Special-Order Checkout Link"}
          </button>
        </div>
      </div>

      {message || paymentMessage ? (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: /could not|invalid|required|outside|missing|must/i.test(message || paymentMessage || "")
              ? theme.danger
              : theme.success,
          }}
        >
          {message || paymentMessage}
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

const InfoChip = ({ label, value }: { label: string; value: string }) => {
  return (
    <div
      style={{
        border: `1px solid ${theme.borderSoft}`,
        borderRadius: 10,
        padding: "8px 10px",
        background: "rgba(15, 23, 42, 0.98)",
        display: "grid",
        gap: 2,
      }}
    >
      <p style={{ ...labelStyle, margin: 0 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 12, color: theme.text }}>{value}</p>
    </div>
  );
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
