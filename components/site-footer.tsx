import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { legalLabels, legalPages } from "@/lib/legal/content";
import styles from "./site-footer.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className="mono">{t("footer.tagline")}</span>
        <nav className={styles.legal} aria-label={locale === "fr" ? "Informations légales" : "Legal information"}>
          {legalPages.map((p) => (
            <Link key={p} href={`/${locale}/legal/${p}`}>
              {legalLabels[locale][p]}
            </Link>
          ))}
        </nav>
        <span className={styles.meta}>© {year} · CC BY-SA</span>
      </div>
    </footer>
  );
}
