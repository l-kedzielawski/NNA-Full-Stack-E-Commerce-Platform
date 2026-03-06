import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { listCatalogVariants } from "../../../utils/catalog-variants";

function sanitize(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = sanitize(req.query.q, 120).toLowerCase();
  const limit = Math.min(Math.max(toNumber(req.query.limit, 100), 1), 400);

  const variants = await listCatalogVariants(req.scope, 1200);
  const filtered = q
    ? variants.filter((variant) => {
        const haystack = [variant.product_title, variant.title, variant.sku].join(" ").toLowerCase();
        return haystack.includes(q);
      })
    : variants;

  return res.status(200).json({
    variants: filtered.slice(0, limit),
    count: filtered.length,
    limit,
  });
}
