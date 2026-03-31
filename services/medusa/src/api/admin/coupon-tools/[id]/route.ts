import {
  createCampaignsWorkflow,
  deletePromotionsWorkflow,
  updateCampaignsWorkflow,
  updatePromotionsStatusWorkflow,
  updatePromotionsWorkflow,
} from "@medusajs/core-flows";
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
  metadata?: unknown;
  campaign_id?: unknown;
  campaign?: unknown;
  application_method?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDateString(value: unknown): string | null {
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

function normalizeCode(value: unknown): string {
  return asString(value)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "");
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const promotionId = asString(req.params.id);
  const body = (req.body || {}) as {
    action?: unknown;
    status?: unknown;
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
  const action = asString(body.action).toLowerCase();
  const status = asString(body.status).toLowerCase();

  if (!promotionId) {
    return res.status(400).json({ message: "Missing coupon ID." });
  }

  if (action === "delete") {
    await deletePromotionsWorkflow(req.scope).run({
      input: {
        ids: [promotionId],
      },
    });

    return res.status(200).json({ ok: true });
  }

  if (action === "status") {
    if (!["active", "draft", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid coupon status." });
    }

    await updatePromotionsStatusWorkflow(req.scope).run({
      input: {
        promotionsData: [
          {
            id: promotionId,
            status: status as "active" | "draft" | "inactive",
          },
        ],
      },
    });

    return res.status(200).json({ ok: true });
  }

  if (action === "update") {
    const promotionService = req.scope.resolve(Modules.PROMOTION) as PromotionService;
    const data = (await promotionService.listPromotions(
      { id: [promotionId] },
      {
        relations: ["campaign", "application_method"],
        select: ["id", "code", "metadata", "campaign_id"],
      },
    )) as PromotionRecord[];

    const current = data[0];
    if (!current) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    const code = normalizeCode(body.code) || asString(current.code).toUpperCase();
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

    const currentMetadata = asRecord(current.metadata) || {};
    const metadata: Record<string, unknown> = {
      ...currentMetadata,
      public_banner: visibility === "public",
      coupon_visibility: visibility,
    };

    if (visibility === "public") {
      metadata.cta_href = ctaHref;
      metadata.banner_text_en = bannerTextEn || undefined;
      metadata.banner_text_pl = bannerTextPl || undefined;
    } else {
      delete metadata.cta_href;
      delete metadata.banner_text_en;
      delete metadata.banner_text_pl;
    }

    if (companyName) {
      metadata.company_name = companyName;
    } else {
      delete metadata.company_name;
    }

    let campaignId = asString(current.campaign_id) || asString(asRecord(current.campaign)?.id);

    if (campaignId) {
      await updateCampaignsWorkflow(req.scope).run({
        input: {
          campaignsData: [
            {
              id: campaignId,
              starts_at: startsAt ? new Date(startsAt) : null,
              ends_at: endsAt ? new Date(endsAt) : null,
            },
          ],
        },
      });
    } else if (startsAt || endsAt) {
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

    const updatePayload: Record<string, unknown> = {
      id: promotionId,
      code,
      metadata,
      application_method: {
        ...(asRecord(current.application_method) || {}),
        type: "percentage",
        target_type: "items",
        allocation: "across",
        value: percentage,
      },
      ...(campaignId ? { campaign_id: campaignId } : {}),
    };

    await updatePromotionsWorkflow(req.scope).run({
      input: {
        promotionsData: [updatePayload as never],
      },
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ message: "Unsupported coupon action." });
}
