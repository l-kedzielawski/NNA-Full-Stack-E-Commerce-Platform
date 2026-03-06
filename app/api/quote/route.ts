import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuotePayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  preferredContact?: unknown;
  country?: unknown;
  product?: unknown;
  quantity?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
  locale?: unknown;
};

type StoredQuote = {
  id: string;
  receivedAt: string;
  ip: string;
  userAgent: string;
  payload: {
    name: string;
    company: string;
    email: string;
    phone: string;
    preferredContact: "email" | "phone";
    country: string;
    product: string;
    quantity: string;
    message: string;
    consent: boolean;
  };
};

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per server instance)
// ---------------------------------------------------------------------------

const windowMs = 10 * 60 * 1000; // 10 minutes
const requestLimit = 12;
const ipWindow = new Map<string, number[]>();

function parseIpCandidate(value: string): string {
  const stripped = value
    .trim()
    .replace(/^for=/i, "")
    .replace(/^"|"$/g, "")
    .replace(/^\[|\]$/g, "");

  if (!stripped) {
    return "";
  }

  let candidate = stripped;

  // IPv4 with port, e.g. 203.0.113.4:54321
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.split(":")[0] || "";
  }

  // IPv4 mapped IPv6, e.g. ::ffff:203.0.113.4
  if (candidate.startsWith("::ffff:")) {
    candidate = candidate.slice(7);
  }

  return isIP(candidate) ? candidate : "";
}

function parseForwardedFor(value: string): string {
  // nginx appends remote_addr to the right side of X-Forwarded-For,
  // so using the last valid IP avoids trusting spoofed left-most entries.
  const chain = value
    .split(",")
    .map((part) => parseIpCandidate(part))
    .filter(Boolean);

  return chain.length ? chain[chain.length - 1] : "";
}

function getClientIp(request: Request): string {
  const directHeaders = [
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
  ];

  for (const header of directHeaders) {
    if (!header) {
      continue;
    }

    const parsed = parseIpCandidate(header);
    if (parsed) {
      return parsed;
    }
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parsed = parseForwardedFor(forwardedFor);
    if (parsed) {
      return parsed;
    }
  }

  return "unknown";
}

function getRateLimitKey(request: Request, userAgent: string, rawEmail: unknown): string {
  const ip = getClientIp(request);

  if (ip !== "unknown") {
    return `ip:${ip}`;
  }

  const email = normaliseEmail(rawEmail);
  if (email) {
    return `email:${email}`;
  }

  const ua = sanitize(userAgent, 120).toLowerCase();
  if (ua) {
    return `ua:${ua}`;
  }

  return "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (ipWindow.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (recent.length >= requestLimit) {
    ipWindow.set(key, recent);
    return true;
  }
  recent.push(now);
  ipWindow.set(key, recent);
  return false;
}

// ---------------------------------------------------------------------------
// Sanitization helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags, control characters, and collapse whitespace. */
function sanitize(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \t \n \r)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Strict email normaliser — returns lowercase trimmed or empty string. */
function normaliseEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.toLowerCase().trim().slice(0, 254);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

async function persistQuote(record: StoredQuote): Promise<void> {
  const targetDir = path.join(process.cwd(), "data");
  const targetPath = path.join(targetDir, "quote-requests.jsonl");
  await fs.mkdir(targetDir, { recursive: true });
  await fs.appendFile(targetPath, `${JSON.stringify(record)}\n`, "utf8");
}

