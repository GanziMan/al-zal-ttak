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
    sitemap: "https://al-gong-ttak.vercel.app/sitemap.xml",
  };
}
