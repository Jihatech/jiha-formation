import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ThemeToggle } from "./theme-toggle";
import { LangSwitch } from "./lang-switch";
import styles from "./site-header.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href={`/${locale}`} className={styles.brand}>
          <span className={styles.bracket}>~/</span>jiha.tech
        </Link>
        <nav className={styles.nav}>
          <Link href={`/${locale}/guides`}>{t("nav.guides")}</Link>
          <Link href={`/${locale}/dashboard`}>{t("nav.dashboard")}</Link>
          <Link href={`/${locale}/login`}>{t("nav.login")}</Link>
          <LangSwitch
            locale={locale}
            label={t("lang.switch")}
            title={t("lang.switch.label")}
          />
          <ThemeToggle label={t("theme.toggle")} />
        </nav>
      </div>
    </header>
  );
}
