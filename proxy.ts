import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";

// Redirige toute URL sans préfixe de langue vers /<lang>/... (BUILD-SPEC §6.2 :
// URLs distinctes par langue). La langue est devinée via Accept-Language, défaut FR.

function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
    for (const code of preferred) {
      if (isLocale(code)) return code;
    }
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rattrapage OAuth : un code/erreur d'auth qui atterrit AILLEURS que sur
  // /auth/callback (typiquement quand Supabase retombe sur le « Site URL »
  // racine parce que l'URL de callback n'est pas dans l'allowlist) est
  // réacheminé vers le callback — sinon l'utilisateur revient « connecté » sur
  // l'accueil sans que la session soit établie. Le fix propre reste de déclarer
  // https://<domaine>/auth/callback dans Supabase (Authentication → URL Config).
  const params = request.nextUrl.searchParams;
  if ((params.has("code") || params.has("error")) && !pathname.startsWith("/auth/")) {
    const seg = pathname.split("/")[1];
    const lang = isLocale(seg) ? seg : detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!params.get("lang")) url.searchParams.set("lang", lang);
    return NextResponse.redirect(url);
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  // Sur une URL déjà localisée : on rafraîchit la session Supabase et on continue.
  if (hasLocale) return updateSession(request);

  // Sinon : redirection vers la variante localisée (la session sera rafraîchie au prochain passage).
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclut les assets statiques, l'API, les routes /auth (callback OAuth) et les fichiers internes Next.
  matcher: ["/((?!_next|api|auth|.*\\..*).*)"],
};
