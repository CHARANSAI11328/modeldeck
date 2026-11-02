import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ModelDeck",
    short_name: "ModelDeck",
    description: "A private multi-provider AI testing workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#101216",
    theme_color: "#101216",
  };
}
