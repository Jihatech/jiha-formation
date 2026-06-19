import type { Locale } from "@/lib/i18n/config";
import { homeTools } from "@/lib/home/tools";
import styles from "./tools-grid.module.css";

export function ToolsGrid({ locale }: { locale: Locale }) {
  return (
    <ul className={styles.grid}>
      {homeTools.map((tool) => (
        <li key={tool.name} className={styles.card}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            width="32"
            height="32"
            aria-hidden="true"
          >
            <path d={tool.iconPath} fill="currentColor" />
          </svg>
          <div>
            <p className={styles.name}>{tool.name}</p>
            <p className={styles.desc}>
              {locale === "fr" ? tool.desc_fr : tool.desc_en}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
