/**
 * What the home page tells a crawler that the rendered page cannot.
 *
 * Everything here is derived from `catalog.ts` and the dictionaries, never
 * retyped: a price that only lives in the structured data is a price that will
 * drift from the one the buyer is charged, and that is the one mismatch Google
 * penalises outright.
 */

import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { KITS, SHIPPING_COUNTRIES } from "@/lib/catalog";
import { absolute, SITE_URL } from "@/lib/site";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const PRODUCT_ID = `${SITE_URL}/#product`;

/** Minor units to the decimal string schema.org expects. */
function amount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function homeJsonLd(locale: Locale, t: Dictionary) {
  const prices = KITS.map((kit) => kit.priceCents);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "RideGlow",
        url: absolute(`/${locale}`),
        // Nothing else: the company identity is still `TBD` in `legal.ts`, and
        // a legal name invented here would contradict the mentions légales the
        // day someone fills them in.
      },
      {
        "@type": "Product",
        "@id": PRODUCT_ID,
        name: "RideGlow",
        description: t.meta.description,
        brand: { "@id": ORGANIZATION_ID },
        // No `image`: the only artwork is the OG card, and its URL carries a
        // build-generated hash segment that cannot be reconstructed from here.
        // Real product photography is what unblocks this field.
        //
        // The spec table, as attributes rather than as a table a crawler has to
        // parse back out of the markup.
        additionalProperty: Object.values(t.spec.rows).map((row) => ({
          "@type": "PropertyValue",
          name: row.label,
          value: row.value,
        })),
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          lowPrice: amount(Math.min(...prices)),
          highPrice: amount(Math.max(...prices)),
          offerCount: KITS.length,
          url: absolute(`/${locale}/configurateur`),
          eligibleRegion: SHIPPING_COUNTRIES.map((code) => ({
            "@type": "Country",
            name: code,
          })),
          // No `availability`: stock is held per SKU in the database and the
          // home page is statically rendered per locale, so anything asserted
          // here would be a guess. It goes in once the stock read is wired.
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            // Article 6 of the terms of sale, restated. Thirty days rather than
            // the statutory fourteen, return shipping paid by us.
            applicableCountry: [...SHIPPING_COUNTRIES],
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 30,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${absolute(`/${locale}`)}#faq`,
        // Google stopped showing FAQ rich results for commercial sites in 2023,
        // so this is not chasing a snippet. It is the cheapest way to hand the
        // four objections that actually block a sale to an answer engine.
        mainEntity: Object.values(t.faq.items).map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/**
 * `JSON.stringify` does not escape `<`, so a dictionary string containing one
 * could close the script tag early. Nothing here comes from a visitor today,
 * but the escape is one call and the failure mode is script injection.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
