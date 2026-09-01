import type { Locale } from "@/i18n/config";

const formatters = new Map<string, Intl.NumberFormat>();

/** Minor units in, localized currency string out. */
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

const decimals = new Map<string, Intl.NumberFormat>();

/** Plain grouped integer: 1300 becomes "1 300" in French, "1,300" in English. */
export function formatNumber(value: number, locale: Locale): string {
  let formatter = decimals.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      maximumFractionDigits: 0,
    });
    decimals.set(locale, formatter);
  }
  return formatter.format(value);
}
