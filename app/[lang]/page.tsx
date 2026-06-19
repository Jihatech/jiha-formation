import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getGuidesInOrder } from "@/lib/content/source";
import { TerminalHero, type TermLine } from "@/components/home/terminal-hero";
import { ToolsGrid } from "@/components/home/tools-grid";
import { ParcoursTeaser } from "@/components/home/parcours-teaser";
import styles from "./home.module.css";

function heroLines(locale: Locale): TermLine[] {
  return locale === "fr"
    ? [
        { cmd: true, text: "whoami" },
        { text: "jiha.tech — DevOps & self-hosting, sans bla-bla." },
        { cmd: true, text: "cat ./methode" },
        { text: "Tu déploies pour de vrai. On explique. Tu valides. Tu progresses." },
        { cmd: true, text: "./demarrer --parcours" },
      ]
    : [
        { cmd: true, text: "whoami" },
        { text: "jiha.tech — DevOps & self-hosting, no fluff." },
        { cmd: true, text: "cat ./method" },
        { text: "You actually deploy. We explain. You validate. You progress." },
        { cmd: true, text: "./start --path" },
      ];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const fr = locale === "fr";

  const guides = await getGuidesInOrder();
  const total = guides.length;

  const steps = fr
    ? [
        { n: "01", t: "Tu t'inscris", d: "Compte gratuit en 30 secondes (Google ou email)." },
        { n: "02", t: "Tu déploies", d: "Des guides hands-on : tu lances les vrais services sur ta machine." },
        { n: "03", t: "Tu valides", d: "Un quiz court débloque l'étape suivante — ta progression se suit toute seule." },
      ]
    : [
        { n: "01", t: "Sign up", d: "Free account in 30 seconds (Google or email)." },
        { n: "02", t: "Deploy", d: "Hands-on guides: you run the real services on your machine." },
        { n: "03", t: "Validate", d: "A short quiz unlocks the next step — progress tracks itself." },
      ];

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            {fr ? "Apprends le DevOps " : "Learn DevOps "}
            <span className={styles.accent}>{fr ? "en déployant." : "by deploying."}</span>
          </h1>
          <p className={styles.lead}>
            {fr
              ? "Self-hosting, conteneurs, reverse proxy, monitoring… des guides bilingues où tu construis vraiment, validés par la pratique."
              : "Self-hosting, containers, reverse proxy, monitoring… bilingual guides where you actually build, validated by practice."}
          </p>
          <div className={styles.actions}>
            <Link href={`/${locale}/signup`} className="btn btn--primary">
              {fr ? "Commencer gratuitement" : "Start for free"} →
            </Link>
            <Link href={`/${locale}/login`} className="btn">
              {fr ? "J'ai déjà un compte" : "I already have an account"}
            </Link>
          </div>
        </div>
        <TerminalHero lines={heroLines(locale)} title="~/jiha.tech — start" />
      </section>

      {/* OUTILS */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.h2}>
          <span className="cli-header">§ 01</span>{" "}
          {fr ? "Ce que tu vas maîtriser" : "What you'll master"}
        </h2>
        <ToolsGrid locale={locale} />
      </section>

      {/* COMMENT CA MARCHE */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.h2}>
          <span className="cli-header">§ 02</span>{" "}
          {fr ? "Comment ça marche" : "How it works"}
        </h2>
        <ol className={styles.steps}>
          {steps.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.t}</h3>
              <p className={styles.stepDesc}>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* PARCOURS (verrouillé) */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.h2}>
          <span className="cli-header">§ 03</span>{" "}
          {fr ? "Le parcours" : "The path"}
        </h2>
        <ParcoursTeaser locale={locale} total={total} />
      </section>
    </div>
  );
}
