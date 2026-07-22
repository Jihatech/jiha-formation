import Script from "next/script";

// Plausible — analytics respectueux de la vie privée (sans cookie, sans PII).
// Ne se charge QUE si le domaine est configuré : en dev et sur les previews
// (variable absente), rien n'est injecté, donc aucun événement parasite.
// Self-hosting : surcharger NEXT_PUBLIC_PLAUSIBLE_SRC vers ton instance.
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

  return (
    <Script
      src={src}
      data-domain={domain}
      strategy="afterInteractive"
    />
  );
}
