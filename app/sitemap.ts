import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { locales } from "@/lib/i18n/config";
import { docsCategories } from "@/lib/docs/categories";
import { getAllDocs } from "@/lib/docs/source";
import { getPublicGuide } from "@/lib/content/source";

// Sitemap = couche OUVERTE uniquement (home, /docs, guide public).
// Les pages gated (parcours, dashboard) et les pages auth redirigent ou
// n'ont pas vocation à être indexées → exclues (BUILD-SPEC §6.2).

interface Page {
  path: string; // sans préfixe de langue ("" = home)
  lastModified?: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await getAllDocs();
  // Graceful si le contenu JIHA-Learn n'est pas encore synchronisé.
  const publicGuide = await getPublicGuide().catch(() => null);

  const pages: Page[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/docs", changeFrequency: "weekly", priority: 0.8 },
    ...docsCategories
      .filter((cat) => docs.some((e) => e.meta.category === cat.id))
      .map((cat) => ({
        path: `/docs/${cat.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...docs.map((e) => ({
      path: `/docs/${e.meta.category}/${e.meta.slug}`,
      lastModified: e.meta.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(publicGuide
      ? [
          {
            path: `/guides/${publicGuide.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ];

  return pages.flatMap(({ path, ...rest }) => {
    const alternates = {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
      ),
    };
    return locales.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      alternates,
      ...rest,
    }));
  });
}
