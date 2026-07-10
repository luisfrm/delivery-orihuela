import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delivery LosLatinos",
    short_name: "LosLatinos",
    description: "Servicio de entrega y compra a tu disposición",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#cc0000",
    icons: [
      {
        src: "/icon.png",
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
    ],
  }
}
