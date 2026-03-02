import { ITaxProvider, TaxTypes } from "@medusajs/framework/types";
import { ModuleProvider, Modules } from "@medusajs/framework/utils";

const EU_COUNTRY_CODES = new Set([
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

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
};

const normalizeCountryCode = (value: unknown): string => String(value || "").trim().toLowerCase();

const getVatPrefixForCountry = (countryCode: string): string => {
  if (countryCode === "gr") {
    return "EL";
  }

  return countryCode.toUpperCase();
};

type Metadata = Record<string, unknown>;

const mergeMetadata = (context: TaxTypes.TaxCalculationContext): Metadata => {
  const customerMetadata = (context.customer?.metadata || {}) as Metadata;
  const addressMetadata = (context.address.metadata || {}) as Metadata;

  return {
    ...customerMetadata,
    ...addressMetadata,
  };
};

const shouldApplyReverseCharge = (context: TaxTypes.TaxCalculationContext): boolean => {
  const countryCode = normalizeCountryCode(context.address.country_code);

  if (!countryCode || countryCode === "pl" || !EU_COUNTRY_CODES.has(countryCode)) {
    return false;
  }

  const metadata = mergeMetadata(context);
  const reverseChargeValid = toBoolean(metadata.eu_reverse_charge_valid);
  const reverseChargeCountry = normalizeCountryCode(metadata.eu_reverse_charge_country);
  const vatNumber = String(metadata.eu_vat_number || "").trim().toUpperCase();

  if (!reverseChargeValid || !vatNumber) {
    return false;
  }

  if (reverseChargeCountry !== countryCode) {
    return false;
  }

  const expectedPrefix = getVatPrefixForCountry(countryCode);
  return vatNumber.startsWith(expectedPrefix);
};

export class EuReverseChargeTaxProvider implements ITaxProvider {
  static identifier = "eu-reverse-charge";

  getIdentifier(): string {
    return EuReverseChargeTaxProvider.identifier;
  }

  async getTaxLines(
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[],
    context: TaxTypes.TaxCalculationContext
  ): Promise<(TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[]> {
    const reverseCharge = shouldApplyReverseCharge(context);

    const itemTaxLines: TaxTypes.ItemTaxLineDTO[] = itemLines.flatMap((line) =>
      line.rates.map((rate) => ({
        rate_id: rate.id,
        rate: reverseCharge ? 0 : rate.rate || 0,
        name: reverseCharge ? `${rate.name} (EU reverse charge)` : rate.name,
        code: rate.code,
        line_item_id: line.line_item.id,
        provider_id: this.getIdentifier(),
      }))
    );

    const shippingTaxLines: TaxTypes.ShippingTaxLineDTO[] = shippingLines.flatMap((line) =>
      line.rates.map((rate) => ({
        rate_id: rate.id,
        rate: reverseCharge ? 0 : rate.rate || 0,
        name: reverseCharge ? `${rate.name} (EU reverse charge)` : rate.name,
        code: rate.code,
        shipping_line_id: line.shipping_line.id,
        provider_id: this.getIdentifier(),
      }))
    );

    return [...itemTaxLines, ...shippingTaxLines];
  }
}

export default ModuleProvider(Modules.TAX, {
  services: [EuReverseChargeTaxProvider],
});
