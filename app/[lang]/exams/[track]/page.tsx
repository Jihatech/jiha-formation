import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildExam } from "@/lib/exams/source";
import { trackLabel } from "@/lib/content/tracks";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ExamRunner } from "@/components/exam/exam-runner";
import styles from "../exams.module.css";

// Chaque visite tire un nouvel échantillon → rendu dynamique obligatoire.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; track: string }>;
}): Promise<Metadata> {
  const { lang, track } = await params;
  if (!isLocale(lang)) return {};
  const exam = await buildExam(track);
  if (!exam) return {};
  const locale = lang as Locale;
  const name = trackLabel(exam.track, locale);
  return {
    title:
      locale === "fr"
        ? `Examen blanc — ${name} — jiha.tech`
        : `Mock exam — ${name} — jiha.tech`,
    robots: { index: false, follow: true },
  };
}

export default async function ExamRunPage({
  params,
}: {
  params: Promise<{ lang: string; track: string }>;
}) {
  const { lang, track } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/signup`);
  }

  const exam = await buildExam(track);
  if (!exam) notFound();

  return (
    <div className={`container ${styles.page}`}>
      <Link href={`/${locale}/exams`} className={styles.startCta}>
        {t("exam.backToList")}
      </Link>
      <ExamRunner exam={exam} locale={locale} />
    </div>
  );
}
