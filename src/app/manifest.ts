import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Local Harvest",
    short_name: "Local Harvest",
    description:
      "Discover local farm shops, browse seasonal produce, and support growers in your community.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f1e6",
    theme_color: "#8b9a6b",
    categories: ["food", "shopping"],
    icons: [
      {
        src: "/logos/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logos/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logos/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}