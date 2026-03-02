import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { updateCartWorkflowId } from "@medusajs/medusa/core-flows";

const EU_COUNTRIES = new Set([
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
]);

const REVERSE_CHARGE_METADATA_KEYS = [
  "eu_vat_number",
  "eu_reverse_charge_valid",
  "eu_reverse_charge_country",
  "eu_reverse_charge_checked_at",
  "eu_reverse_charge_company_name",
  "eu_reverse_charge_source",
] as const;

type VatRequestBody = {
  vat_number?: string;
  country_code?: string;
  company_name?: string;
};

type ViesResponse = {
  isValid?: boolean;
  name?: string;
};

const toCountryCode = (value: unknown) => String(value || "").trim().toLowerCase();

const normalizeVatNumber = (value: unknown) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const getVatPrefixForCountry = (countryCode: string) => {
  if (countryCode === "gr") {
    return "EL";
  }

  return countryCode.toUpperCase();
};

const cleanReverseChargeMetadata = (metadata: unknown): Record<string, unknown> => {
  const source = metadata && typeof metadata === "object" ? { ...(metadata as Record<string, unknown>) } : {};

  for (const key of REVERSE_CHARGE_METADATA_KEYS) {
    delete source[key];
  }

  return source;
};

const mergeReverseChargeMetadata = (
  metadata: unknown,
  values: Record<string, unknown>
): Record<string, unknown> => {
  return {
    ...cleanReverseChargeMetadata(metadata),
    ...values,
  };
};

const getAddressUpdatePayload = (
  address: Record<string, unknown> | null | undefined,
  metadata: Record<string, unknown>
) => {
  if (!address?.id) {
    return undefined;
  }

  return {
    id: String(address.id),
    first_name: address.first_name as string | undefined,
    last_name: address.last_name as string | undefined,
    company: address.company as string | undefined,
    phone: address.phone as string | undefined,
    address_1: address.address_1 as string | undefined,
    address_2: address.address_2 as string | undefined,
    city: address.city as string | undefined,
    country_code: toCountryCode(address.country_code) || undefined,
    province: address.province as string | undefined,
    postal_code: address.postal_code as string | undefined,
    metadata,
  };
};

const fetchViesValidation = async (countryPrefix: string, vatBody: string): Promise<ViesResponse> => {
  const response = await fetch(
    `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryPrefix}/vat/${vatBody}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("VAT validation service is currently unavailable.");
  }

  return (await response.json()) as ViesResponse;
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id;
  const body = ((req.body || {}) as VatRequestBody) || {};

  const cartService = req.scope.resolve(Modules.CART) as unknown as {
    retrieveCart: (id: string, config?: Record<string, unknown>) => Promise<unknown>;
  };

  const workflowEngine = req.scope.resolve(Modules.WORKFLOW_ENGINE) as {
    run: (workflowId: string, input: { input: Record<string, unknown> }) => Promise<unknown>;
  };

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
  };

  const cart = (await cartService.retrieveCart(cartId, {
    relations: ["shipping_address", "billing_address"],
  })) as Record<string, unknown>;

  const shippingAddress = (cart.shipping_address || null) as Record<string, unknown> | null;
  const billingAddress = (cart.billing_address || null) as Record<string, unknown> | null;
  const shippingCountry = toCountryCode(body.country_code || shippingAddress?.country_code);
  const normalizedVatNumber = normalizeVatNumber(body.vat_number);
  const cartMetadata = cleanReverseChargeMetadata(cart.metadata);

  const clearReverseCharge = async (message: string) => {
    await workflowEngine.run(updateCartWorkflowId, {
      input: {
        id: cartId,
        metadata: cartMetadata,
        shipping_address: getAddressUpdatePayload(
          shippingAddress,
          cleanReverseChargeMetadata(shippingAddress?.metadata)
        ),
        billing_address: getAddressUpdatePayload(
          billingAddress,
          cleanReverseChargeMetadata(billingAddress?.metadata)
        ),
      },
    });

    return res.status(200).json({
      reverse_charge: false,
      message,
    });
  };

  if (!normalizedVatNumber) {
    return clearReverseCharge("No VAT number provided. Standard VAT applies.");
  }

  if (!shippingCountry) {
    return clearReverseCharge("Country is missing, so reverse-charge cannot be applied. Standard VAT applies.");
  }

  if (!EU_COUNTRIES.has(shippingCountry) || shippingCountry === "pl") {
    return clearReverseCharge(
      "Reverse-charge applies only to business orders shipped to EU countries outside Poland."
    );
  }

  if (normalizedVatNumber.length < 4) {
    return clearReverseCharge("VAT number is too short. Standard VAT applies.");
  }

  const vatPrefix = normalizedVatNumber.slice(0, 2);
  const vatBody = normalizedVatNumber.slice(2);
  const expectedPrefix = getVatPrefixForCountry(shippingCountry);

  if (vatPrefix !== expectedPrefix) {
    return clearReverseCharge(
      `VAT number country prefix must match shipping country (${expectedPrefix}). Standard VAT applies.`
    );
  }

  let validation: ViesResponse;

  try {
    validation = await fetchViesValidation(vatPrefix, vatBody);
  } catch (error) {
    return clearReverseCharge(
      error instanceof Error
        ? `${error.message} Standard VAT applies.`
        : "VAT validation failed. Standard VAT applies."
    );
  }

  if (!validation.isValid) {
    return clearReverseCharge("VAT number is invalid. Standard VAT applies.");
  }

  const resolvedCompanyName =
    (validation.name && validation.name !== "---" ? validation.name : body.company_name) || "";
  const reverseChargeMetadata = {
    eu_vat_number: normalizedVatNumber,
    eu_reverse_charge_valid: true,
    eu_reverse_charge_country: shippingCountry,
    eu_reverse_charge_checked_at: new Date().toISOString(),
    eu_reverse_charge_company_name: resolvedCompanyName,
    eu_reverse_charge_source: "vies",
  };

  await workflowEngine.run(updateCartWorkflowId, {
    input: {
      id: cartId,
      metadata: mergeReverseChargeMetadata(cart.metadata, reverseChargeMetadata),
      shipping_address: getAddressUpdatePayload(
        shippingAddress,
        mergeReverseChargeMetadata(shippingAddress?.metadata, reverseChargeMetadata)
      ),
      billing_address: getAddressUpdatePayload(
        billingAddress,
        mergeReverseChargeMetadata(billingAddress?.metadata, reverseChargeMetadata)
      ),
    },
  });

  const { data: refreshedCarts = [] } = await query.graph({
    entity: "cart",
    fields: ["id", "metadata", "tax_total", "total", "subtotal"],
    filters: { id: cartId },
  });

  return res.status(200).json({
    reverse_charge: true,
    vat_number: normalizedVatNumber,
    company_name: resolvedCompanyName || null,
    message: "EU VAT validated. Reverse-charge has been applied to this cart.",
    cart: refreshedCarts[0] || null,
  });
}
