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

const dates = new Map<string, Intl.DateTimeFormat>();

/** ISO date in, long localized date out. Used for the legal pages' revision. */
export function formatDate(iso: string, locale: Locale): string {
  let formatter = dates.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    dates.set(locale, formatter);
  }
  return formatter.format(new Date(`${iso}T00:00:00Z`));
}

const regions = new Map<string, Intl.DisplayNames>();

/**
 * ISO 3166-1 alpha-2 in, country name in the reader's language out. The terms
 * of sale and the privacy notice both list countries, and translating twelve
 * of them by hand in two dictionaries is twenty-four chances to drift.
 */
export function formatCountry(code: string, locale: Locale): string {
  let names = regions.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale === "fr" ? "fr-FR" : "en-GB"], { type: "region" });
    regions.set(locale, names);
  }
  return names.of(code) ?? code;
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
