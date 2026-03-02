import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Mystic Aroma",
    short_name: "Mystic Aroma",
    description:
      "Premium Madagascar vanilla, cocoa, and specialty ingredients for B2B buyers.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0906",
    theme_color: "#0a0906",
    icons: [
      {
        src: "/avi-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/avi-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
