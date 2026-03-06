import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createPricePreferencesWorkflow,
  createServiceZonesWorkflow,
  createRegionsWorkflow,
  createTaxRatesWorkflow,
  deleteShippingOptionsWorkflow,
  deleteTaxRatesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateTaxRegionsWorkflow,
  updatePricePreferencesWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const EUROPE_COUNTRIES = [
  "al",
  "ad",
  "at",
  "be",
  "ba",
  "bg",
  "by",
  "ch",
  "cy",
  "cz",
  "de",
  "dk",
  "ee",
  "es",
  "fi",
  "fo",
  "fr",
  "gb",
  "gg",
  "gi",
  "gr",
  "hr",
  "hu",
  "ie",
  "is",
  "it",
  "je",
  "li",
  "lt",
  "lu",
  "lv",
  "mc",
  "md",
  "me",
  "mk",
  "mt",
  "nl",
  "no",
  "pt",
  "ro",
  "rs",
  "se",
  "si",
  "sk",
  "sm",
  "ua",
  "va",
] as const;

const NORTH_AMERICA_COUNTRIES = ["us", "ca", "mx"] as const;

const APAC_COUNTRIES = [
  "au",
  "nz",
  "cn",
  "jp",
  "kr",
  "tw",
  "hk",
  "sg",
  "my",
  "th",
  "vn",
  "id",
  "ph",
  "in",
  "pk",
  "bd",
  "lk",
  "np",
  "kh",
  "la",
  "mm",
  "bn",
  "mn",
  "kz",
  "uz",
  "kg",
  "tj",
  "tm",
  "az",
  "am",
  "ge",
  "fj",
  "pg",
] as const;

const EUROPE_NEARBY_COUNTRIES = ["de", "cz", "sk", "lt", "lv", "at", "hu"] as const;

const BASE_MANAGED_SHIPPING_OPTIONS = [
  {
    regionName: "Poland",
    serviceZoneName: "Poland Dispatch v2 - Poland",
    name: "Standard Shipping - Poland",
    amount: 20,
    eta: "1-3 business days",
  },
  {
    regionName: "Europe",
    serviceZoneName: "Poland Dispatch v2 - Europe Nearby",
    name: "Standard Shipping - Europe Nearby",
    amount: 9,
    eta: "2-5 business days",
  },
  {
    regionName: "Europe",
    serviceZoneName: "Poland Dispatch v2 - Europe Extended",
    name: "Standard Shipping - Europe Extended",
    amount: 12,
    eta: "3-7 business days",
  },
  {
    regionName: "North America",
    serviceZoneName: "Poland Dispatch v2 - North America",
    name: "Standard Shipping - North America",
    amount: 24,
    eta: "6-10 business days",
  },
  {
    regionName: "Asia Pacific",
    serviceZoneName: "Poland Dispatch v2 - Asia Pacific",
    name: "Standard Shipping - Asia Pacific",
    amount: 30,
    eta: "7-12 business days",
  },
  {
    regionName: "Rest of World",
    serviceZoneName: "Poland Dispatch v2 - Rest of World",
    name: "Standard Shipping - Rest of World",
    amount: 38,
    eta: "8-14 business days",
  },
] as const;

const FREE_SHIPPING_NAME_PREFIX = "Free Shipping - Starter Packs - ";

const FREE_MANAGED_SHIPPING_OPTIONS = BASE_MANAGED_SHIPPING_OPTIONS.map((option) => ({
  ...option,
  name: `${FREE_SHIPPING_NAME_PREFIX}${option.name.replace("Standard Shipping - ", "")}`,
  amount: 0,
  eta: `${option.eta} (Essence of Madagascar / Taste of Madagascar only)`,
}));

const MANAGED_SHIPPING_OPTIONS = [
  ...BASE_MANAGED_SHIPPING_OPTIONS,
  ...FREE_MANAGED_SHIPPING_OPTIONS,
] as const;

