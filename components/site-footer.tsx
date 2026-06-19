import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import styles from "./site-footer.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className="mono">{t("footer.tagline")}</span>
        <span className={styles.meta}>© {year} · CC BY-SA</span>
      </div>
    </footer>
  );
}
