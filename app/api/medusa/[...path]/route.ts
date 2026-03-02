/**
 * Medusa store API proxy
 *
 * All browser-side cart/store requests go to /api/medusa/... and are forwarded
 * server-side to the real Medusa backend. This means:
 *  - No CORS issues (request never leaves the Next.js origin from the browser's perspective)
 *  - The Medusa URL and publishable key stay server-only (not exposed in the browser bundle)
 *  - Works identically in dev (localhost:9000) and production (Docker internal http://medusa:9000)
 *
 * Only /store/* routes are forwarded. Admin routes are not proxied here —
 * the Medusa admin dashboard is accessed directly via its own subdomain.
 */

import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

function getMedusaBase(): string {
  const url = process.env.MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;
  if (!url) {
    throw new Error("MEDUSA_URL is not set. Add it to .env.local (dev) or the container environment (prod).");
  }
  return url.replace(/\/$/, "");
}

function getPublishableKey(): string {
  // Server-only key preferred; fall back to public key for backwards compat
  return process.env.MEDUSA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
}

// Headers we strip before forwarding to Medusa (Next.js / host-specific)
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

function parseIp(value: string): string {
  const candidate = value
    .trim()
    .replace(/^for=/i, "")
    .replace(/^"|"$/g, "")
    .replace(/^\[|\]$/g, "")
    .replace(/^::ffff:/, "");

  return isIP(candidate) ? candidate : "";
}

function getTrustedClientIp(req: NextRequest): string {
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    const parsed = parseIp(xRealIp.split(",")[0] || "");
    if (parsed) {
      return parsed;
    }
  }

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const chain = xForwardedFor
      .split(",")
      .map((part) => parseIp(part))
      .filter(Boolean);
    if (chain.length) {
      return chain[chain.length - 1];
    }
  }

  return "";
}

async function proxyRequest(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const cleanedPath = pathSegments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => segment !== "." && segment !== ".." && !segment.includes("/") && !segment.includes("\\"));

  if (!cleanedPath.length || cleanedPath[0] !== "store") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const base = getMedusaBase();
  const key = getPublishableKey();

  // Reconstruct the upstream path, e.g. ["store","carts"] -> /store/carts
  const upstreamPath = "/" + cleanedPath.map((segment) => encodeURIComponent(segment)).join("/");

  // Forward query string
  const search = req.nextUrl.search;
  const upstreamUrl = `${base}${upstreamPath}${search}`;

  // Build forwarded headers — strip hop-by-hop and inject the publishable key
  const forwardHeaders = new Headers();
  for (const [key, value] of req.headers.entries()) {
    const header = key.toLowerCase();
    if (!HOP_BY_HOP.has(header) && header !== "x-forwarded-for" && header !== "x-real-ip") {
      forwardHeaders.set(key, value);
    }
  }
  if (key) {
    forwardHeaders.set("x-publishable-api-key", key);
  }

  // Tell Medusa the real client IP from trusted reverse proxy headers
  const clientIp = getTrustedClientIp(req);
  if (clientIp) {
    forwardHeaders.set("x-forwarded-for", clientIp);
  }

  // Read body for mutating methods
  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ?? undefined,
      // Never cache proxy responses — let Medusa / Next.js handle caching separately
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed";
    return NextResponse.json({ type: "proxy_error", message }, { status: 502 });
  }

  // Forward the response body and relevant headers back to the browser
  const responseHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    // Strip hop-by-hop and content-encoding (fetch already decompresses)
    if (!HOP_BY_HOP.has(k.toLowerCase()) && k.toLowerCase() !== "content-encoding") {
      responseHeaders.set(k, v);
    }
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}
