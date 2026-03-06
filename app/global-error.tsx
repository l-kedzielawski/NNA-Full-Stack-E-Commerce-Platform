"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname } from "@/lib/i18n";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0906",
          color: "#f5f0e8",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "420px", padding: "2rem" }}>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c9a96e",
              marginBottom: "1rem",
            }}
          >
            {locale === "pl" ? "Krytyczny blad" : "Critical Error"}
          </p>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              lineHeight: 1,
              marginBottom: "1rem",
            }}
          >
            {locale === "pl" ? "Cos poszlo nie tak" : "Something Went Wrong"}
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(245, 240, 232, 0.55)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            {locale === "pl"
              ? "Wystapil nieoczekiwany blad. Odswiez strone i sprobuj ponownie."
              : "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.875rem 2rem",
              borderRadius: "9999px",
              backgroundColor: "#c9a96e",
              color: "#0a0906",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            {locale === "pl" ? "Sprobuj ponownie" : "Try Again"}
          </button>
        </div>
      </body>
    </html>
  );
}
