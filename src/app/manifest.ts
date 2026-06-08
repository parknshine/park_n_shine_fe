import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Park & Shine",
    short_name: "Park & Shine",
    description: "Layanan cuci mobil tanpa air — pesan sekarang.",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    orientation: "portrait",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
