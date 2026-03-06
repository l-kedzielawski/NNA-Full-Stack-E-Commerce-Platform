import fs from "node:fs";
import path from "node:path";
import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createTaxRegionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

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

const htmlEntityDecodes: Record<string, string> = {
  "&amp;": "&",
  "&#039;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ndash;": "-",
  "&mdash;": "-",
};

const categoryNormalize: Record<string, string> = {
  "Gousses de vanille": "Vanilla Pods",
  "Poudres et graines de vanille": "Vanilla Powder & Seeds",
  "Coffrets d'échantillons et cadeaux": "Samples & Gift Sets",
  "Coffrets d\u2019\u00e9chantillons et cadeaux": "Samples & Gift Sets",
  Autres: "Spices & Other",
  "Polveri e semi di vaniglia": "Vanilla Powder & Seeds",
  "Baccelli di vaniglia": "Vanilla Pods",
  "Estratti di vaniglia": "Vanilla Extracts",
  "Sample &amp; Gift Sets": "Samples & Gift Sets",
  "Vanilla Powders &amp; Seeds": "Vanilla Powder & Seeds",
  "Vanilla Powders & Seeds": "Vanilla Powder & Seeds",
  "Sample & Gift Sets": "Samples & Gift Sets",
  Other: "Spices & Other",
};

const regionCountries = ["pl", "de", "it", "fr", "es", "nl", "be", "at", "cz", "sk"];
const PLN_PER_EUR = 4.4;

const convertEurToPln = (amountInEur: number): number => Math.round(amountInEur * PLN_PER_EUR);

function decodeBasicEntities(input: string): string {
  return Object.entries(htmlEntityDecodes).reduce(
    (acc, [entity, replacement]) => acc.replaceAll(entity, replacement),
    input,
  );
}

function normalizeCategory(raw: string): string {
  const decoded = decodeBasicEntities(raw);
  return categoryNormalize[decoded] ?? decoded;
}

function normalizeImageUrl(url: string): string {
  if (!url) {
    return url;
  }

  const storefrontOrigin = "https://www.themysticaroma.com";
  const toStorefrontImage = (input: string): string => {
    const cleanInput = input.split("?")[0];
    const fileName = cleanInput.split("/").filter(Boolean).pop() || "";
    return fileName ? `${storefrontOrigin}/images/products/${fileName}` : input;
  };

  if (url.startsWith("/images/products/")) {
    return `${storefrontOrigin}${url}`;
  }

  if (url.startsWith("/wp-content/")) {
    return toStorefrontImage(url);
  }

  if (url.includes("/wp-content/uploads/")) {
    return toStorefrontImage(url);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.startsWith("/images/products/")) {
        return `${storefrontOrigin}${parsed.pathname}`;
      }

      if (parsed.pathname.includes("/wp-content/uploads/")) {
        return toStorefrontImage(parsed.pathname);
      }
    } catch {
      return url;
    }
  }

  return url;
}

function parsePrice(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveProductsPath(): string {
  const envPath = process.env.MYSTIC_PRODUCTS_FILE;

  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  }

  return path.resolve(process.cwd(), "../../content/products.json");
}

function loadProductsFromJson(): RawProductEntry[] {
  const filePath = resolveProductsPath();

  if (!fs.existsSync(filePath)) {
    throw new Error(`Products file not found: ${filePath}`);
  }

  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as RawProductEntry[];
}

