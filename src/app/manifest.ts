import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fabi Nails — Estúdio de Unhas Premium",
    short_name: "Fabi Nails",
    description:
      "Alongamento, manutenção e banho de gel com acabamento ultra-fino. Atendimento exclusivo em Manoel Ribas PR.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9f6",
    theme_color: "#c38d94",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
