import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AuthForm mode="login" locale={lang as Locale} />;
}
