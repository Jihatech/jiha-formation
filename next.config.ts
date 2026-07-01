import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les pages DYNAMIQUES (guides gated, parcours, dashboard) lisent
  // content/*.md et content/guides.json à la volée. Ces chemins étant
  // dynamiques, le tracing de Next ne les embarque pas dans les fonctions
  // serverless Vercel → 404 en prod (fichiers absents du bundle).
  // On force leur inclusion pour toutes les routes.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./content-docs/**/*"],
  },
};

export default nextConfig;
