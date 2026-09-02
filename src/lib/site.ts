/**
 * Where the site answers from, and when its copy last changed.
 *
 * Four callers need the absolute origin: the metadata base, the sitemap, robots
 * and the structured data. Three of them run outside a request, so `headers()`
 * is not available to them and the origin has to come from the environment.
 */

/** Trailing slashes stripped, so `absolute("/fr")` can never emit a double one. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Last substantive change to the marketing copy, as `lastmod` in the sitemap.
 * A literal rather than `new Date()`: a build stamp claims the page changed on
 * every deploy, which is the quickest way to have `lastmod` ignored altogether.
 * Bump it when the copy actually changes.
 */
export const CONTENT_UPDATED = "2026-09-02";
