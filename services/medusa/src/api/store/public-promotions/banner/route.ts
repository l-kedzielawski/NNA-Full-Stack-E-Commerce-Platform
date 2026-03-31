import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

type PromotionService = {
  listPromotions: (
    filters?: Record<string, unknown>,
    config?: { relations?: string[]; select?: string[] },
  ) => Promise<unknown[]>;
};

type PromotionApplicationMethod = {
  type?: unknown;
  value?: unknown;
  currency_code?: unknown;
  max_quantity?: unknown;
  target_type?: unknown;
};

type PromotionRecord = {
  id?: unknown;
  code?: unknown;
  is_automatic?: unknown;
  type?: unknown;
  status?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  metadata?: unknown;
  campaign?: unknown;
  application_method?: PromotionApplicationMethod | null;
};

function getCampaign(record: PromotionRecord): Record<string, unknown> | null {
  return asRecord(record.campaign);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const rawValue = record.value;
  if (typeof rawValue === "string") {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue;
  }

  return null;
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const raw = asString(value);
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }

  return false;
}

function getMetadata(record: PromotionRecord): Record<string, unknown> {
  return asRecord(record.metadata) || {};
}

function getPromotionPercentage(record: PromotionRecord): number | null {
  const applicationMethod = asRecord(record.application_method);
  if (!applicationMethod) {
    return null;
  }

  if (asString(applicationMethod.type).toLowerCase() !== "percentage") {
    return null;
  }

  return asNumber(applicationMethod.value);
}

function isPromotionActive(record: PromotionRecord, now: Date): boolean {
  if (asString(record.status).toLowerCase() !== "active") {
    return false;
  }

  const campaign = getCampaign(record);
  const startsAt = asDate(record.starts_at) || asDate(campaign?.starts_at);
  if (startsAt && startsAt.getTime() > now.getTime()) {
    return false;
  }

  const endsAt = asDate(record.ends_at) || asDate(campaign?.ends_at);
  if (endsAt && endsAt.getTime() <= now.getTime()) {
    return false;
  }

  return true;
}

function isPublicBannerPromotion(record: PromotionRecord): boolean {
  const metadata = getMetadata(record);
  return asBoolean(metadata.public_banner ?? metadata.banner_public ?? metadata.show_in_banner);
}

function normalizePromotion(record: PromotionRecord) {
  const metadata = getMetadata(record);
  const percentage = getPromotionPercentage(record);
  const code = asString(record.code).toUpperCase();
  const campaign = getCampaign(record);
  const endsAt = asDate(record.ends_at) || asDate(campaign?.ends_at);
  const startsAt = asDate(record.starts_at) || asDate(campaign?.starts_at);

  if (!code || !percentage || asBoolean(record.is_automatic)) {
    return null;
  }

  return {
    code,
    percentage,
    starts_at: startsAt?.toISOString() || null,
    ends_at: endsAt?.toISOString() || null,
    cta_href: asString(metadata.cta_href || metadata.banner_cta_href || metadata.cta) || "/checkout",
    message_en: asString(metadata.banner_text_en || metadata.public_banner_text_en) || null,
    message_pl: asString(metadata.banner_text_pl || metadata.public_banner_text_pl) || null,
  };
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const promotionService = req.scope.resolve(Modules.PROMOTION) as PromotionService;
  const data = (await promotionService.listPromotions(
    {},
    {
      relations: ["campaign", "application_method"],
      select: ["id", "code", "type", "status", "is_automatic", "starts_at", "ends_at", "metadata"],
    },
  )) as PromotionRecord[];

  const now = new Date();

  const match = data
    .filter((record) => isPublicBannerPromotion(record) && isPromotionActive(record, now))
    .map(normalizePromotion)
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .sort((a, b) => {
      if (!a.ends_at && !b.ends_at) {
        return a.code.localeCompare(b.code);
      }

      if (!a.ends_at) {
        return 1;
      }

      if (!b.ends_at) {
        return -1;
      }

      return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime();
    })[0];

  return res.status(200).json({ promotion: match || null });
}
