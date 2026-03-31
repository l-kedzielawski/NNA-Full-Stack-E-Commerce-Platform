export type PublicPromotionBanner = {
  code: string;
  percentage: number;
  starts_at?: string | null;
  ends_at?: string | null;
  cta_href?: string | null;
  message_en?: string | null;
  message_pl?: string | null;
};

function toLocalizedAmountLabel(value: number, locale: "en" | "pl") {
  return locale === "pl" ? `${value}% rabatu` : `${value}% off`;
}

export function getPublicPromotionBannerText(
  promotion: PublicPromotionBanner,
  locale: "en" | "pl",
): string {
  const custom = locale === "pl" ? promotion.message_pl : promotion.message_en;
  if (custom && custom.trim()) {
    return custom.trim();
  }

  const valueLabel = toLocalizedAmountLabel(promotion.percentage, locale);
  return locale === "pl"
    ? `Z kodem zyskujesz ${valueLabel}`
    : `Use code for ${valueLabel}`;
}
