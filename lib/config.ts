// Valeurs centralisées (BUILD-SPEC §6.5 : placeholders remplaçables en une passe).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const SITE_NAME = "jiha.tech";
