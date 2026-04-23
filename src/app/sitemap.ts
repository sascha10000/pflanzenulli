import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pflanzenulli.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "de"];

  const staticPages = [
    "",
    "/search",
    "/legal/terms",
    "/legal/privacy",
    "/legal/imprint",
    "/legal/dsa",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "monthly",
        priority: page === "" ? 1.0 : 0.5,
      });
    }
  }

  // Dynamic listing and species pages would be added here
  // by querying the database for active listings and species

  return entries;
}
