import { readContentFile } from "@/lib/content";

export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  seoDescription: string;
  sku: string;
  variantId?: string;
  metadata?: Record<string, unknown>;
  categoryNames: string[];
  imageUrls: string[];
  stockStatus: "instock" | "outofstock" | "onbackorder";
  price: number | null;
  rawPrice: string;
};

type RawProductEntry = {
  id: number;
  slug: string;
  title: string;
  content_text: string;
  seo_description: string;
  product: {
    sku: string;
    price: string;
    stock_status: "instock" | "outofstock" | "onbackorder";
    categories: Array<{ name: string }>;
    images: string[];
  };
};

type MedusaStoreProduct = {
  id: string;
  handle?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  images?: Array<{ url?: string }>;
  categories?: Array<{ name?: string }>;
  collection?: { title?: string };
  variants?: Array<{
    id: string;
    sku?: string;
    allow_backorder?: boolean;
    manage_inventory?: boolean;
    inventory_quantity?: number;
    calculated_price?: {
      calculated_amount?: number;
      original_amount?: number;
    };
  }>;
};

type ProductsSource = "file" | "medusa";

type CategoryFallbackMap = {
  bySku: Map<string, string[]>;
  bySlug: Map<string, string[]>;
};

const preferredCategoryOrder = [
  "Vanilla Pods",
  "Vanilla Powder & Seeds",
  "Vanilla Extracts",
  "Cocoa",
  "Spices & Other",
  "Samples & Gift Sets",
] as const;

const htmlEntityDecodes: Record<string, string> = {
  "&amp;": "&",
  "&#039;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ndash;": "–",
  "&mdash;": "—",
};

// Normalize raw WP category names (French / Italian / HTML-encoded) → clean English
const categoryNormalize: Record<string, string> = {
  // French
  "Gousses de vanille": "Vanilla Pods",
  "Poudres et graines de vanille": "Vanilla Powder & Seeds",
  "Coffrets d'échantillons et cadeaux": "Samples & Gift Sets",
  "Coffrets d\u2019\u00e9chantillons et cadeaux": "Samples & Gift Sets",
  "Autres": "Spices & Other",
  // Italian
  "Polveri e semi di vaniglia": "Vanilla Powder & Seeds",
  "Baccelli di vaniglia": "Vanilla Pods",
  "Estratti di vaniglia": "Vanilla Extracts",
  // HTML-entity variants (decoded first, then normalized)
  "Sample &amp; Gift Sets": "Samples & Gift Sets",
  "Vanilla Powders &amp; Seeds": "Vanilla Powder & Seeds",
  // Pass-through clean names (already English — keep as-is)
  "Vanilla Pods": "Vanilla Pods",
  "Vanilla Extracts": "Vanilla Extracts",
  "Vanilla Powders & Seeds": "Vanilla Powder & Seeds",
  "Vanilla Powder & Seeds": "Vanilla Powder & Seeds",
  "Sample & Gift Sets": "Samples & Gift Sets",
  "Samples & Gift Sets": "Samples & Gift Sets",
  "Cocoa": "Cocoa",
  "Other": "Spices & Other",
  "Spices & Other": "Spices & Other",
};

function decodeBasicEntities(input: string): string {
  return Object.entries(htmlEntityDecodes).reduce(
    (acc, [entity, replacement]) => acc.replaceAll(entity, replacement),
    input,
  );
}

function normalizeCategory(raw: string): string {
  const decoded = decodeBasicEntities(raw);
  return categoryNormalize[decoded] ?? categoryNormalize[raw] ?? decoded;
}

