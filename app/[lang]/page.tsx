import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import styles from "./home.module.css";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);

  return (
    <div className={`container ${styles.hero}`}>
      <div className="terminal">
        <div className="terminal__bar">
          <span className="terminal__dot terminal__dot--red" />
          <span className="terminal__dot terminal__dot--yellow" />
          <span className="terminal__dot terminal__dot--green" />
          <span className="terminal__title">~/jiha.tech — formation</span>
        </div>
        <div className="terminal__body">
          <p className="prompt">whoami</p>
          <h1 className={styles.title}>
            jiha.tech<span className="cursor" aria-hidden />
          </h1>
          <p className={styles.tagline}>{t("home.tagline")}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href={`/${locale}/guides`} className="btn btn--primary">
          {t("home.cta")} →
        </Link>
      </div>
    </div>
  );
}