export default async function importMysticProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string) => void;
    warn: (msg: string) => void;
  };
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
  };
  const storeModuleService = container.resolve(Modules.STORE) as {
    listStores: () => Promise<Array<{ id: string }>>;
  };
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as {
    listSalesChannels: (filters: Record<string, unknown>) => Promise<Array<{ id: string; name: string }>>;
  };
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT) as {
    listShippingProfiles: (filters: Record<string, unknown>) => Promise<Array<{ id: string; type: string }>>;
  };

  logger.info("Starting Mystic Aroma import...");

  const rawProducts = loadProductsFromJson();
  logger.info(`Loaded ${rawProducts.length} products from JSON.`);

  const [store] = await storeModuleService.listStores();
  if (!store) {
    throw new Error("No Medusa store found.");
  }

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = result as Array<{ id: string; name: string }>;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  let publishableKeyId = "";
  let publishableKeyToken = "";
  const { data: existingApiKeys = [] } = await query.graph({
    entity: "api_key",
    fields: ["id", "type", "title", "token"],
    filters: { type: "publishable" },
  });

  if (existingApiKeys.length > 0) {
    publishableKeyId = String(existingApiKeys[0].id);
    publishableKeyToken = String(existingApiKeys[0].token ?? "");
  } else {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Mystic Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableKeyId = String((result as Array<{ id: string; token?: string }>)[0].id);
    publishableKeyToken = String((result as Array<{ id: string; token?: string }>)[0].token ?? "");
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableKeyId,
      add: [defaultSalesChannel[0].id],
    },
  });

  const { data: paymentProviders = [] } = await query
    .graph({
      entity: "payment_provider",
      fields: ["id"],
      pagination: { take: 100 },
    })
    .catch(() => ({ data: [] as Record<string, unknown>[] }));

  const stripeProviderIds = paymentProviders
    .map((provider) => String(provider.id || ""))
    .filter((providerId) => {
      const normalized = providerId.toLowerCase();

      if (normalized === "stripe" || normalized === "pp_stripe_stripe") {
        return true;
      }

      return normalized.endsWith("_stripe") && !normalized.includes("stripe-");
    });

  if (!stripeProviderIds.length) {
    throw new Error(
      "No Stripe payment provider found. Configure STRIPE_API_KEY in services/medusa/.env, restart Medusa, then rerun import.",
    );
  }

  const { data: existingRegions = [] } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: "Europe" },
  });

  if (!existingRegions.length) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries: regionCountries,
            payment_providers: stripeProviderIds,
          },
        ],
      },
    });

    try {
      await createTaxRegionsWorkflow(container).run({
        input: regionCountries.map((country_code) => ({
          country_code,
          provider_id: "tp_system",
        })),
      });
    } catch {
      logger.warn("Tax regions already exist or failed to create. Continuing...");
    }
  }

  let shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });

    shippingProfiles = result as Array<{ id: string; type: string }>;
  }

  const shippingProfileId = shippingProfiles[0].id;

  const { data: existingCategories = [] } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  const categoryIdByName = new Map<string, string>();
  for (const category of existingCategories) {
    categoryIdByName.set(String(category.name), String(category.id));
  }

  const categoryNames = Array.from(
    new Set(
      rawProducts.flatMap((product) =>
        product.product.categories.map((category) => normalizeCategory(category.name)),
      ),
    ),
  ).filter(Boolean);

  const missingCategoryNames = categoryNames.filter((name) => !categoryIdByName.has(name));

  if (missingCategoryNames.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategoryNames.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });

    for (const category of result as Array<{ id: string; name: string }>) {
      categoryIdByName.set(category.name, category.id);
    }
  }

  const { data: existingProducts = [] } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });

  const existingHandles = new Set(existingProducts.map((product) => String(product.handle)));

  const productsToCreate = rawProducts
    .filter((entry) => !existingHandles.has(entry.slug))
    .map((entry) => {
      const parsedPrice = parsePrice(entry.product.price);

      return {
        title: entry.title,
        handle: entry.slug,
        description: entry.content_text,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfileId,
        category_ids: entry.product.categories
          .map((category) => categoryIdByName.get(normalizeCategory(category.name)))
          .filter((value): value is string => Boolean(value)),
        images: entry.product.images
          .map((image) => normalizeImageUrl(image))
          .filter(Boolean)
          .map((url) => ({ url })),
        metadata: {
          seo_description: entry.seo_description,
          legacy_product_id: String(entry.id),
          source: "woo-import",
        },
        options: [
          {
            title: "Format",
            values: ["Default"],
          },
        ],
        variants: [
          {
            title: "Default",
            sku: entry.product.sku || undefined,
            manage_inventory: false,
            allow_backorder: true,
            options: {
              Format: "Default",
            },
            prices:
              parsedPrice === null
                ? []
                : [
                    {
                      amount: parsedPrice,
                      currency_code: "eur",
                    },
                    {
                      amount: convertEurToPln(parsedPrice),
                      currency_code: "pln",
                    },
                  ],
          },
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }],
      };
    });

  if (!productsToCreate.length) {
    logger.info("No new products to import (all handles already exist).");
    logger.info(`Publishable API key id: ${publishableKeyId}`);
    if (publishableKeyToken) {
      logger.info(`Publishable API key token: ${publishableKeyToken}`);
    }
    return;
  }

  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info(`Imported ${productsToCreate.length} products.`);
  logger.info(`Publishable API key id: ${publishableKeyId}`);
  if (publishableKeyToken) {
    logger.info(`Publishable API key token: ${publishableKeyToken}`);
  }
  logger.info("Done.");
}
