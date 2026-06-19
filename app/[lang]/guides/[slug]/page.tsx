import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/config";
import {
  getManifest,
  getManifestGuide,
  getRenderableSlugs,
  loadFigureSvg,
  loadGuide,
} from "@/lib/content/source";
import type { GuideNode, ParsedGuide } from "@/lib/content/types";
import { GuideContent } from "@/components/guide/guide-content";
import { GuideRelations } from "@/components/guide/guide-relations";
import styles from "./guide.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getRenderableSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

function figureNames(guide: ParsedGuide): string[] {
  const names = new Set<string>();
  const visit = (nodes: GuideNode[]) =>
    nodes.forEach((n) => n.type === "figure" && names.add(n.name));
  for (const s of guide.sections) {
    visit(s.nodes);
    s.steps.forEach((step) => visit(step.nodes));
  }
  return [...names];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const g = await getManifestGuide(slug);
  if (!g) return {};
  const locale = lang as Locale;
  const title = locale === "fr" ? g.title_fr : g.title_en;
  const description = locale === "fr" ? g.tagline_fr : g.tagline_en;
  const path = (l: string) => `${SITE_URL}/${l}/guides/${g.slug}`;
  return {
    title: `${title} — ${"jiha.tech"}`,
    description,
    alternates: {
      canonical: path(locale),
      languages: { fr: path("fr"), en: path("en") },
    },
    openGraph: { title, description, locale, type: "article" },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  const meta = await getManifestGuide(slug);
  const guide = await loadGuide(slug);
  if (!meta || !guide) notFound();

  const manifest = (await getManifest()).guides;

  // Précharge les SVG des figures (graceful : null si non encore promues dans JIHA-Learn).
  const figures = new Map<string, string | null>();
  await Promise.all(
    figureNames(guide).map(async (name) =>
      figures.set(name, await loadFigureSvg(name)),
    ),
  );

  const title = locale === "fr" ? meta.title_fr : meta.title_en;
  const tagline = locale === "fr" ? meta.tagline_fr : meta.tagline_en;

  return (
    <article className={`container ${styles.page}`}>
      {/* Bandeau CTA discret — non négociable (BUILD-SPEC §3.2) */}
      <div className={styles.ctaBanner}>
        <span>
          {locale === "fr"
            ? "Ce guide fait partie de la formation jiha.tech"
            : "This guide is part of the jiha.tech training"}
        </span>
        <Link href={`/${locale}/guides`}>{t("home.cta")} →</Link>
      </div>

      <header className={styles.hero}>
        <div className={styles.meta}>
          <span>{t(`guide.level.${meta.level}`)}</span>
          <span>· {meta.duration_min} {t("guide.duration")}</span>
          {meta.repo ? <span>· {meta.repo}</span> : null}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.tagline}>{tagline}</p>
      </header>

      {/* Prérequis résolus via le manifeste (BUILD-SPEC §3.4) */}
      {meta.prerequisites?.length ? (
        <section className={styles.relations}>
          <h2 className="cli-header">{t("guide.prerequisites")}</h2>
          <GuideRelations
            ids={meta.prerequisites}
            manifest={manifest}
            locale={locale}
            soonLabel={t("guide.soon")}
          />
        </section>
      ) : null}

      <GuideContent guide={guide} locale={locale} figures={figures} />

      {/* Et après ? + CTA fort (BUILD-SPEC §3.2 / §10) */}
      <section className={styles.relations}>
        <h2 className="cli-header">{t("guide.next")}</h2>
        {meta.next?.length ? (
          <GuideRelations
            ids={meta.next}
            manifest={manifest}
            locale={locale}
            soonLabel={t("guide.soon")}
          />
        ) : null}
        <div className={styles.strongCta}>
          <Link href={`/${locale}/dashboard`} className="btn btn--primary">
            {t("nav.dashboard")} →
          </Link>
        </div>
      </section>
    </article>
  );
}
