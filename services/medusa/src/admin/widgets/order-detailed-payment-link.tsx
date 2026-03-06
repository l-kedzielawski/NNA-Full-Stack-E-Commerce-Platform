import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps } from "@medusajs/types";
import { useMemo, useState } from "react";

type OrderLite = {
  id?: string;
  display_id?: string | number;
  email?: string | null;
  currency_code?: string;
  total?: number;
};

type PaymentLinkPayload = {
  checkout_url?: string;
  checkout_session_id?: string;
  expires_at?: number;
  currency?: string;
  order_total?: number;
  line_count?: number;
  message?: string;
};

function formatMoney(amount: number | undefined, currencyCode?: string): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "-";
  }

  const currency = String(currencyCode || "EUR").toUpperCase();
  const locale = currency === "PLN" ? "pl-PL" : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

const OrderDetailedPaymentLinkWidget = ({ data }: DetailWidgetProps<OrderLite>) => {
  const orderId = String(data?.id || "").trim();
  const displayId = String(data?.display_id || "").trim();
  const currency = String(data?.currency_code || "eur").toUpperCase();
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [payload, setPayload] = useState<PaymentLinkPayload | null>(null);

  const expiresAtLabel = useMemo(() => {
    if (!payload?.expires_at) {
      return "-";
    }

    return new Date(payload.expires_at * 1000).toLocaleString();
  }, [payload?.expires_at]);

  const copyLink = async () => {
    if (!payload?.checkout_url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload.checkout_url);
      setStatus("Link copied.");
      setError(null);
    } catch {
      setError("Could not copy link automatically.");
    }
  };

  const createLink = async () => {
    if (!orderId) {
      setError("Order ID is missing.");
      return;
    }

    setPending(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/admin/orders/${orderId}/detailed-payment-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          expiresInHours,
        }),
      });

      const nextPayload = (await response.json().catch(() => null)) as PaymentLinkPayload | null;
      if (!response.ok || !nextPayload?.checkout_url) {
        throw new Error(nextPayload?.message || "Could not create Stripe payment link.");
      }

      setPayload(nextPayload);
      setStatus("Stripe checkout link created with full order breakdown.");
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : "Could not create payment link.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 10,
        background: "#fff",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Stripe Payment Link (Detailed Order)</h2>
        <p style={{ margin: 0, fontSize: 12, color: "#4b5563" }}>
          Creates a Stripe Checkout link with full order line items (product names + item totals).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
        <Info label="Order" value={displayId ? `#${displayId}` : orderId} />
        <Info label="Current Total" value={formatMoney(data?.total, currency)} />
        <Info label="Currency" value={currency} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 8 }}>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={{ fontSize: 12, color: "#374151" }}>Expires in hours</span>
          <input
            value={expiresInHours}
            onChange={(event) => setExpiresInHours(event.target.value)}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "7px 10px", fontSize: 13 }}
            placeholder="24"
          />
        </label>

        <button
          type="button"
          onClick={() => void createLink()}
          disabled={pending}
          style={{
            border: "1px solid #111827",
            background: "#111827",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
            opacity: pending ? 0.75 : 1,
          }}
        >
          {pending ? "Creating..." : "Create Stripe Link"}
        </button>

        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={!payload?.checkout_url}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#111827",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            opacity: payload?.checkout_url ? 1 : 0.65,
          }}
        >
          Copy Link
        </button>
      </div>

      {payload?.checkout_url ? (
        <div style={{ display: "grid", gap: 6 }}>
          <Info label="Stripe URL" value={payload.checkout_url} mono />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
            <Info label="Session ID" value={payload.checkout_session_id || "-"} mono />
            <Info label="Expires" value={expiresAtLabel} />
            <Info label="Line Items" value={String(payload.line_count || 0)} />
            <Info label="Link Total" value={formatMoney(payload.order_total, payload.currency || currency)} />
          </div>
        </div>
      ) : null}

      {status ? <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>{status}</p> : null}
      {error ? <p style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}>{error}</p> : null}
    </div>
  );
};

const Info = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", display: "grid", gap: 3 }}>
      <p style={{ margin: 0, fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "#111827",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" : undefined,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after",
});

export default OrderDetailedPaymentLinkWidget;
