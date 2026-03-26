import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/settings", "/watchlist"],
      },
    ],
    sitemap: "https://gongsittak.com/sitemap.xml",
  };
}
