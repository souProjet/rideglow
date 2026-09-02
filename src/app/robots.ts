import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The back office and the API answer with data, not pages, so there is
        // no meta tag on them to say `noindex`: robots.txt is the only place
        // that can. The configurator and the order pages are deliberately not
        // listed. They carry `noindex` in their metadata, and a crawler has to
        // be allowed to fetch a page before it can read the tag that excludes
        // it: disallowing them here would keep them indexable on link alone.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
  };
}
