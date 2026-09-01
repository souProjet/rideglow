import type { Locale } from "@/i18n/config";

const formatters = new Map<string, Intl.NumberFormat>();

/** Minor units in, localised currency string out. */
export function formatPrice(cents: number, locale: Locale): string {
  const key = `${locale}:eur`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(cents / 100);
}
