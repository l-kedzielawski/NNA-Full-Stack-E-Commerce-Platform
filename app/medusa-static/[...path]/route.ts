type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function sanitizePath(parts: string[]): string | null {
  if (!parts.length) {
    return null;
  }

  const cleaned = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== "." && part !== ".." && !part.includes("../") && !part.includes("..\\"));

  if (!cleaned.length) {
    return null;
  }

  return cleaned.map(encodeURIComponent).join("/");
}

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const resolved = await params;
  const safePath = sanitizePath(resolved.path || []);

  if (!safePath) {
    return new Response("Not found", { status: 404 });
  }

  const baseUrl = (process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BACKEND_URL || "").replace(
    /\/$/,
    "",
  );

  if (!baseUrl) {
    return new Response("Medusa URL is not configured", { status: 500 });
  }

  const upstream = await fetch(`${baseUrl}/static/${safePath}`, {
    cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const cacheControl = upstream.headers.get("cache-control");
  headers.set("cache-control", cacheControl || "public, max-age=86400");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
