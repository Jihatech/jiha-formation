"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otherLocale, type Locale } from "@/lib/i18n/config";

// La bascule FR/EN pointe vers l'URL équivalente dans l'autre langue (BUILD-SPEC §6.2) :
// elle ne fait pas qu'échanger le texte en place, elle change /<lang>/ dans l'URL.
export function LangSwitch({
  locale,
  label,
  title,
}: {
  locale: Locale;
  label: string;
  title: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const target = otherLocale(locale);
  // Remplace uniquement le premier segment (le préfixe de langue). Les ancres/slug restent identiques.
  const href = pathname.replace(new RegExp(`^/${locale}`), `/${target}`);

  return (
    <Link href={href} hrefLang={target} title={title} className="mono">
      {label}
    </Link>
  );
}
