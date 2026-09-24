#!/usr/bin/env node
// Testeur de parcours — smoke HTTP sans dépendance (Node fetch).
// Vérifie le parcours ANONYME + le SEO + le contenu public, sans navigateur.
// Idéal en CI (rapide, zéro install). Pour le parcours CONNECTÉ (formulaire,
// redirection post-login), voir scripts/journey-e2e.mjs (Playwright).
//
// Usage :  BASE_URL=https://learn.jiha.tech node scripts/journey-test.mjs
//          (défaut BASE_URL = https://learn.jiha.tech)
// Sort en code 1 si au moins un test échoue.

const BASE = (process.env.BASE_URL || "https://learn.jiha.tech").replace(/\/$/, "");
let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};

async function get(path) {
  const r = await fetch(BASE + path, { redirect: "manual" });
  return {
    status: r.status,
    loc: r.headers.get("location"),
    body: r.status < 300 ? await r.text() : "",
  };
}

async function run() {
  console.log(`# Parcours anonyme — ${BASE}\n`);

  // Accueil + i18n
  let r = await get("/en");
  ok(r.status === 200, `home /en → 200 (got ${r.status})`);
  ok(/jiha/i.test(r.body), "home : branding présent");
  r = await get("/fr");
  ok(r.status === 200, `home /fr → 200 (got ${r.status})`);

  // Gating anonyme : parcours réservé → signup ; espace perso → login
  r = await get("/en/guides");
  ok(r.status === 307 && /\/en\/signup$/.test(r.loc || ""), `guides (anon) → signup (${r.status} ${r.loc || ""})`);
  r = await get("/en/exams");
  ok(r.status === 307 && /\/en\/signup$/.test(r.loc || ""), `exams (anon) → signup (${r.status} ${r.loc || ""})`);
  r = await get("/en/exams/azure-az104");
  ok(r.status === 307 && /\/en\/signup$/.test(r.loc || ""), `exam détail (anon) → signup (${r.status} ${r.loc || ""})`);
  r = await get("/en/dashboard");
  ok(r.status === 307 && /\/en\/login$/.test(r.loc || ""), `dashboard (anon) → login (${r.status} ${r.loc || ""})`);

  // Guide public (1er, ouvert à tous)
  r = await get("/en/guides/art-of-command-line");
  ok(r.status === 200, `guide public → 200 (got ${r.status})`);
  ok(/step-01|progress|Sign in to track/i.test(r.body), "guide public : bloc progression présent");

  // Page de connexion : formulaire + Google
  r = await get("/en/login");
  ok(r.status === 200, `login → 200 (got ${r.status})`);
  ok(/type="password"/.test(r.body), "login : champ mot de passe");
  ok(/Continue with Google|Continuer avec Google/.test(r.body), "login : bouton Google");

  // SEO
  r = await get("/robots.txt");
  ok(r.status === 200, `robots.txt → 200 (got ${r.status})`);
  r = await get("/sitemap.xml");
  ok(r.status === 200 && /https?:\/\//.test(r.body), "sitemap.xml → 200 + URLs");

  console.log(`\n${pass} OK / ${fail} KO`);
  process.exit(fail ? 1 : 0);
}

run().catch((e) => {
  console.error("Erreur inattendue :", e.message);
  process.exit(2);
});
