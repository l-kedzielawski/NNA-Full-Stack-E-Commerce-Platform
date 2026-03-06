import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getNumberLocale(currencyCode: string, locale?: string): string {
  if (locale) {
    return locale;
  }

  return currencyCode.toUpperCase() === "PLN" ? "pl-PL" : "en-GB";
}

export function formatPrice(price: number | null, options?: { currencyCode?: string; locale?: string }): string {
  if (price === null || Number.isNaN(price)) {
    return options?.locale?.startsWith("pl") ? "Wycena B2B" : "Bulk quote";
  }

  const currencyCode = (options?.currencyCode || "EUR").toUpperCase();
  const numberLocale = getNumberLocale(currencyCode, options?.locale);

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(price);
}

export function truncateText(value: string, maxLength = 170): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}
