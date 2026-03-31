import { createCampaignsWorkflow, createPromotionsWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

type PromotionService = {
  listPromotions: (
    filters?: Record<string, unknown>,
    config?: { relations?: string[]; select?: string[] },
  ) => Promise<unknown[]>;
};

type PromotionRecord = {
  id?: unknown;
  code?: unknown;
  status?: unknown;
  is_automatic?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  created_at?: unknown;
  metadata?: unknown;
  campaign?: unknown;
  campaign_id?: unknown;
  application_method?: unknown;
};

type CouponToolInput = {
  code?: unknown;
  percentage?: unknown;
  visibility?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  cta_href?: unknown;
  banner_text_en?: unknown;
  banner_text_pl?: unknown;
  company_name?: unknown;
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
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDateString(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  const raw = asString(value);
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
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

function normalizeCode(value: unknown): string {
  return asString(value)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "");
}

function normalizeCoupon(record: PromotionRecord) {
  const metadata = asRecord(record.metadata) || {};
  const applicationMethod = asRecord(record.application_method) || {};
  const campaign = getCampaign(record) || {};

  return {
    id: asString(record.id),
    code: asString(record.code).toUpperCase(),
    campaign_id: asString(record.campaign_id) || asString(campaign.id) || null,
    status: asString(record.status) || "draft",
    is_automatic: asBoolean(record.is_automatic),
    visibility: asBoolean(metadata.public_banner) ? "public" : "private",
    percentage: asNumber(applicationMethod.value),
    starts_at: asDateString(record.starts_at) || asDateString(campaign.starts_at) || null,
    ends_at: asDateString(record.ends_at) || asDateString(campaign.ends_at) || null,
    created_at: asString(record.created_at) || null,
    cta_href: asString(metadata.cta_href) || null,
    company_name: asString(metadata.company_name) || null,
    banner_text_en: asString(metadata.banner_text_en) || null,
    banner_text_pl: asString(metadata.banner_text_pl) || null,
  };
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const promotionService = req.scope.resolve(Modules.PROMOTION) as PromotionService;
  const data = (await promotionService.listPromotions(
    {},
    {
      relations: ["campaign", "application_method"],
      select: [
        "id",
        "code",
        "status",
        "is_automatic",
        "starts_at",
        "ends_at",
        "created_at",
        "metadata",
        "campaign_id",
      ],
    },
  )) as PromotionRecord[];

  const promotions = data
    .filter((record) => !asBoolean(record.is_automatic) && asString(record.code))
    .map(normalizeCoupon)
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

  return res.status(200).json({ coupons: promotions });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as CouponToolInput;
  const code = normalizeCode(body.code);
  const percentage = asNumber(body.percentage);
  const visibility = asString(body.visibility).toLowerCase() === "public" ? "public" : "private";
  const startsAt = asDateString(body.starts_at);
  const endsAt = asDateString(body.ends_at);
  const ctaHref = asString(body.cta_href) || "/checkout";
  const bannerTextEn = asString(body.banner_text_en);
  const bannerTextPl = asString(body.banner_text_pl);
  const companyName = asString(body.company_name);

  if (!code || !/^[A-Z0-9_-]{3,40}$/.test(code)) {
    return res.status(400).json({ message: "Coupon code must be 3-40 characters using A-Z, 0-9, _ or -." });
  }

  if (!percentage || percentage <= 0 || percentage > 100) {
    return res.status(400).json({ message: "Discount percentage must be between 1 and 100." });
  }

  if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    return res.status(400).json({ message: "End date must be later than start date." });
  }

  if (visibility === "public" && !endsAt) {
    return res.status(400).json({ message: "Public banner coupons require an end date for the countdown timer." });
  }

  const metadata: Record<string, unknown> = {
    public_banner: visibility === "public",
    coupon_visibility: visibility,
  };

  if (visibility === "public") {
    metadata.cta_href = ctaHref;
    if (bannerTextEn) {
      metadata.banner_text_en = bannerTextEn;
    }
    if (bannerTextPl) {
      metadata.banner_text_pl = bannerTextPl;
    }
  }

  if (companyName) {
    metadata.company_name = companyName;
  }

  const hasSchedule = Boolean(startsAt || endsAt);
  let campaignId = "";

  if (hasSchedule) {
    const { result } = await createCampaignsWorkflow(req.scope).run({
      input: {
        campaignsData: [
          {
            name: `${code} campaign`,
            campaign_identifier: `coupon-${code}-${Date.now()}`,
            starts_at: startsAt ? new Date(startsAt) : undefined,
            ends_at: endsAt ? new Date(endsAt) : undefined,
          },
        ],
      },
    });

    campaignId = result[0]?.id || "";
  }

  const createPromotions = createPromotionsWorkflow(req.scope);

  const promotionData: Record<string, unknown> = {
    code,
    type: "standard",
    status: "active",
    is_automatic: false,
    metadata,
    application_method: {
      type: "percentage",
      target_type: "items",
      allocation: "across",
      value: percentage,
    },
    ...(campaignId ? { campaign_id: campaignId } : {}),
  };

  const { result } = await createPromotions.run({
    input: {
      promotionsData: [promotionData as never],
    },
  });

  const promotionId = result[0]?.id;
  if (!promotionId) {
    return res.status(500).json({ message: "Coupon was created but could not be reloaded." });
  }

  const promotionService = req.scope.resolve(Modules.PROMOTION) as PromotionService;
  const data = (await promotionService.listPromotions(
    { id: [promotionId] },
    {
      relations: ["campaign", "application_method"],
      select: [
        "id",
        "code",
        "status",
        "is_automatic",
        "starts_at",
        "ends_at",
        "created_at",
        "metadata",
        "campaign_id",
      ],
    },
  )) as PromotionRecord[];

  const created = data[0];
  return res.status(200).json({ coupon: created ? normalizeCoupon(created) : null });
}
