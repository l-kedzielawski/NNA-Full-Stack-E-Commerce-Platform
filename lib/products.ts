import { readContentFile } from "@/lib/content";

export type Product = {
  id: number;
  slug: string;
  title: string;
  sortOrder?: number;
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
  currencyCode: string | null;
  rawPrice: string;
};

type ProductMetadata = Record<string, unknown>;

type RawProductEntry = {
  id: number;
  slug: string;
  title: string;
  sortOrder?: number | string;
  sort_order?: number | string;
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
      currency_code?: string;
    };
  }>;
};

type ProductsSource = "file" | "medusa";
type PreferredCurrencyCode = "eur" | "pln";

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

const localeSensitiveMetadataKeys = [
  "custom_overview",
  "overview",
  "custom_faq_items",
  "faq_items",
  "custom_spec_rows",
  "spec_rows",
  "custom_detail_sections",
  "detail_sections",
  "custom_storage",
  "storage",
  "custom_shelf_life",
  "shelf_life",
  "custom_packaging",
  "packaging",
  "custom_type_label",
  "type_label",
] as const;

function normalizeLocaleForPricing(locale?: string): string {
  return (locale || "").trim().toLowerCase();
}

function resolvePreferredCurrencyForLocale(locale?: string): PreferredCurrencyCode {
  const normalizedLocale = normalizeLocaleForPricing(locale);
  return normalizedLocale.startsWith("pl") ? "pln" : "eur";
}

function getConfiguredRegionIdForCurrency(currencyCode: PreferredCurrencyCode): string {
  if (currencyCode === "pln") {
    return (
      process.env.MEDUSA_REGION_ID_PLN ||
      process.env.NEXT_PUBLIC_MEDUSA_REGION_ID_PLN ||
      ""
    ).trim();
  }

  return (
    process.env.MEDUSA_REGION_ID_EUR ||
    process.env.NEXT_PUBLIC_MEDUSA_REGION_ID_EUR ||
    process.env.MEDUSA_REGION_ID ||
    process.env.NEXT_PUBLIC_MEDUSA_REGION_ID ||
    ""
  ).trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLocaleCode(locale?: string): string {
  return (locale || "").trim().toLowerCase();
}

function getLocaleMetadataEntry(metadata: ProductMetadata | undefined, locale?: string): ProductMetadata | null {
  if (!metadata) {
    return null;
  }

  const normalizedLocale = normalizeLocaleCode(locale);
  if (!normalizedLocale) {
    return null;
  }

  const i18n = metadata.i18n;
  if (!isRecord(i18n)) {
    return null;
  }

  const direct = i18n[normalizedLocale];
  if (isRecord(direct)) {
    return direct;
  }

  const language = normalizedLocale.split("-")[0];
  if (language && language !== normalizedLocale) {
    const languageOnly = i18n[language];
    if (isRecord(languageOnly)) {
      return languageOnly;
    }
  }

  return null;
}

function getFlatLocalizedMetadataValue(
  metadata: ProductMetadata | undefined,
  key: string,
  locale?: string,
): unknown {
  if (!metadata) {
    return undefined;
  }

  const normalizedLocale = normalizeLocaleCode(locale);
  if (!normalizedLocale) {
    return undefined;
  }

  const language = normalizedLocale.split("-")[0];
  const localizedKey = `${key}_${normalizedLocale}`;
  if (localizedKey in metadata) {
    return metadata[localizedKey];
  }

  if (language && language !== normalizedLocale) {
    const languageKey = `${key}_${language}`;
    if (languageKey in metadata) {
      return metadata[languageKey];
    }
  }

  return undefined;
}

function readLocalizedMetadataValue(
  metadata: ProductMetadata | undefined,
  key: string,
  locale?: string,
): unknown {
  const localeEntry = getLocaleMetadataEntry(metadata, locale);
  if (localeEntry && key in localeEntry) {
    return localeEntry[key];
  }

  return getFlatLocalizedMetadataValue(metadata, key, locale);
}

function mergeMetadataWithLocale(
  metadata: ProductMetadata | undefined,
  locale?: string,
): ProductMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  const localeEntry = getLocaleMetadataEntry(metadata, locale);
  if (!localeEntry) {
    return metadata;
  }

  const normalizedLocale = normalizeLocaleCode(locale);
  const mergedMetadata: ProductMetadata = {
    ...metadata,
    ...localeEntry,
  };

  if (normalizedLocale && normalizedLocale !== "en") {
    for (const key of localeSensitiveMetadataKeys) {
      if (!(key in localeEntry)) {
        delete mergedMetadata[key];
      }
    }
  }

  return mergedMetadata;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function localizeProduct(product: Product, locale?: string): Product {
  const metadata = isRecord(product.metadata) ? product.metadata : undefined;
  const localizedMetadata = mergeMetadataWithLocale(metadata, locale);
  const localizedTitle =
    toNonEmptyString(readLocalizedMetadataValue(metadata, "title", locale)) || product.title;
  const localizedFullDescriptionRaw =
    toNonEmptyString(readLocalizedMetadataValue(metadata, "full_description", locale)) ||
    toNonEmptyString(readLocalizedMetadataValue(metadata, "fullDescription", locale)) ||
    toNonEmptyString(readLocalizedMetadataValue(metadata, "description", locale));
  const localizedFullDescription = localizedFullDescriptionRaw
    ? normalizeProductContent(localizedFullDescriptionRaw)
    : product.fullDescription;
  const localizedSeoDescription =
    toNonEmptyString(readLocalizedMetadataValue(metadata, "seo_description", locale)) ||
    toNonEmptyString(readLocalizedMetadataValue(metadata, "seoDescription", locale)) ||
    product.seoDescription;
  const localizedSummary =
    toNonEmptyString(readLocalizedMetadataValue(metadata, "description", locale)) ||
    toNonEmptyString(readLocalizedMetadataValue(metadata, "summary", locale)) ||
    deriveSummary(localizedFullDescription, localizedSeoDescription);

  return {
    ...product,
    title: localizedTitle,
    description: localizedSummary,
    fullDescription: localizedFullDescription,
    seoDescription: localizedSeoDescription,
    metadata: localizedMetadata,
  };
}

function localizeProducts(products: Product[], locale?: string): Product[] {
  if (!locale) {
    return products;
  }

  return products.map((product) => localizeProduct(product, locale));
}

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

function parseSortOrder(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function sortProductsByOrderThenTitle(a: Product, b: Product): number {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  return a.title.localeCompare(b.title);
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
        sortOrder: parseSortOrder(entry.sortOrder ?? entry.sort_order) ?? undefined,
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
        currencyCode: "EUR",
        rawPrice: entry.product.price,
      };
    })
    .sort(sortProductsByOrderThenTitle);
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
  const parsedCurrencyCode = String(primaryVariant?.calculated_price?.currency_code || "")
    .trim()
    .toUpperCase();

  const metadataSeo = typeof metadata.seo_description === "string" ? metadata.seo_description : "";
  const metadataSortOrder = parseSortOrder(metadata.sortOrder ?? metadata.sort_order);
  const summary = deriveSummary(fullDescription, metadataSeo);

  return {
    id: Number.parseInt(entry.id.replace(/[^0-9]/g, ""), 10) || 1_000_000 + index,
    slug,
    title,
    sortOrder: metadataSortOrder ?? undefined,
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
    currencyCode: parsedCurrencyCode || null,
    rawPrice: parsedPrice === null ? "" : String(parsedPrice),
  };
}

