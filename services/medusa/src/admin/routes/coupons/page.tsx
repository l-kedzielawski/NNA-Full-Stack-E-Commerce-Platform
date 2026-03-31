import { defineRouteConfig } from "@medusajs/admin-sdk";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  campaign_id?: string | null;
  status: string;
  is_automatic: boolean;
  visibility: "public" | "private";
  percentage: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
  cta_href?: string | null;
  company_name?: string | null;
  banner_text_en?: string | null;
  banner_text_pl?: string | null;
};

type CouponActionState = {
  id: string;
  action: "activate" | "deactivate" | "delete";
} | null;

type CouponFormState = {
  code: string;
  percentage: string;
  visibility: "public" | "private";
  starts_at: string;
  ends_at: string;
  cta_href: string;
  company_name: string;
  banner_text_en: string;
  banner_text_pl: string;
};

const initialFormState: CouponFormState = {
  code: "",
  percentage: "10",
  visibility: "public",
  starts_at: "",
  ends_at: "",
  cta_href: "/checkout",
  company_name: "",
  banner_text_en: "",
  banner_text_pl: "",
};

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const theme = {
  pageBg: "linear-gradient(180deg, #0b1020 0%, #0f172a 100%)",
  panelBg: "rgba(15, 23, 42, 0.88)",
  panelBgSoft: "rgba(30, 41, 59, 0.42)",
  border: "#334155",
  borderSoft: "#475569",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#c9a96e",
  accentText: "#0f172a",
  success: "#86efac",
  danger: "#fca5a5",
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function normalizeCodeInput(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9_-]/g, "");
}

