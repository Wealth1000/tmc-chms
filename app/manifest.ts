import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TMC",
    short_name: "TMC",
    description: "Cell group and member management",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0B0E14",
    theme_color: "#0B0E14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