async function loadProductsFromMedusa(locale?: string): Promise<Product[] | null> {
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

  const preferredCurrency = resolvePreferredCurrencyForLocale(locale);
  const configuredRegionId = getConfiguredRegionIdForCurrency(preferredCurrency);

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
          regions?: Array<{
            id?: string;
            name?: string;
            currency_code?: string;
            countries?: Array<{ iso_2?: string }>;
          }>;
        };

        const regions = regionsPayload.regions || [];
        const currencyRegions = regions.filter(
          (region) => String(region.currency_code || "").trim().toLowerCase() === preferredCurrency,
        );

        if (preferredCurrency === "pln") {
          regionId =
            currencyRegions.find((region) =>
              (region.countries || []).some(
                (country) => String(country.iso_2 || "").trim().toLowerCase() === "pl",
              ),
            )?.id || currencyRegions[0]?.id || "";
        } else {
          regionId =
            currencyRegions.find((region) => String(region.name || "") === "Europe")?.id ||
            currencyRegions[0]?.id ||
            "";
        }

        if (!regionId) {
          regionId = regions.find((region) => region.name === "Europe")?.id || regions[0]?.id || "";
        }
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
      .sort(sortProductsByOrderThenTitle);

    return products.length > 0 ? products : null;
  } catch {
    return null;
  }
}

const productsCacheByKey = new Map<string, { products: Product[]; at: number }>();

function getMedusaCacheTtlMs(): number {
  if (process.env.NODE_ENV === "development") {
    return 5_000;
  }

  return 60_000;
}

async function resolveProducts(locale?: string): Promise<Product[]> {
  const source = getProductsSource();
  const cacheKey =
    source === "medusa"
      ? `medusa:${resolvePreferredCurrencyForLocale(locale)}`
      : "file";
  const cached = productsCacheByKey.get(cacheKey);

  if (cached && source === "file") {
    return cached.products;
  }

  if (cached && source === "medusa") {
    const isFresh = Date.now() - cached.at < getMedusaCacheTtlMs();
    if (isFresh) {
      return cached.products;
    }
  }

  if (source === "medusa") {
    const medusaProducts = await loadProductsFromMedusa(locale);

    if (medusaProducts) {
      productsCacheByKey.set(cacheKey, {
        products: medusaProducts,
        at: Date.now(),
      });
      return medusaProducts;
    }
  }

  const fileProducts = mapRawEntriesToProducts(loadRawProductsFromFile());
  productsCacheByKey.set(cacheKey, {
    products: fileProducts,
    at: Date.now(),
  });

  return fileProducts;
}

export async function getAllProducts(locale?: string): Promise<Product[]> {
  const products = await resolveProducts(locale);
  return localizeProducts(products, locale);
}

export async function getFeaturedProducts(limit = 6, locale?: string): Promise<Product[]> {
  const products = await resolveProducts(locale);
  return localizeProducts(
    products
    .filter((product) => product.stockStatus === "instock" || product.stockStatus === "onbackorder")
    .slice(0, limit),
    locale,
  );
}

export async function getProductBySlug(slug: string, locale?: string): Promise<Product | undefined> {
  const products = await resolveProducts(locale);
  const product = products.find((item) => item.slug === slug);
  return product ? localizeProduct(product, locale) : undefined;
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

export async function getRelatedProducts(slug: string, limit = 3, locale?: string): Promise<Product[]> {
  const products = await resolveProducts(locale);
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

  return localizeProducts([...relatedByCategory, ...fallback].slice(0, limit), locale);
}
