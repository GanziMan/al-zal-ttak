import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "공시딱 - AI 공시 분석",
    short_name: "공시딱",
    description:
      "DART 공시를 AI가 자동으로 분석하고 호재/악재를 판별해드립니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["finance", "business"],
    icons: [
      { src: "/icon-72x72.svg", sizes: "72x72", type: "image/svg+xml" },
      { src: "/icon-96x96.svg", sizes: "96x96", type: "image/svg+xml" },
      { src: "/icon-128x128.svg", sizes: "128x128", type: "image/svg+xml" },
      { src: "/icon-144x144.svg", sizes: "144x144", type: "image/svg+xml" },
      { src: "/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
      {
        src: "/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-384x384.svg",
        sizes: "384x384",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
