/**
 * The identity and the third parties behind the site.
 *
 * Everything here is a legal statement, so nothing in it is invented. A fact
 * nobody has supplied yet stays `TBD`: the page renders it as a visible gap and
 * `LEGAL_COMPLETE` goes false, which keeps the three legal pages out of the
 * search index until someone fills them in.
 */

/** A legal fact that still has to come from the operator. */
export const TBD = "TBD";

/** Revision date shown on all three pages. Bump it whenever the text changes. */
export const LEGAL_UPDATED = "2026-09-01";

export type LegalField = keyof typeof COMPANY;

export const COMPANY = {
  legalName: TBD,
  legalForm: TBD,
  capital: TBD,
  address: TBD,
  registry: TBD,
  siret: TBD,
  vat: TBD,
  publisher: TBD,
  phone: TBD,
  email: "contact@rideglow.example",
  /**
   * Mandatory on a French consumer site: article L612-1 of the consumer code
   * makes every trader name a mediator the buyer can go to for free.
   */
  mediator: TBD,
  mediatorUrl: TBD,
} as const;

/** Where the site runs. The name comes from the deploy target in README.md. */
export const HOST = {
  name: "Vercel Inc.",
  url: "https://vercel.com",
  // Article 6 III of the LCEN wants the host's address and phone number too,
  // not just its name.
  address: TBD,
  phone: TBD,
} as const;

/**
 * Who else touches an order. Named at entity and country level: that is what a
 * privacy notice has to disclose, and a street address copied from memory is
 * the kind of detail that ages into a false statement.
 */
export const PROCESSORS = [
  { key: "stripe", name: "Stripe Payments Europe, Ltd.", country: "IE" },
  { key: "vercel", name: "Vercel Inc.", country: "US" },
  { key: "neon", name: "Neon", country: "US" },
  { key: "resend", name: "Resend", country: "US" },
] as const;

export type ProcessorKey = (typeof PROCESSORS)[number]["key"];

/** True once every fact above has been supplied. */
export const LEGAL_COMPLETE = ![...Object.values(COMPANY), ...Object.values(HOST)].some(
  (value: string) => value === TBD,
);
