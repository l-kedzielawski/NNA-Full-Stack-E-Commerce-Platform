import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createTrafficHitRecord, getTrafficHitService } from "../../../utils/traffic-hit-service";

type TrafficHitInput = {
  path?: unknown;
  locale?: unknown;
  referrerDomain?: unknown;
  source?: unknown;
};

const BOT_PATTERN =
  /bot|spider|crawl|headless|preview|slurp|bingpreview|facebookexternalhit|discordbot|whatsapp|telegrambot/i;

function sanitize(value: unknown, maxLength = 300): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizePath(value: unknown): string {
  const cleaned = sanitize(value, 400);
  if (!cleaned) {
    return "";
  }

  const noQuery = cleaned.split("?")[0]?.split("#")[0] || "";
  const withSlash = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  const normalized = withSlash.replace(/\/+/g, "/").trim();

  if (!normalized || normalized === "/api" || normalized.startsWith("/api/") || normalized.startsWith("/_next/")) {
    return "";
  }

  return normalized.slice(0, 240);
}

function normalizeLocale(value: unknown): string {
  const locale = sanitize(value, 5).toLowerCase();
  return /^[a-z]{2}(?:-[a-z]{2})?$/.test(locale) ? locale : "";
}

function normalizeReferrerDomain(value: unknown): string {
  const domain = sanitize(value, 160).toLowerCase().replace(/^www\./, "");
  return /^[a-z0-9.-]+$/.test(domain) ? domain : "";
}

function normalizeCountryCode(value: string | undefined): string {
  const code = sanitize(value, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") {
    return "";
  }

  return code;
}

function detectDeviceCategory(userAgent: string): "desktop" | "mobile" | "tablet" | "bot" | "unknown" {
  const ua = userAgent.trim();
  if (!ua) {
    return "unknown";
  }

  if (BOT_PATTERN.test(ua)) {
    return "bot";
  }

  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android|blackberry|phone|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as TrafficHitInput;

  const path = normalizePath(body.path);
  if (!path) {
    return res.status(202).json({ accepted: false });
  }

  const locale = normalizeLocale(body.locale);
  const referrerDomain = normalizeReferrerDomain(body.referrerDomain);
  const source = sanitize(body.source, 40).toLowerCase() || "storefront";
  const userAgent = String(req.headers["user-agent"] || "");
  const deviceCategory = detectDeviceCategory(userAgent);

  if (deviceCategory === "bot") {
    return res.status(202).json({ accepted: false });
  }

  const countryCode = normalizeCountryCode(
    String(req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || req.headers["x-country-code"] || ""),
  );

  const trafficService = getTrafficHitService(req.scope);
  await createTrafficHitRecord(trafficService, {
    path,
    locale: locale || null,
    referrer_domain: referrerDomain || null,
    device_category: deviceCategory,
    country_code: countryCode || null,
    source,
  });

  return res.status(202).json({ accepted: true });
}