const LEGACY_FREE_SHIPPING_OPTION_NAMES = [
  "Free Shipping - Orders over 200 EUR - Poland",
  "Free Shipping - Orders over 200 EUR - Europe Nearby",
  "Free Shipping - Orders over 200 EUR - Europe Extended",
  "Free Shipping - Orders over 200 EUR - North America",
  "Free Shipping - Orders over 200 EUR - Asia Pacific",
  "Free Shipping - Orders over 200 EUR - Rest of World",
  "Free Shipping - Starter Packs - Poland",
  "Free Shipping - Starter Packs - Europe",
  "Free Shipping - Starter Packs - North America",
  "Free Shipping - Starter Packs - Asia Pacific",
  "Free Shipping - Starter Packs - Rest of World",
  "Free Shipping - Poland",
  "Free Shipping - Europe",
  "Free Shipping - North America",
  "Free Shipping - Asia Pacific",
  "Free Shipping - Rest of World",
  "Free Shipping - Orders over 200 EUR - Europe",
] as const;

const LEGACY_SHIPPING_OPTION_NAMES = [
  "Standard Shipping",
  "Express Shipping",
  "Standard Shipping - Europe",
] as const;

const FULFILLMENT_SET_NAME = "Global Delivery from Poland v2";
const EU_REVERSE_CHARGE_PROVIDER_PREFIX = "tp_eu-reverse-charge";

const EU_VAT_COUNTRIES = [
  "at",
  "be",
  "bg",
  "hr",
  "cy",
  "cz",
  "dk",
  "ee",
  "fi",
  "fr",
  "de",
  "gr",
  "hu",
  "ie",
  "it",
  "lv",
  "lt",
  "lu",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "si",
  "es",
  "se",
] as const;

const EU_VAT_RATE_MATRIX: Record<string, { reduced: number; standard: number }> = {
  at: { reduced: 10, standard: 20 },
  be: { reduced: 6, standard: 21 },
  bg: { reduced: 20, standard: 20 },
  hr: { reduced: 13, standard: 25 },
  cy: { reduced: 5, standard: 19 },
  cz: { reduced: 12, standard: 21 },
  dk: { reduced: 25, standard: 25 },
  ee: { reduced: 22, standard: 22 },
  fi: { reduced: 14, standard: 25.5 },
  fr: { reduced: 5.5, standard: 20 },
  de: { reduced: 7, standard: 19 },
  gr: { reduced: 13, standard: 24 },
  hu: { reduced: 18, standard: 27 },
  ie: { reduced: 13.5, standard: 23 },
  it: { reduced: 10, standard: 22 },
  lv: { reduced: 21, standard: 21 },
  lt: { reduced: 21, standard: 21 },
  lu: { reduced: 3, standard: 17 },
  mt: { reduced: 18, standard: 18 },
  nl: { reduced: 9, standard: 21 },
  pl: { reduced: 8, standard: 23 },
  pt: { reduced: 6, standard: 23 },
  ro: { reduced: 9, standard: 19 },
  sk: { reduced: 19, standard: 23 },
  si: { reduced: 9.5, standard: 22 },
  es: { reduced: 10, standard: 21 },
  se: { reduced: 12, standard: 25 },
};

const LEGACY_MANAGED_TAX_RATE_CODES = ["pl_vat_reduced_8", "pl_vat_standard_cacao_extract_23"] as const;

const getReducedVatCode = (countryCode: string) => `eu_${countryCode}_vat_reduced_spices`;

const getStandardVatOverrideCode = (countryCode: string) =>
  `eu_${countryCode}_vat_standard_cacao_extract`;

const HIGH_VAT_CATEGORY_NAMES = new Set(["cocoa", "vanilla extracts"]);
const HIGH_VAT_HANDLE_KEYWORDS = ["cacao", "cocoa", "extract"] as const;

const unique = (items: string[]) => [...new Set(items)];

const toCountryCode = (value: unknown) => String(value || "").toLowerCase();

const toLowerText = (value: unknown) => String(value || "").toLowerCase();

const getCategoryNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => toLowerText((entry as Record<string, unknown>)?.name))
    .filter(Boolean);
};

const isHighVatProduct = (product: Record<string, unknown>) => {
  const handle = toLowerText(product.handle);
  const title = toLowerText(product.title);
  const categoryNames = getCategoryNames(product.categories);

  if (categoryNames.some((name) => HIGH_VAT_CATEGORY_NAMES.has(name))) {
    return true;
  }

  return HIGH_VAT_HANDLE_KEYWORDS.some((keyword) => handle.includes(keyword) || title.includes(keyword));
};

