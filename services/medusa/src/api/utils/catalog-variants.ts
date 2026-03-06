import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type QueryService = {
  graph: (input: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
    pagination?: {
      take?: number;
      skip?: number;
    };
  }) => Promise<{ data?: unknown[] }>;
};

export type CatalogVariant = {
  id: string;
  title: string;
  sku: string;
  product_id: string;
  product_title: string;
};

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

function normalizeVariant(input: Record<string, unknown>): CatalogVariant | null {
  const id = asString(input.id);
  if (!id) {
    return null;
  }

  const product = asRecord(input.product);
  const productTitle = asString(product?.title) || asString(input.product_title) || "Untitled product";

  return {
    id,
    title: asString(input.title) || "Default",
    sku: asString(input.sku),
    product_id: asString(input.product_id),
    product_title: productTitle,
  };
}

function uniqueById(items: CatalogVariant[]): CatalogVariant[] {
  const seen = new Set<string>();
  const rows: CatalogVariant[] = [];

  for (const item of items) {
    if (!item.id || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    rows.push(item);
  }

  return rows;
}

function normalizeProductVariantRows(rows: unknown[]): CatalogVariant[] {
  return uniqueById(
    rows
      .map((row) => asRecord(row))
      .filter(Boolean)
      .map((row) => normalizeVariant(row as Record<string, unknown>))
      .filter(Boolean) as CatalogVariant[]
  );
}

function normalizeProductRows(rows: unknown[]): CatalogVariant[] {
  const items: CatalogVariant[] = [];

  for (const row of rows) {
    const product = asRecord(row);
    if (!product) {
      continue;
    }

    const productId = asString(product.id);
    const productTitle = asString(product.title) || "Untitled product";
    const variants = Array.isArray(product.variants) ? product.variants : [];

    for (const variant of variants) {
      const variantRecord = asRecord(variant);
      if (!variantRecord) {
        continue;
      }

      const id = asString(variantRecord.id);
      if (!id) {
        continue;
      }

      items.push({
        id,
        title: asString(variantRecord.title) || "Default",
        sku: asString(variantRecord.sku),
        product_id: productId,
        product_title: productTitle,
      });
    }
  }

  return uniqueById(items);
}

async function loadProductVariantEntities(query: QueryService, take: number): Promise<CatalogVariant[]> {
  const { data = [] } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "product_id", "product.id", "product.title"],
    pagination: { take },
  });

  return normalizeProductVariantRows(data);
}

async function loadProductEntities(query: QueryService, take: number): Promise<CatalogVariant[]> {
  const { data = [] } = await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.id", "variants.title", "variants.sku"],
    pagination: { take },
  });

  return normalizeProductRows(data);
}

export async function listCatalogVariants(scope: { resolve: (key: string) => unknown }, take = 500): Promise<CatalogVariant[]> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as QueryService;

  try {
    const variants = await loadProductVariantEntities(query, take);
    if (variants.length) {
      return variants;
    }
  } catch {
    // Fallback to loading variants from products.
  }

  return loadProductEntities(query, take);
}
