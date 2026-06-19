import styles from "./logo.module.css";

// Logo jiha.tech : « jiha » + point ambre + « tech » + underscore ambre clignotant.
// Monochrome (currentColor via tokens) → s'adapte au thème clair/sombre.
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`${styles.logo} ${className ?? ""}`}
      role="img"
      aria-label="jiha.tech"
    >
      <span className={styles.jiha}>jiha</span>
      <span className={styles.dot}>.</span>
      <span className={styles.tech}>tech</span>
      <span className={styles.cursor} aria-hidden />
    </span>
  );
}
