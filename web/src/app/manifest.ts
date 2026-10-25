import type { MetadataRoute } from "next";
import { THEME_COLOR, THEME_COLOR_LIGHT } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FOTMARK",
    short_name: "FOTMARK",
    description: "Agencia creativa y marketing en la Costa del Sol.",
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLOR_LIGHT,
    theme_color: THEME_COLOR,
    lang: "es",
  };
}
