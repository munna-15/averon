import type { Money } from "@/types/product";

/** Formats a minor-unit amount (e.g. cents) using the currency's own precision. */
export function formatMoney(
  { amount, currency }: Money,
  locale = "en-US",
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amount / 10 ** fractionDigits);
}
