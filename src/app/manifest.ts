import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rerasa - Penyelamatan Pangan Surplus Cirebon",
    short_name: "Rerasa",
    description: "Platform penyelamatan makanan surplus lezat hemat s/d 70% di Cirebon Raya",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#064e3b",
    theme_color: "#047857",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/renders/rerasa-mascot-r.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
