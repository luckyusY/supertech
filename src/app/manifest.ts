import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuperTech Marketplace",
    short_name: "SuperTech",
    description:
      "Shop premium tech, beauty, and home essentials from verified sellers across Africa. Fast delivery and buyer protection.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f1f2",
    theme_color: "#f68b1e",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse catalog",
        short_name: "Catalog",
        url: "/catalog?source=pwa",
      },
      {
        name: "Track order",
        short_name: "Track",
        url: "/track-order?source=pwa",
      },
      {
        name: "Vendors",
        short_name: "Vendors",
        url: "/vendors?source=pwa",
      },
    ],
  };
}