function normalizeProductContent(raw: string): string {
  return decodeBasicEntities(raw)
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\.gem-[^\n]*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+:/g, ":")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+%/g, "%")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function deriveSummary(text: string, seoDescription: string): string {
  if (seoDescription.trim()) {
    return seoDescription.trim();
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const firstLongParagraph = paragraphs.find(
    (paragraph) => paragraph.length > 90 && !/^Q\d+\./i.test(paragraph),
  );

  if (firstLongParagraph) {
    return firstLongParagraph;
  }

  return paragraphs[0] ?? "";
}

function parsePrice(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseNumberPrice(value: number | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  if (Number.isInteger(value) && value >= 1000) {
    return value / 100;
  }

  return value;
}

function normalizeImageUrl(url: string): string {
  if (!url) {
    return url;
  }

  const toMedusaStaticIfGenerated = (pathname: string): string => {
    const fileName = pathname.split("/").filter(Boolean).pop() || "";

    if (/^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }

    return pathname;
  };

  if (url.startsWith("/wp-content/")) {
    const fileName = url.split("/").pop() || "";
    if (/^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }
    return fileName ? `/images/products/${fileName}` : url;
  }

  if (url.includes("/wp-content/uploads/")) {
    const fileName = url.split("/").pop() || "";
    if (/^\d{10,}-.+/.test(fileName)) {
      return `/medusa-static/${fileName}`;
    }
    return fileName ? `/images/products/${fileName}` : url;
  }

  if (url.startsWith("/images/products/")) {
    return toMedusaStaticIfGenerated(url);
  }

  return url;
}

function isRenderableImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  if (url === "null" || url === "undefined") {
    return false;
  }

  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

function parseMetadataStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // ignore invalid JSON and parse as list below
    }
  }

  return raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProductsSource(): ProductsSource {
  const envSource = process.env.PRODUCTS_SOURCE?.trim().toLowerCase();
  return envSource === "medusa" ? "medusa" : "file";
}

function inferCategoryFromText(title: string, slug: string): string[] {
  const value = `${title} ${slug}`.toLowerCase();

  if (value.includes("extract")) {
    return ["Vanilla Extracts"];
  }

  if (value.includes("pod") || value.includes("bean")) {
    return ["Vanilla Pods"];
  }

  if (value.includes("seed") || value.includes("powder") || value.includes("caviar")) {
    return ["Vanilla Powder & Seeds"];
  }

  if (value.includes("cocoa")) {
    return ["Cocoa"];
  }

  if (value.includes("set") || value.includes("gift") || value.includes("sample")) {
    return ["Samples & Gift Sets"];
  }

  if (value.includes("combava") || value.includes("spice") || value.includes("lime")) {
    return ["Spices & Other"];
  }

  return ["Spices & Other"];
}

let categoryFallbackCache: CategoryFallbackMap | null = null;

function getCategoryFallbackMap(): CategoryFallbackMap {
  if (categoryFallbackCache) {
    return categoryFallbackCache;
  }

  const bySku = new Map<string, string[]>();
  const bySlug = new Map<string, string[]>();

  try {
    const entries = loadRawProductsFromFile();

    for (const entry of entries) {
      const mappedCategories = Array.from(
        new Set(entry.product.categories.map((category) => normalizeCategory(category.name))),
      );

      if (mappedCategories.length > 0) {
        const sku = entry.product.sku.trim().toUpperCase();
        if (sku) {
          bySku.set(sku, mappedCategories);
        }
        if (entry.slug.trim()) {
          bySlug.set(entry.slug.trim(), mappedCategories);
        }
      }
    }
  } catch {
    // Ignore fallback mapping if file is unavailable.
  }

  categoryFallbackCache = { bySku, bySlug };
  return categoryFallbackCache;
}

function loadRawProductsFromFile(): RawProductEntry[] {
  const sourceFile = process.env.PRODUCTS_FILE || "products.json";
  const data = readContentFile(sourceFile);

  return JSON.parse(data) as RawProductEntry[];
}