function isLocalBackupEnabled(): boolean {
  const configured = process.env.QUOTE_LOCAL_BACKUP_ENABLED;
  if (typeof configured === "string") {
    const normalized = configured.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  return process.env.NODE_ENV !== "production";
}

// ---------------------------------------------------------------------------
// Medusa lead sink
// ---------------------------------------------------------------------------

async function sendLeadToMedusa(record: StoredQuote): Promise<{ id?: string }> {
  const medusaUrl = (
    process.env.MEDUSA_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_URL ||
    ""
  ).replace(/\/$/, "");

  if (!medusaUrl) {
    throw new Error("MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_URL must be configured.");
  }

  const publishableKey =
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    "";

  if (!publishableKey) {
    throw new Error("Missing Medusa publishable key for quote submission.");
  }

  const response = await fetch(`${medusaUrl}/store/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    body: JSON.stringify({
      ...record.payload,
      ip: record.ip,
      userAgent: record.userAgent,
      source: "quote_form",
    }),
  });

  const data = (await response.json().catch(() => null)) as { message?: string; id?: string } | null;

  if (!response.ok) {
    throw new Error(data?.message || `Medusa lead API failed with ${response.status}`);
  }

  return data || {};
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const responseLocale = resolveResponseLocale(request);
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const t = messageCatalog[responseLocale];

  // --- Parse body ---
  let raw: QuotePayload;
  try {
    raw = (await request.json()) as QuotePayload;
  } catch {
    return NextResponse.json({ message: t.invalidRequest }, { status: 400 });
  }

  // --- Honeypot bot check ---
  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return NextResponse.json({ message: t.requestIgnored }, { status: 200 });
  }

  // --- Rate limiting ---
  const rateLimitKey = getRateLimitKey(request, userAgent, raw.email);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { message: t.tooManyRequests },
      { status: 429 },
    );
  }

  // --- Sanitize all string fields ---
  const name = sanitize(raw.name, 120);
  const company = sanitize(raw.company, 140);
  const email = normaliseEmail(raw.email);
  const phone = sanitize(raw.phone, 50);
  const preferredContactRaw = sanitize(raw.preferredContact, 20).toLowerCase();
  const preferredContact: "email" | "phone" = preferredContactRaw === "phone" ? "phone" : "email";
  const country = sanitize(raw.country, 80);
  const product = sanitize(raw.product, 120);
  const quantity = sanitize(raw.quantity, 120);
  const message = sanitize(raw.message, 1800);
  const consent = raw.consent === true;

  const preferredContactLabel =
    preferredContact === "phone"
      ? responseLocale === "pl"
        ? "Telefon"
        : "Phone"
      : "Email";

  const messageWithPreferredContact = `Preferred contact: ${preferredContactLabel}${message ? ` | ${message}` : ""}`;

  // --- Required field validation ---
  const required: Array<[string, string]> = [
    ["name", name],
    ["country", country],
  ];

  for (const [field, value] of required) {
    if (!value) {
      return NextResponse.json(
        { message: responseLocale === "pl" ? `Podaj poprawne pole: ${field}.` : `Please provide a valid ${field}.` },
        { status: 400 },
      );
    }
  }

  // --- Email validation ---
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { message: t.invalidEmail },
      { status: 400 },
    );
  }

  if (preferredContact === "phone" && !phone) {
    return NextResponse.json(
      { message: t.phoneRequiredForPreferredContact },
      { status: 400 },
    );
  }

  // --- Consent ---
  if (!consent) {
    return NextResponse.json(
      { message: t.consentRequired },
      { status: 400 },
    );
  }

  // --- Build record ---
  const quoteRecord: StoredQuote = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ip,
    userAgent,
    payload: {
      name,
      company,
      email,
      phone,
      preferredContact,
      country,
      product,
      quantity,
      message: messageWithPreferredContact,
      consent,
    },
  };

  // --- Send to Medusa lead CRM (primary sink) ---
  let leadId = "";

  try {
    const leadResponse = await sendLeadToMedusa(quoteRecord);
    leadId = leadResponse.id || "";
  } catch (err) {
    console.error("quote_medusa_lead_failed", {
      error: err instanceof Error ? err.message : String(err),
      id: quoteRecord.id,
    });

    return NextResponse.json(
      {
        message: t.submitFailed,
      },
      { status: 502 },
    );
  }

  // --- Local append-only backup (non-blocking) ---
  let stored = false;
  if (isLocalBackupEnabled()) {
    try {
      await persistQuote(quoteRecord);
      stored = true;
    } catch (err) {
      console.error("quote_store_failed", {
        error: err instanceof Error ? err.message : String(err),
        id: quoteRecord.id,
      });
    }
  }

  console.info("quote_received", {
    id: quoteRecord.id,
    timestamp: quoteRecord.receivedAt,
    country: quoteRecord.payload.country,
    product: quoteRecord.payload.product,
    leadId,
    stored,
  });

  return NextResponse.json(
    {
      message: t.success,
      requestId: quoteRecord.id,
      leadId,
    },
    { status: 200 },
  );
}

const messageCatalog: Record<SiteLocale, Record<string, string>> = {
  en: {
    invalidRequest: "Invalid request.",
    requestIgnored: "Request ignored.",
    tooManyRequests: "Too many requests. Please wait a few minutes and try again.",
    invalidEmail: "Please provide a valid email address.",
    phoneRequiredForPreferredContact: "Please provide a phone number if you prefer phone contact.",
    consentRequired: "Please accept the data processing consent before submitting.",
    submitFailed: "We could not submit your quote right now. Please try again in a minute.",
    success: "Thanks. Your request is in. We will contact you shortly.",
  },
  pl: {
    invalidRequest: "Niepoprawne zadanie.",
    requestIgnored: "Zapytanie pominiete.",
    tooManyRequests: "Zbyt wiele prob. Odczekaj kilka minut i sprobuj ponownie.",
    invalidEmail: "Podaj poprawny adres e-mail.",
    phoneRequiredForPreferredContact: "Podaj numer telefonu, jesli preferujesz kontakt telefoniczny.",
    consentRequired: "Zaakceptuj zgode na przetwarzanie danych przed wyslaniem formularza.",
    submitFailed: "Nie udalo sie wyslac zapytania w tej chwili. Sprobuj ponownie za minute.",
    success: "Dziekujemy. Otrzymalismy zapytanie i skontaktujemy sie w najblizszym czasie.",
  },
};

function resolveResponseLocale(request: Request): SiteLocale {
  const localeFromHeader = request.headers.get("x-site-locale") || "";

  if (isSupportedLocale(localeFromHeader)) {
    return localeFromHeader;
  }

  return defaultLocale;
}
