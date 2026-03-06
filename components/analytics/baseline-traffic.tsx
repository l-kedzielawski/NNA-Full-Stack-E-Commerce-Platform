"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname, stripLocaleFromPathname } from "@/lib/i18n";

const ENDPOINT = "/api/medusa/store/traffic/hit";
const DEDUPE_WINDOW_MS = 1200;

function normalizePath(pathname: string): string {
  const clean = stripLocaleFromPathname(pathname || "/");
  const noQuery = clean.split("?")[0]?.split("#")[0] || "/";
  const normalized = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  return normalized.replace(/\/+/g, "/").slice(0, 240) || "/";
}

function resolveReferrerDomain(): string {
  if (typeof document === "undefined" || !document.referrer) {
    return "";
  }

  try {
    const domain = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, "");
    return domain.slice(0, 160);
  } catch {
    return "";
  }
}

function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    navigator.doNotTrack === "1" ||
    navigator.doNotTrack === "yes" ||
    (window as unknown as { doNotTrack?: string }).doNotTrack === "1"
  );
}

export function BaselineTraffic() {
  const pathname = usePathname() || "/";
  const lastSentRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isDoNotTrackEnabled()) {
      return;
    }

    const locale = getLocaleFromPathname(pathname) || defaultLocale;
    const path = normalizePath(pathname);
    const referrerDomain = resolveReferrerDomain();
    const payload = {
      path,
      locale,
      referrerDomain,
      source: "storefront",
    };

    const key = `${payload.path}|${payload.locale}|${payload.referrerDomain}`;
    const now = Date.now();
    const previous = lastSentRef.current;

    if (previous && previous.key === key && now - previous.at < DEDUPE_WINDOW_MS) {
      return;
    }

    lastSentRef.current = { key, at: now };

    const body = JSON.stringify(payload);
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) {
        return;
      }
    }

    void fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
      credentials: "omit",
      cache: "no-store",
    }).catch(() => {
      // intentionally no-op
    });
  }, [pathname]);

  return null;
}
