import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages connectées ou techniques — aucune valeur d'indexation.
      disallow: ["/auth/", "/*/dashboard", "/*/login", "/*/signup", "/*/reset"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
