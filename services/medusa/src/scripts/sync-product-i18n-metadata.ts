import { readFile } from "node:fs/promises";
import path from "node:path";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
};

type Query = {
  graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
};

type ProductTranslationMap = Map<string, Record<string, Record<string, unknown>>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

function normalizeTranslationPayload(payload: unknown): ProductTranslationMap {
  const byHandle: ProductTranslationMap = new Map();

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      if (!isRecord(entry)) {
        continue;
      }

      const handle = typeof entry.handle === "string" ? entry.handle.trim() : "";
      const i18n = entry.i18n;

      if (!handle || !isRecord(i18n)) {
        continue;
      }

      const normalizedLocaleMap: Record<string, Record<string, unknown>> = {};

      for (const [locale, content] of Object.entries(i18n)) {
        if (!isRecord(content)) {
          continue;
        }

        normalizedLocaleMap[locale.trim().toLowerCase()] = { ...content };
      }

      if (Object.keys(normalizedLocaleMap).length > 0) {
        byHandle.set(handle, normalizedLocaleMap);
      }
    }

    return byHandle;
  }

  if (!isRecord(payload)) {
    return byHandle;
  }

  for (const [handle, localeMap] of Object.entries(payload)) {
    if (!handle.trim() || !isRecord(localeMap)) {
      continue;
    }

    const normalizedLocaleMap: Record<string, Record<string, unknown>> = {};

    for (const [locale, content] of Object.entries(localeMap)) {
      if (!isRecord(content)) {
        continue;
      }

      normalizedLocaleMap[locale.trim().toLowerCase()] = { ...content };
    }

    if (Object.keys(normalizedLocaleMap).length > 0) {
      byHandle.set(handle, normalizedLocaleMap);
    }
  }

  return byHandle;
}

async function loadTranslationFile(logger: Logger): Promise<ProductTranslationMap> {
  const filePath = process.env.PRODUCT_I18N_FILE?.trim();

  if (!filePath) {
    logger.info("PRODUCT_I18N_FILE not set. Syncing English baseline only.");
    return new Map();
  }

  const candidatePaths = path.isAbsolute(filePath)
    ? [filePath]
    : [
        path.resolve(process.cwd(), filePath),
        path.resolve(process.cwd(), "..", "..", filePath),
      ];

  const failures: string[] = [];

  for (const candidatePath of candidatePaths) {
    try {
      const raw = await readFile(candidatePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const map = normalizeTranslationPayload(parsed);
      logger.info(`Loaded translation entries for ${map.size} handles from ${candidatePath}`);
      return map;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${candidatePath}: ${reason}`);
    }
  }

  logger.warn(
    `Could not load PRODUCT_I18N_FILE. Tried: ${failures.join(" | ")}`,
  );
  return new Map();
}

export default async function syncProductI18nMetadata({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as Query;
  const translationMap = await loadTranslationFile(logger);

  const { data: products = [] } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "description", "metadata"],
  });

  const updates: Array<{ id: string; metadata: Record<string, unknown> }> = [];

  for (const product of products) {
    const id = String(product.id || "").trim();
    const handle = String(product.handle || "").trim();

    if (!id || !handle) {
      continue;
    }

    const productTitle = typeof product.title === "string" ? product.title.trim() : "";
    const productDescription =
      typeof product.description === "string" ? product.description.trim() : "";

    const currentMetadata = isRecord(product.metadata) ? { ...product.metadata } : {};
    const currentI18nRaw = currentMetadata.i18n;
    const currentI18n = isRecord(currentI18nRaw) ? { ...currentI18nRaw } : {};
    const currentEnglish = isRecord(currentI18n.en) ? { ...currentI18n.en } : {};

    if (productTitle && !("title" in currentEnglish)) {
      currentEnglish.title = productTitle;
    }

    if (productDescription && !("description" in currentEnglish)) {
      currentEnglish.description = productDescription;
    }

    const seoDescription =
      typeof currentMetadata.seo_description === "string"
        ? currentMetadata.seo_description.trim()
        : "";
    if (seoDescription && !("seo_description" in currentEnglish)) {
      currentEnglish.seo_description = seoDescription;
    }

    for (const [key, value] of Object.entries(currentMetadata)) {
      if (key.startsWith("custom_") && !(key in currentEnglish)) {
        currentEnglish[key] = value;
      }
    }

    const nextI18n: Record<string, unknown> = {
      ...currentI18n,
      en: currentEnglish,
    };

    const incomingLocales = translationMap.get(handle);
    if (incomingLocales) {
      for (const [locale, incomingContent] of Object.entries(incomingLocales)) {
        const normalizedLocale = locale.trim().toLowerCase();
        if (!normalizedLocale) {
          continue;
        }

        const existingLocaleContent = isRecord(nextI18n[normalizedLocale])
          ? { ...(nextI18n[normalizedLocale] as Record<string, unknown>) }
          : {};

        nextI18n[normalizedLocale] = {
          ...existingLocaleContent,
          ...incomingContent,
        };
      }
    }

    const nextMetadata: Record<string, unknown> = {
      ...currentMetadata,
      i18n: nextI18n,
    };

    if (stableJson(nextMetadata) !== stableJson(currentMetadata)) {
      updates.push({ id, metadata: nextMetadata });
    }
  }

  if (!updates.length) {
    logger.info("No product metadata changes required.");
    return;
  }

  const chunks = chunkArray(updates, 50);

  for (const chunk of chunks) {
    await updateProductsWorkflow(container).run({
      input: {
        products: chunk,
      },
    });
  }

  logger.info(
    `Updated i18n metadata for ${updates.length} products across ${chunks.length} workflow runs.`,
  );
}