function mapRawEntriesToProducts(entries: RawProductEntry[]): Product[] {
  return entries
    .map((entry) => {
      const fullDescription = normalizeProductContent(entry.content_text);
      const summary = deriveSummary(fullDescription, entry.seo_description);

      return {
        id: entry.id,
        slug: entry.slug,
        title: entry.title.replace(/\s+/g, " ").trim(),
        description: summary,
        fullDescription,
        seoDescription: entry.seo_description,
        sku: entry.product.sku,
        variantId: undefined,
        metadata: undefined,
        categoryNames: Array.from(
          new Set(entry.product.categories.map((category) => normalizeCategory(category.name))),
        ),
        imageUrls: entry.product.images.map((image) => normalizeImageUrl(image)),
        stockStatus: entry.product.stock_status,
        price: parsePrice(entry.product.price),
        rawPrice: entry.product.price,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function mapMedusaProduct(
  entry: MedusaStoreProduct,
  index: number,
  categoryFallbackMap: CategoryFallbackMap,
): Product {
  const title = entry.title?.trim() || "Untitled product";
  const slug = entry.handle?.trim() || `product-${entry.id}`;
  const fullDescription = normalizeProductContent(entry.description || "");
  const variants = entry.variants ?? [];
  const primaryVariant = variants[0];
  const metadata = entry.metadata ?? {};

  let categoryNames = Array.from(
    new Set(
      [
        ...(entry.categories ?? [])
          .map((category) => category.name?.trim())
          .filter((value): value is string => Boolean(value))
          .map((value) => normalizeCategory(value)),
        normalizeCategory(entry.collection?.title?.trim() || ""),
      ].filter((value): value is string => Boolean(value)),
    ),
  );

  if (categoryNames.length === 0) {
    const variantSku = primaryVariant?.sku?.trim().toUpperCase() || "";
    if (variantSku && categoryFallbackMap.bySku.has(variantSku)) {
      categoryNames = categoryFallbackMap.bySku.get(variantSku) ?? [];
    }
  }

  if (categoryNames.length === 0 && categoryFallbackMap.bySlug.has(slug)) {
    categoryNames = categoryFallbackMap.bySlug.get(slug) ?? [];
  }

  if (categoryNames.length === 0) {
    categoryNames = inferCategoryFromText(title, slug);
  }

  const metadataGalleryImages = parseMetadataStringArray(
    metadata.custom_gallery_images ?? metadata.gallery_images,
  )
    .map((url) => normalizeImageUrl(url))
    .filter((url) => isRenderableImageUrl(url));

  const apiImageUrls = (entry.images ?? [])
    .map((image) => image.url?.trim() || "")
    .filter(Boolean)
    .map((url) => normalizeImageUrl(url));
    
  const safeApiImageUrls = apiImageUrls.filter((url) => isRenderableImageUrl(url));

  const imageUrls = metadataGalleryImages.length > 0 ? metadataGalleryImages : safeApiImageUrls;

  const inventoryState = variants.map((variant) => {
    if (variant.allow_backorder) {
      return "onbackorder";
    }

    if (typeof variant.manage_inventory === "undefined") {
      return "instock";
    }

    if (variant.manage_inventory === false) {
      return "instock";
    }

    if ((variant.inventory_quantity ?? 0) > 0) {
      return "instock";
    }

    return "outofstock";
  });

  const stockStatus = inventoryState.includes("instock")
    ? "instock"
    : inventoryState.includes("onbackorder")
      ? "onbackorder"
      : "outofstock";

  const calculatedAmount = primaryVariant?.calculated_price?.calculated_amount;
  const originalAmount = primaryVariant?.calculated_price?.original_amount;
  const parsedPrice = parseNumberPrice(calculatedAmount) ?? parseNumberPrice(originalAmount);

  const metadataSeo = typeof metadata.seo_description === "string" ? metadata.seo_description : "";
  const summary = deriveSummary(fullDescription, metadataSeo);

  return {
    id: Number.parseInt(entry.id.replace(/[^0-9]/g, ""), 10) || 1_000_000 + index,
    slug,
    title,
    description: summary,
    fullDescription,
    seoDescription: metadataSeo,
    sku: primaryVariant?.sku?.trim() || "",
    variantId: primaryVariant?.id,
    metadata,
    categoryNames,
    imageUrls,
    stockStatus,
    price: parsedPrice,
    rawPrice: parsedPrice === null ? "" : String(parsedPrice),
  };
}

async function loadProductsFromMedusa(): Promise<Product[] | null> {
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BACKEND_URL;

  if (!medusaUrl) {
    return null;
  }

  const baseUrl = medusaUrl.replace(/\/$/, "");
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || process.env.MEDUSA_PUBLISHABLE_KEY;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey;
  }

  const configuredRegionId =
    process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || process.env.MEDUSA_REGION_ID || "";

  try {
    let regionId = configuredRegionId;
    const categoryFallbackMap = getCategoryFallbackMap();

    const fetchOptions: RequestInit & { next?: { revalidate: number } } =
      process.env.NODE_ENV === "development"
        ? { headers, cache: "no-store" }
        : { headers, next: { revalidate: 300 } };

    if (!regionId) {
      const regionsResponse = await fetch(`${baseUrl}/store/regions?limit=20`, {
        ...fetchOptions,
      });

      if (regionsResponse.ok) {
        const regionsPayload = (await regionsResponse.json()) as {
          regions?: Array<{ id?: string; name?: string }>;
        };

        regionId =
          regionsPayload.regions?.find((region) => region.name === "Europe")?.id ||
          regionsPayload.regions?.[0]?.id ||
          "";
      }
    }

    const search = new URLSearchParams({
      limit: "200",
      fields: "*variants.calculated_price,+metadata,+description",
    });
    if (regionId) {
      search.set("region_id", regionId);
    }

    const response = await fetch(`${baseUrl}/store/products?${search.toString()}`, {
      ...fetchOptions,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { products?: MedusaStoreProduct[] };
    const products = (payload.products ?? [])
      .filter((item) => item.status !== "draft")
      .map((item, index) => mapMedusaProduct(item, index, categoryFallbackMap))
      .sort((a, b) => a.title.localeCompare(b.title));

    return products.length > 0 ? products : null;
  } catch {
    return null;
  }
}

let productsCache: Product[] | null = null;
let productsCacheAt = 0;

function getMedusaCacheTtlMs(): number {
  if (process.env.NODE_ENV === "development") {
    return 5_000;
  }

  return 60_000;
}

async function resolveProducts(): Promise<Product[]> {
  const source = getProductsSource();

  if (productsCache && source === "file") {
    return productsCache;
  }

  if (productsCache && source === "medusa") {
    const isFresh = Date.now() - productsCacheAt < getMedusaCacheTtlMs();
    if (isFresh) {
      return productsCache;
    }
  }

  if (source === "medusa") {
    const medusaProducts = await loadProductsFromMedusa();

    if (medusaProducts) {
      productsCache = medusaProducts;
      productsCacheAt = Date.now();
      return productsCache;
    }
  }

  productsCache = mapRawEntriesToProducts(loadRawProductsFromFile());
  productsCacheAt = Date.now();
  return productsCache;
}

export async function getAllProducts(): Promise<Product[]> {
  return resolveProducts();
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const products = await resolveProducts();
  return products
    .filter((product) => product.stockStatus === "instock" || product.stockStatus === "onbackorder")
    .slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await resolveProducts();
  return products.find((product) => product.slug === slug);
}

export async function getProductCategories(): Promise<string[]> {
  const products = await resolveProducts();
  const uniqueCategories = Array.from(new Set(products.flatMap((product) => product.categoryNames)));

  const ordered = [...preferredCategoryOrder];
  const extraCategories = uniqueCategories
    .filter((category) => !(preferredCategoryOrder as readonly string[]).includes(category))
    .sort((a, b) => a.localeCompare(b));

  return [...ordered, ...extraCategories];
}

export async function getRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
  const products = await resolveProducts();
  const current = products.find((product) => product.slug === slug);

  if (!current) {
    return [];
  }

  const relatedByCategory = products.filter(
    (product) =>
      product.slug !== slug &&
      product.categoryNames.some((category) => current.categoryNames.includes(category)),
  );

  if (relatedByCategory.length >= limit) {
    return relatedByCategory.slice(0, limit);
  }

  const fallback = products.filter(
    (product) =>
      product.slug !== slug &&
      !relatedByCategory.some((related) => related.slug === product.slug),
  );

  return [...relatedByCategory, ...fallback].slice(0, limit);
}