const CouponsPage = () => {
  const [items, setItems] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionState, setActionState] = useState<CouponActionState>(null);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visiblePublicCoupons = useMemo(
    () => items.filter((item) => item.visibility === "public"),
    [items],
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/admin/coupon-tools", {
        credentials: "include",
      });
      const payload = (await response.json()) as { coupons?: Coupon[]; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Could not load coupons.");
      }

      setItems(payload.coupons || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setField = <K extends keyof CouponFormState>(field: K, value: CouponFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createCoupon = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/admin/coupon-tools", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: normalizeCodeInput(form.code),
          percentage: Number(form.percentage),
        }),
      });

      const payload = (await response.json()) as { coupon?: Coupon | null; message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Could not create coupon.");
      }

      setMessage(`Coupon ${payload.coupon?.code || ""} created.`.trim());
      setForm((current) => ({
        ...initialFormState,
        visibility: current.visibility,
        cta_href: current.visibility === "public" ? current.cta_href : "/checkout",
      }));
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  const startEditingCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setError(null);
    setMessage(null);
    setForm({
      code: coupon.code,
      percentage: coupon.percentage ? String(coupon.percentage) : "10",
      visibility: coupon.visibility,
      starts_at: toDatetimeLocalValue(coupon.starts_at),
      ends_at: toDatetimeLocalValue(coupon.ends_at),
      cta_href: coupon.cta_href || "/checkout",
      company_name: coupon.company_name || "",
      banner_text_en: coupon.banner_text_en || "",
      banner_text_pl: coupon.banner_text_pl || "",
    });
  };

  const cancelEditing = () => {
    setEditingCouponId(null);
    setForm(initialFormState);
  };

  const saveCouponChanges = async () => {
    if (!editingCouponId) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/admin/coupon-tools/${encodeURIComponent(editingCouponId)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ...form,
          code: normalizeCodeInput(form.code),
          percentage: Number(form.percentage),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message || "Could not update coupon.");
      }

      setMessage(`Coupon ${normalizeCodeInput(form.code)} updated.`);
      setEditingCouponId(null);
      setForm(initialFormState);
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  const runCouponAction = async (coupon: Coupon, action: "activate" | "deactivate" | "delete") => {
    setActionState({ id: coupon.id, action });
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/admin/coupon-tools/${encodeURIComponent(coupon.id)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "delete"
            ? { action: "delete" }
            : { action: "status", status: action === "activate" ? "active" : "draft" },
        ),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message || "Coupon action failed.");
      }

      setMessage(
        action === "delete"
          ? `Coupon ${coupon.code} deleted.`
          : action === "activate"
            ? `Coupon ${coupon.code} activated.`
            : `Coupon ${coupon.code} deactivated.`,
      );
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unexpected error.");
    } finally {
      setActionState(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, color: theme.text, padding: 24 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gap: 20 }}>
        <section
          style={{
            background: theme.panelBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 18px 40px rgba(2, 6, 23, 0.28)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: theme.accent }}>
                Quick Coupon Tools
              </div>
              <h1 style={{ margin: "10px 0 0", fontSize: 30, lineHeight: 1.1 }}>
                {editingCouponId ? "Edit coupon" : "Create public banner and private B2B coupons fast"}
              </h1>
              <p style={{ margin: "12px 0 0", color: theme.muted, maxWidth: 820, lineHeight: 1.6 }}>
                {editingCouponId
                  ? "Update the coupon code, discount, copy, and campaign dates used by the storefront banner and checkout flow."
                  : "This tool creates code-based percentage promotions with the metadata your storefront expects. Public coupons show in the website banner. Private coupons stay hidden but still work in cart and checkout."}
              </p>
            </div>
            <div style={{ minWidth: 220, display: "grid", gap: 8 }}>
              <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 16, padding: 14, background: theme.panelBgSoft }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Public banner coupons</div>
                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>{visiblePublicCoupons.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: theme.panelBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["public", "private"] as const).map((value) => {
                const active = form.visibility === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField("visibility", value)}
                    style={{
                      borderRadius: 999,
                      border: `1px solid ${active ? theme.accent : theme.borderSoft}`,
                      background: active ? theme.accent : "transparent",
                      color: active ? theme.accentText : theme.text,
                      padding: "10px 16px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                    }}
                  >
                    {value === "public" ? "Public banner coupon" : "Private company coupon"}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Coupon code</span>
                <input
                  value={form.code}
                  onChange={(event) => setField("code", normalizeCodeInput(event.target.value))}
                  placeholder="WIOSNA17"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Discount %</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.percentage}
                  onChange={(event) => setField("percentage", event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Starts at</span>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => setField("starts_at", event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Ends at</span>
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => setField("ends_at", event.target.value)}
                  style={inputStyle}
                />
              </label>

              {form.visibility === "public" ? (
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>CTA path</span>
                  <input
                    value={form.cta_href}
                    onChange={(event) => setField("cta_href", event.target.value)}
                    placeholder="/checkout"
                    style={inputStyle}
                  />
                </label>
              ) : (
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Company name</span>
                  <input
                    value={form.company_name}
                    onChange={(event) => setField("company_name", event.target.value)}
                    placeholder="Acme Sp. z o.o."
                    style={inputStyle}
                  />
                </label>
              )}
            </div>

            {form.visibility === "public" ? (
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Banner text EN</span>
                  <input
                    value={form.banner_text_en}
                    onChange={(event) => setField("banner_text_en", event.target.value)}
                    placeholder="Use code WIOSNA17 for 17% off"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: theme.muted }}>Banner text PL</span>
                  <input
                    value={form.banner_text_pl}
                    onChange={(event) => setField("banner_text_pl", event.target.value)}
                    placeholder="Uzyj kodu WIOSNA17 i odbierz 17% rabatu"
                    style={inputStyle}
                  />
                </label>
              </div>
            ) : (
              <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 14, padding: 14, background: theme.panelBgSoft, color: theme.muted }}>
                Private coupons stay hidden from the website banner automatically. They still work in cart and checkout if your B2B client enters the code.
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  void (editingCouponId ? saveCouponChanges() : createCoupon());
                }}
                disabled={saving}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${theme.accent}`,
                  background: theme.accent,
                  color: theme.accentText,
                  fontWeight: 800,
                  padding: "12px 18px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? editingCouponId
                    ? "Saving..."
                    : "Creating..."
                  : editingCouponId
                    ? "Save coupon changes"
                    : `Create ${form.visibility === "public" ? "public" : "private"} coupon`}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingCouponId) {
                    cancelEditing();
                    return;
                  }

                  setForm(initialFormState);
                }}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${theme.borderSoft}`,
                  background: "transparent",
                  color: theme.text,
                  fontWeight: 700,
                  padding: "12px 18px",
                  cursor: "pointer",
                }}
              >
                {editingCouponId ? "Cancel edit" : "Reset form"}
              </button>
              {message ? <span style={{ color: theme.success, fontWeight: 700 }}>{message}</span> : null}
              {error ? <span style={{ color: theme.danger, fontWeight: 700 }}>{error}</span> : null}
            </div>
          </div>
        </section>

        <section
          style={{
            background: theme.panelBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Existing code coupons</h2>
              <p style={{ margin: "8px 0 0", color: theme.muted }}>Quick overview of recent manual coupon codes already stored in Medusa.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void load();
              }}
              style={{
                borderRadius: 999,
                border: `1px solid ${theme.borderSoft}`,
                background: "transparent",
                color: theme.text,
                fontWeight: 700,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
              <thead>
                <tr>
                  {[
                    "Code",
                    "Type",
                    "%",
                    "Status",
                    "Company",
                    "Starts",
                    "Ends",
                    "Created",
                    "Actions",
                  ].map((label) => (
                    <th
                      key={label}
                      style={{
                        textAlign: "left",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: theme.muted,
                        borderBottom: `1px solid ${theme.borderSoft}`,
                        padding: "12px 8px",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}><strong>{item.code}</strong></td>
                    <td style={cellStyle}>{item.visibility === "public" ? "Public banner" : "Private"}</td>
                    <td style={cellStyle}>{item.percentage ?? "-"}%</td>
                    <td style={cellStyle}>{item.status}</td>
                    <td style={cellStyle}>{item.company_name || "-"}</td>
                    <td style={cellStyle}>{formatDate(item.starts_at)}</td>
                    <td style={cellStyle}>{formatDate(item.ends_at)}</td>
                    <td style={cellStyle}>{formatDate(item.created_at)}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => {
                            void runCouponAction(item, item.status === "active" ? "deactivate" : "activate");
                          }}
                          disabled={Boolean(actionState && actionState.id === item.id)}
                          style={{
                            ...actionButtonStyle,
                            borderColor: item.status === "active" ? theme.borderSoft : theme.accent,
                            color: item.status === "active" ? theme.text : theme.accentText,
                            background: item.status === "active" ? "transparent" : theme.accent,
                          }}
                        >
                          {actionState?.id === item.id && actionState.action !== "delete"
                            ? "Working..."
                            : item.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingCoupon(item)}
                          disabled={Boolean(actionState && actionState.id === item.id)}
                          style={{
                            ...actionButtonStyle,
                            borderColor: theme.borderSoft,
                            color: theme.text,
                            background: "transparent",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void runCouponAction(item, "delete");
                          }}
                          disabled={Boolean(actionState && actionState.id === item.id)}
                          style={{
                            ...actionButtonStyle,
                            borderColor: "rgba(252, 165, 165, 0.5)",
                            color: theme.danger,
                            background: "transparent",
                          }}
                        >
                          {actionState?.id === item.id && actionState.action === "delete" ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td style={{ ...cellStyle, color: theme.muted }} colSpan={9}>
                      {loading ? "Loading coupons..." : "No code-based coupons found yet."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  border: `1px solid ${theme.borderSoft}`,
  background: "rgba(2, 6, 23, 0.82)",
  color: theme.text,
  padding: "10px 12px",
  outline: "none",
};

const cellStyle: CSSProperties = {
  padding: "12px 8px",
  borderBottom: `1px solid ${theme.border}`,
  fontSize: 13,
  color: theme.text,
  verticalAlign: "top",
};

const actionButtonStyle: CSSProperties = {
  borderRadius: 999,
  border: `1px solid ${theme.borderSoft}`,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.04em",
  cursor: "pointer",
};

export const config = defineRouteConfig({
  label: "Coupons",
});

export default CouponsPage;
