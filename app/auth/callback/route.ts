import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

// Callback OAuth / lien email : échange le code contre une session, puis redirige.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const langParam = searchParams.get("lang");
  const lang = langParam && isLocale(langParam) ? langParam : defaultLocale;
  const dest = nextParam?.startsWith("/") ? nextParam : `/${lang}/dashboard`;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/${lang}/login?error=auth_callback`,
  );
}