export default async function setupCheckoutInfra({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string) => void;
    warn: (msg: string) => void;
  };
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
  };
  const link = container.resolve(ContainerRegistrationKeys.LINK) as {
    create: (input: Record<string, unknown>) => Promise<unknown>;
  };
  const storeModuleService = container.resolve(Modules.STORE) as {
    listStores: () => Promise<Array<{ id: string }>>;
  };
  const taxModuleService = container.resolve(Modules.TAX) as {
    listTaxProviders: (filters?: Record<string, unknown>) => Promise<Array<{ id: string }>>;
  };
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as {
    listSalesChannels: (filters: Record<string, unknown>) => Promise<Array<{ id: string; name: string }>>;
  };
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT) as {
    listShippingProfiles: (filters: Record<string, unknown>) => Promise<Array<{ id: string; type: string }>>;
    listFulfillmentSets?: (filters: Record<string, unknown>) => Promise<Array<{ id: string; service_zones: Array<{ id: string; name?: string }> }>>;
    createFulfillmentSets: (input: {
      name: string;
      type: "shipping";
      service_zones: Array<{
        name: string;
        geo_zones: Array<{ country_code: string; type: "country" }>;
      }>;
    }) => Promise<{ id: string; service_zones: Array<{ id: string; name?: string }> }>;
  };

  logger.info("Setting up checkout infrastructure...");

  const { data: countryRows = [] } = await query.graph({
    entity: "country",
    fields: ["iso_2"],
    pagination: { take: 500 },
  });

  const allCountries = unique(
    countryRows
      .map((row) => toCountryCode(row.iso_2))
      .filter((code) => code.length === 2)
  );

  if (!allCountries.length) {
    throw new Error("No countries found in the store. Cannot create global regions.");
  }

  const availableCountrySet = new Set(allCountries);

  const europeCountries = unique(EUROPE_COUNTRIES.map((c) => c.toLowerCase())).filter((code) =>
    availableCountrySet.has(code) && code !== "pl"
  );
  const europeNearbyCountries = unique(EUROPE_NEARBY_COUNTRIES.map((c) => c.toLowerCase())).filter((code) =>
    europeCountries.includes(code)
  );
  const europeExtendedCountries = europeCountries.filter((code) => !europeNearbyCountries.includes(code));
  const polandCountries = ["pl"].filter((code) =>
    availableCountrySet.has(code)
  );
  const northAmericaCountries = unique(NORTH_AMERICA_COUNTRIES.map((c) => c.toLowerCase())).filter((code) =>
    availableCountrySet.has(code)
  );
  const apacCountries = unique(APAC_COUNTRIES.map((c) => c.toLowerCase())).filter((code) =>
    availableCountrySet.has(code)
  );

  const assignedCountries = new Set([
    ...polandCountries,
    ...europeCountries,
    ...northAmericaCountries,
    ...apacCountries,
  ]);
  const restOfWorldCountries = allCountries.filter((code) => !assignedCountries.has(code));

  const { data: paymentProviders = [] } = await query
    .graph({
      entity: "payment_provider",
      fields: ["id"],
      pagination: { take: 100 },
    })
    .catch(() => ({ data: [] as Record<string, unknown>[] }));

  const providerIds = unique(
    paymentProviders
      .map((provider) => String(provider.id || ""))
      .filter((providerId) => {
        const normalized = providerId.toLowerCase();

        if (normalized === "stripe" || normalized === "pp_stripe_stripe") {
          return true;
        }

        return normalized.endsWith("_stripe") && !normalized.includes("stripe-");
      })
  );

  if (!providerIds.length) {
    throw new Error(
      "No Stripe payment provider found. Configure STRIPE_API_KEY in services/medusa/.env, restart Medusa, then rerun this script.",
    );
  }

  const regionConfigs = [
    {
      name: "Europe",
      currency_code: "eur",
      countries: europeCountries,
    },
    {
      name: "North America",
      currency_code: "usd",
      countries: northAmericaCountries,
    },
    {
      name: "Asia Pacific",
      currency_code: "usd",
      countries: apacCountries,
    },
    {
      name: "Rest of World",
      currency_code: "usd",
      countries: restOfWorldCountries,
    },
    {
      name: "Poland",
      currency_code: "pln",
      countries: polandCountries,
    },
  ].filter((region) => region.countries.length > 0);

  const regionCurrencyByName = new Map(
    regionConfigs.map((region) => [region.name, region.currency_code])
  );

  const regionIds = new Map<string, string>();

  for (const regionConfig of regionConfigs) {
    const { data: existingRegion = [] } = await query.graph({
      entity: "region",
      fields: ["id", "name"],
      filters: { name: regionConfig.name },
    });

    if (existingRegion.length) {
      await updateRegionsWorkflow(container).run({
        input: {
          selector: { id: String(existingRegion[0].id) },
          update: {
            currency_code: regionConfig.currency_code,
            automatic_taxes: true,
            is_tax_inclusive: true,
            countries: regionConfig.countries,
            payment_providers: providerIds,
          },
        },
      });

      regionIds.set(regionConfig.name, String(existingRegion[0].id));
      continue;
    }

    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: regionConfig.name,
            currency_code: regionConfig.currency_code,
            automatic_taxes: true,
            is_tax_inclusive: true,
            countries: regionConfig.countries,
            payment_providers: providerIds,
          },
        ],
      },
    });

    regionIds.set(regionConfig.name, String((result as Array<{ id: string }>)[0].id));
  }

  const managedPricePreferenceTargets = [
    ...Array.from(regionIds.values()).map((regionId) => ({
      attribute: "region_id",
      value: regionId,
    })),
    ...unique(regionConfigs.map((region) => region.currency_code)).map((currencyCode) => ({
      attribute: "currency_code",
      value: currencyCode,
    })),
  ];

  const { data: existingPricePreferences = [] } = await query.graph({
    entity: "price_preference",
    fields: ["id", "attribute", "value", "is_tax_inclusive"],
    filters: {
      $or: managedPricePreferenceTargets.map((target) => ({
        attribute: target.attribute,
        value: target.value,
      })),
    },
    pagination: { take: 500 },
  });

  const existingPricePreferenceIds = existingPricePreferences
    .map((preference) => String(preference.id || ""))
    .filter(Boolean);

  if (existingPricePreferenceIds.length) {
    await updatePricePreferencesWorkflow(container).run({
      input: {
        selector: {
          id: existingPricePreferenceIds,
        },
        update: {
          is_tax_inclusive: true,
        },
      },
    });
  }

  const existingPricePreferenceKeys = new Set(
    existingPricePreferences
      .map((preference) => {
        const attribute = String(preference.attribute || "").trim();
        const value = String(preference.value || "").trim();
        return attribute && value ? `${attribute}:${value}` : "";
      })
      .filter(Boolean)
  );

  const missingPricePreferences = managedPricePreferenceTargets.filter(
    (target) => !existingPricePreferenceKeys.has(`${target.attribute}:${target.value}`)
  );

  if (missingPricePreferences.length) {
    await createPricePreferencesWorkflow(container).run({
      input: missingPricePreferences.map((target) => ({
        attribute: target.attribute,
        value: target.value,
        is_tax_inclusive: true,
      })),
    });
  }

  logger.info(
    `Ensured tax-inclusive price preferences for ${managedPricePreferenceTargets.length} region/currency target(s).`
  );

  try {
    await createTaxRegionsWorkflow(container).run({
      input: allCountries.map((country_code) => ({ country_code, provider_id: "tp_system" })),
    });
  } catch {
    logger.warn("Some tax regions already exist. Continuing.");
  }

  const { data: existingCountryTaxRegions = [] } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "province_code"],
    filters: { country_code: allCountries },
    pagination: { take: 1000 },
  });

  const existingCountryCodes = new Set(
    existingCountryTaxRegions
      .filter((region) => !region.province_code)
      .map((region) => toCountryCode(region.country_code))
      .filter(Boolean)
  );

  const missingCountryTaxRegions = allCountries.filter((countryCode) => !existingCountryCodes.has(countryCode));

  if (missingCountryTaxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: missingCountryTaxRegions.map((country_code) => ({ country_code, provider_id: "tp_system" })),
    });

    logger.info(`Created ${missingCountryTaxRegions.length} missing top-level tax region(s).`);
  }

  const euVatCountriesWithoutPoland = EU_VAT_COUNTRIES.filter(
    (countryCode) => countryCode !== "pl" && availableCountrySet.has(countryCode)
  );

  const reverseChargeProviderRows = await taxModuleService
    .listTaxProviders()
    .catch(() => [] as Array<{ id: string }>);

  const reverseChargeProvider = reverseChargeProviderRows.find((provider) =>
    provider.id.startsWith(EU_REVERSE_CHARGE_PROVIDER_PREFIX)
  );

  if (reverseChargeProvider?.id && euVatCountriesWithoutPoland.length) {
    const { data: euTaxRegions = [] } = await query.graph({
      entity: "tax_region",
      fields: ["id", "country_code", "province_code", "provider_id"],
      filters: {
        country_code: euVatCountriesWithoutPoland,
      },
      pagination: { take: 300 },
    });

    const regionsToUpdate = euTaxRegions
      .filter((region) => !region.province_code)
      .filter((region) => region.provider_id !== reverseChargeProvider.id)
      .map((region) => ({
        id: String(region.id),
        provider_id: reverseChargeProvider.id,
      }));

    if (regionsToUpdate.length) {
      await updateTaxRegionsWorkflow(container).run({
        input: regionsToUpdate,
      });
      logger.info(`Attached EU reverse-charge tax provider to ${regionsToUpdate.length} EU tax region(s).`);
    }
  } else {
    const { data: euTaxRegionsWithFallback = [] } = await query.graph({
      entity: "tax_region",
      fields: ["id", "country_code", "province_code", "provider_id"],
      filters: {
        country_code: euVatCountriesWithoutPoland,
      },
      pagination: { take: 300 },
    });

    const regionsToFallback = euTaxRegionsWithFallback
      .filter((region) => !region.province_code)
      .filter((region) => String(region.provider_id || "").startsWith(EU_REVERSE_CHARGE_PROVIDER_PREFIX))
      .map((region) => ({
        id: String(region.id),
        provider_id: "tp_system",
      }));

    if (regionsToFallback.length) {
      await updateTaxRegionsWorkflow(container).run({
        input: regionsToFallback,
      });

      logger.warn(
        `EU reverse-charge provider is unavailable. Reverted ${regionsToFallback.length} EU tax region(s) to tp_system to prevent checkout errors.`
      );
    }

    logger.warn(
      "EU reverse-charge tax provider is not active yet. Restart backend and rerun setup to attach provider to EU tax regions."
    );
    if (reverseChargeProviderRows.length) {
      logger.warn(
        `Available tax providers: ${reverseChargeProviderRows.map((provider) => provider.id).join(", ")}`
      );
    }
  }

  const euVatCountriesInStore = EU_VAT_COUNTRIES.filter((countryCode) =>
    availableCountrySet.has(countryCode)
  );

  const { data: euTaxRegions = [] } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "province_code"],
    filters: { country_code: euVatCountriesInStore },
    pagination: { take: 400 },
  });

  const taxRegionIdByCountry = new Map<string, string>();

  for (const region of euTaxRegions) {
    const countryCode = toCountryCode(region.country_code);

    if (!region.province_code && countryCode) {
      taxRegionIdByCountry.set(countryCode, String(region.id));
    }
  }

  if (!taxRegionIdByCountry.has("pl")) {
    throw new Error("Poland tax region was not found. Cannot configure VAT rates.");
  }

  const managedTaxRegionIds = Array.from(taxRegionIdByCountry.values());

  const managedTaxCodes = [
    ...euVatCountriesInStore.map(getReducedVatCode),
    ...euVatCountriesInStore.map(getStandardVatOverrideCode),
    ...LEGACY_MANAGED_TAX_RATE_CODES,
  ];

  const { data: existingManagedTaxRates = [] } = await query.graph({
    entity: "tax_rate",
    fields: ["id", "code", "tax_region_id"],
    filters: {
      tax_region_id: managedTaxRegionIds,
      code: managedTaxCodes,
    },
    pagination: { take: 2000 },
  });

  const existingManagedTaxRateIds = existingManagedTaxRates
    .map((rate) => String(rate.id || ""))
    .filter(Boolean);

  if (existingManagedTaxRateIds.length) {
    await deleteTaxRatesWorkflow(container).run({
      input: {
        ids: existingManagedTaxRateIds,
      },
    });
  }

  let productsForTaxClassification: Record<string, unknown>[] = [];

  try {
    const { data = [] } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "title", "categories.id", "categories.name"],
      pagination: { take: 1000 },
    });

    productsForTaxClassification = data;
  } catch {
    const { data = [] } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "title"],
      pagination: { take: 1000 },
    });

    productsForTaxClassification = data;
    logger.warn("Product categories could not be loaded. Falling back to handle/title tax classification.");
  }

  const highVatProductIds = unique(
    productsForTaxClassification
      .filter(isHighVatProduct)
      .map((product) => String(product.id || ""))
      .filter(Boolean)
  );

  const taxRatesToCreate: Array<{
    tax_region_id: string;
    name: string;
    code: string;
    rate: number;
    is_default?: boolean;
    rules?: Array<{ reference: string; reference_id: string }>;
    metadata?: Record<string, string>;
  }> = [];

  for (const countryCode of euVatCountriesInStore) {
    const taxRegionId = taxRegionIdByCountry.get(countryCode);
    const vatConfig = EU_VAT_RATE_MATRIX[countryCode];

    if (!taxRegionId) {
      logger.warn(`Tax region not found for EU country ${countryCode.toUpperCase()}. Skipping VAT setup.`);
      continue;
    }

    if (!vatConfig) {
      logger.warn(`VAT matrix missing for ${countryCode.toUpperCase()}. Skipping VAT setup.`);
      continue;
    }

    taxRatesToCreate.push({
      tax_region_id: taxRegionId,
      name: `${countryCode.toUpperCase()} VAT Reduced (Spices)`,
      code: getReducedVatCode(countryCode),
      rate: vatConfig.reduced,
      is_default: true,
      metadata: {
        managed_by: "setup-checkout-infra",
        vat_matrix_country: countryCode,
      },
    });

    if (highVatProductIds.length && vatConfig.standard !== vatConfig.reduced) {
      taxRatesToCreate.push({
        tax_region_id: taxRegionId,
        name: `${countryCode.toUpperCase()} VAT Standard (Cacao & Extracts)`,
        code: getStandardVatOverrideCode(countryCode),
        rate: vatConfig.standard,
        rules: highVatProductIds.map((productId) => ({
          reference: "product",
          reference_id: productId,
        })),
        metadata: {
          managed_by: "setup-checkout-infra",
          vat_matrix_country: countryCode,
        },
      });
    }
  }

  if (!highVatProductIds.length) {
    logger.warn(
      "No cacao/extract products found for standard VAT overrides. Reduced VAT default will apply to all managed EU countries."
    );
  }

  if (!taxRatesToCreate.length) {
    throw new Error("No EU VAT rates were generated. Cannot continue checkout tax setup.");
  }

  await createTaxRatesWorkflow(container).run({
    input: taxRatesToCreate,
  });

  logger.info(
    `Configured EU VAT matrix for ${euVatCountriesInStore.length} country(s); managed ${taxRatesToCreate.length} tax rate(s) with ${highVatProductIds.length} high-VAT product override target(s).`
  );

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

  const { data: existingLocations = [] } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: "Main Warehouse Poznan" },
  });

  let stockLocationId = existingLocations[0]?.id ? String(existingLocations[0].id) : "";

  if (!stockLocationId) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Main Warehouse Poznan",
            address: {
              city: "Poznan",
              country_code: "PL",
              address_1: "Warehouse",
            },
          },
        ],
      },
    });

    stockLocationId = String((result as Array<{ id: string }>)[0].id);
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
        default_location_id: stockLocationId,
      },
    },
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocationId,
      add: [defaultSalesChannel[0].id],
    },
  });

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocationId,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch {
    logger.warn("Stock location <> fulfillment provider link already exists.");
  }

  let shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });

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

  let fulfillmentSetId = "";
  const serviceZoneIdByName = new Map<string, string>();

  const serviceZonesInput = [
    { name: "Poland Dispatch v2 - Poland", countries: polandCountries },
    { name: "Poland Dispatch v2 - Europe Nearby", countries: europeNearbyCountries },
    { name: "Poland Dispatch v2 - Europe Extended", countries: europeExtendedCountries },
    { name: "Poland Dispatch v2 - North America", countries: northAmericaCountries },
    { name: "Poland Dispatch v2 - Asia Pacific", countries: apacCountries },
    { name: "Poland Dispatch v2 - Rest of World", countries: restOfWorldCountries },
  ].filter((zone) => zone.countries.length > 0);

  if (fulfillmentModuleService.listFulfillmentSets) {
    const existingSets = await fulfillmentModuleService.listFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
    });
    if (existingSets.length) {
      fulfillmentSetId = existingSets[0].id;
      try {
        const { data: existingServiceZones = [] } = await query.graph({
          entity: "service_zone",
          fields: ["id", "name", "fulfillment_set_id"],
          filters: { fulfillment_set_id: fulfillmentSetId },
          pagination: { take: 100 },
        });

        for (const zone of existingServiceZones) {
          if (zone.name && zone.id) {
            serviceZoneIdByName.set(String(zone.name), String(zone.id));
          }
        }
      } catch {
        for (let i = 0; i < serviceZonesInput.length; i++) {
          const zoneId = existingSets[0].service_zones[i]?.id;
          if (zoneId) {
            serviceZoneIdByName.set(serviceZonesInput[i].name, zoneId);
          }
        }
      }

      const missingServiceZones = serviceZonesInput.filter((zone) => !serviceZoneIdByName.has(zone.name));

      if (missingServiceZones.length) {
        const { result } = await createServiceZonesWorkflow(container).run({
          input: {
            data: missingServiceZones.map((zone) => ({
              name: zone.name,
              fulfillment_set_id: fulfillmentSetId,
              geo_zones: zone.countries.map((country_code) => ({
                country_code,
                type: "country" as const,
              })),
            })),
          },
        });

        const createdZones = result as Array<{ id: string; name: string }>;
        for (const zone of createdZones) {
          serviceZoneIdByName.set(zone.name, zone.id);
        }
      }
    }
  }

  if (!fulfillmentSetId) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: serviceZonesInput.map((zone) => ({
        name: zone.name,
        geo_zones: zone.countries.map((country_code) => ({
          country_code,
          type: "country",
        })),
      })),
    });

    fulfillmentSetId = fulfillmentSet.id;
    for (let i = 0; i < serviceZonesInput.length; i++) {
      const zoneId = fulfillmentSet.service_zones[i]?.id;
      if (zoneId) {
        serviceZoneIdByName.set(serviceZonesInput[i].name, zoneId);
      }
    }
  }

  if (serviceZoneIdByName.size !== serviceZonesInput.length) {
    throw new Error("Could not resolve fulfillment service zones for global shipping setup.");
  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocationId,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSetId,
      },
    });
  } catch {
    logger.warn("Stock location <> fulfillment set link already exists.");
  }

  const managedNames = [
    ...MANAGED_SHIPPING_OPTIONS.map((option) => option.name),
    ...LEGACY_SHIPPING_OPTION_NAMES,
    ...LEGACY_FREE_SHIPPING_OPTION_NAMES,
  ];

  const { data: existingShippingOptions = [] } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: managedNames },
  });

  const existingManagedOptionIds = existingShippingOptions
    .map((option) => String(option.id || ""))
    .filter(Boolean);

  if (existingManagedOptionIds.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: {
        ids: existingManagedOptionIds,
      },
    });
  }

  const shippingOptionsToCreate = MANAGED_SHIPPING_OPTIONS.map((option) => {
    const serviceZoneId = serviceZoneIdByName.get(option.serviceZoneName);
    const regionId = regionIds.get(option.regionName);
    const regionCurrency = regionCurrencyByName.get(option.regionName);
    const isFreeShippingOption = option.name.startsWith(FREE_SHIPPING_NAME_PREFIX);

    if (!serviceZoneId || !regionId || !regionCurrency) {
      return null;
    }

    return {
      name: option.name,
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfiles[0].id,
      type: {
        label: isFreeShippingOption ? "Free" : "Standard",
        description: option.eta,
        code: `${isFreeShippingOption ? "free" : "standard"}_${option.regionName
          .toLowerCase()
          .replace(/\s+/g, "_")}`,
      },
      prices: [
        {
          region_id: regionId,
          amount: option.amount,
        },
        {
          currency_code: regionCurrency,
          amount: option.amount,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq" as const,
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq" as const,
        },
      ],
    };
  }).filter((option): option is NonNullable<typeof option> => Boolean(option));

  if (!shippingOptionsToCreate.length) {
    throw new Error("No shipping options were created. Check region and zone setup.");
  }

  await createShippingOptionsWorkflow(container).run({
    input: shippingOptionsToCreate,
  });

  logger.info("Checkout infrastructure is ready.");
}
