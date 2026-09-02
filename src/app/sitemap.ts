import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { LEGAL_COMPLETE, LEGAL_UPDATED } from "@/lib/legal";
import { absolute, CONTENT_UPDATED } from "@/lib/site";

/**
 * Only the pages that are allowed in the index.
 *
 * The configurator and the two order pages are `noindex`, and listing a
 * noindexed URL here is a contradiction Search Console reports back as an
 * error. The legal pages stay out for the same reason until `LEGAL_COMPLETE`
 * flips, which happens when the `TBD` facts in `legal.ts` are filled in.
 */
const LEGAL_PATHS = ["mentions-legales", "cgv", "confidentialite"] as const;

/** Every locale of one path, as the `hreflang` set that path shares. */
function languagesFor(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, absolute(`/${locale}${path}`)])),
    // Same target as the redirect in `proxy.ts` sends an unmatched visitor to.
    "x-default": absolute(`/${DEFAULT_LOCALE}${path}`),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = LOCALES.map((locale) => ({
    url: absolute(`/${locale}`),
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: { languages: languagesFor("") },
  }));

  if (!LEGAL_COMPLETE) return home;

  const legal = LEGAL_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absolute(`/${locale}/${path}`),
      lastModified: LEGAL_UPDATED,
      changeFrequency: "yearly" as const,
      priority: 0.3,
      alternates: { languages: languagesFor(`/${path}`) },
    })),
  );

  return [...home, ...legal];
}
