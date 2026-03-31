import { PublicPromotionBanner } from "@/lib/promotion-banner";

function getMedusaBaseCandidates(): string[] {
  const devPrimary = (process.env.MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || "").trim();
  if (process.env.NODE_ENV === "development" && devPrimary) {
    return [devPrimary.replace(/\/$/, "")];
  }

  const candidates = [
    process.env.MEDUSA_URL,
    process.env.NEXT_PUBLIC_MEDUSA_URL,
    process.env.MEDUSA_BACKEND_URL,
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  ]
    .map((value) => (value || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

  return Array.from(new Set(candidates));
}

function getPublishableKey(): string {
  return (process.env.MEDUSA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "").trim();
}

export async function fetchPublicPromotionBanner(): Promise<PublicPromotionBanner | null> {
  const baseCandidates = getMedusaBaseCandidates();
  if (!baseCandidates.length) {
    return null;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const publishableKey = getPublishableKey();
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey;
  }

  for (const baseUrl of baseCandidates) {
    try {
      const response = await fetch(`${baseUrl}/store/public-promotions/banner`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as { promotion?: PublicPromotionBanner | null };
      return data.promotion || null;
    } catch {
      continue;
    }
  }

  return null;
}
