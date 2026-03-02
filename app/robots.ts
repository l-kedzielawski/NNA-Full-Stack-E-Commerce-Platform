import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/journal", "/journal/"],
    },
    sitemap: "https://www.themysticaroma.com/sitemap.xml",
    host: "https://www.themysticaroma.com",
  };
}
