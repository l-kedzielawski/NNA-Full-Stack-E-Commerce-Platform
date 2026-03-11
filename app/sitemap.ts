import type { MetadataRoute } from "next";
import { supportedLocales, withLocalePrefix } from "@/lib/i18n";
import { getAllProducts } from "@/lib/products";

const siteUrl = "https://www.themysticaroma.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/b2b",
    "/quote",
    "/certifications",
    "/contact",
    "/shipping",
    "/legal",
    "/privacy",
    "/terms",
    "/returns",
    "/cookie-policy",
  ];

  const staticEntries = supportedLocales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${siteUrl}${withLocalePrefix(route || "/", locale)}`,
      lastModified: now,
      changeFrequency: route === "" || route === "/products" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.7,
    })),
  ) as MetadataRoute.Sitemap;

  const products = await getAllProducts();

  const productEntries = supportedLocales.flatMap((locale) =>
    products.map((product) => ({
      url: `${siteUrl}${withLocalePrefix(`/products/${product.slug}`, locale)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ) as MetadataRoute.Sitemap;

  return [...staticEntries, ...productEntries];
}
