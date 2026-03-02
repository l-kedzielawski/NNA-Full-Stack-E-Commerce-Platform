import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

const ESSENCE_HANDLE = "essence-of-madagascar-premium-bourbon-vanilla-collection-in-glass-tubes";
const TASTE_HANDLE = "taste-of-madagascar";
const ESSENCE_PRICE_EUR = 40;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default async function setupStarterPackOffer({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string) => void;
    warn: (msg: string) => void;
  };
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
  };

  const targetHandles = [ESSENCE_HANDLE, TASTE_HANDLE];

  const { data: products = [] } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "variants.id", "variants.sku"],
    filters: { handle: targetHandles },
    pagination: { take: 20 },
  });

  if (!products.length) {
    throw new Error("Starter pack products were not found in Medusa.");
  }

  const productsByHandle = new Map<string, Record<string, unknown>>();
  for (const product of products) {
    productsByHandle.set(String(product.handle), product);
  }

  const updates: Array<Record<string, unknown>> = [];

  for (const handle of targetHandles) {
    const product = productsByHandle.get(handle);
    if (!product) {
      logger.warn(`Product not found for handle: ${handle}`);
      continue;
    }

    const variants = Array.isArray(product.variants)
      ? (product.variants as Array<Record<string, unknown>>)
      : [];
    const primaryVariant = variants[0];

    if (!primaryVariant?.id) {
      logger.warn(`No variant found for starter pack handle: ${handle}`);
      continue;
    }

    const currentMetadata = isObject(product.metadata) ? product.metadata : {};
    const updateInput: Record<string, unknown> = {
      id: String(product.id),
      metadata: {
        ...currentMetadata,
        starter_pack: true,
        free_shipping_eligible: true,
      },
    };

    if (handle === ESSENCE_HANDLE) {
      updateInput.variants = [
        {
          id: String(primaryVariant.id),
          prices: [
            {
              currency_code: "eur",
              amount: ESSENCE_PRICE_EUR,
            },
          ],
        },
      ];
    }

    updates.push(updateInput);
  }

  if (!updates.length) {
    throw new Error("No starter pack updates were prepared.");
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: updates,
    },
  });

  logger.info(`Starter pack offer configured. Essence price set to EUR ${ESSENCE_PRICE_EUR}.`);
}
