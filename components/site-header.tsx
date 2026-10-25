import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ThemeToggle } from "./theme-toggle";
import { LangSwitch } from "./lang-switch";
import { Logo } from "./logo";
import { AuthNav } from "./auth/auth-nav";
import styles from "./site-header.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href={`/${locale}`} className={styles.brand} aria-label="jiha.tech">
          <Logo />
        </Link>
        <nav className={styles.nav}>
          <Link href={`/${locale}/docs`}>{t("nav.docs")}</Link>
          <Link href={`/${locale}/guides`}>{t("nav.guides")}</Link>
          <Link href={`/${locale}/exams`}>{t("nav.exams")}</Link>
          <Link href={`/${locale}/dashboard`}>{t("nav.dashboard")}</Link>
          <AuthNav
            locale={locale}
            loginLabel={t("nav.login")}
            logoutLabel={t("nav.logout")}
          />
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
