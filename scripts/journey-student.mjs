#!/usr/bin/env node
// Parcours ÉTUDIANT complet, navigateur réel (Playwright), sur un environnement
// LOCAL ou de TEST uniquement (jamais la production : le script crée et supprime
// un compte).
//
// Couvre : inscription + consentement, email de confirmation (Mailpit), tableau
// de bord, menu connecté, premier guide validé étape par étape via les QCM,
// persistance, examen blanc, mot de passe oublié jusqu'au nouveau mot de passe,
// déconnexion, suppression du compte.
//
// Prérequis (voir .claude/skills/mise-en-prod/SKILL.md, « Test du parcours ») :
//   npx supabase start          # Supabase local + Mailpit (supabase/config.toml)
//   pnpm build && pnpm start    # avec .env.local pointant sur Supabase local
//   npm i -D playwright && npx playwright install chromium
//
// Usage : BASE_URL=http://localhost:3000 MAILPIT_URL=http://127.0.0.1:54324 node scripts/journey-student.mjs
// Sort en code 1 si une vérification échoue. Captures : ./journey-shots/

import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const MAIL = (process.env.MAILPIT_URL || "http://127.0.0.1:54324").replace(/\/$/, "");
const GUIDE = process.env.GUIDE || "art-of-command-line";
const SHOTS = join(process.cwd(), "journey-shots");

if (/learn\.jiha\.tech/.test(BASE)) {
  console.error("Refus : ce script crée et supprime un compte. Lance-le en local ou sur un environnement de test.");
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright absent : npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const stamp = Date.now();
const EMAIL = `etudiant+${stamp}@jiha.test`;
const PASS = `Test-${stamp}!`;
const NEWPASS = `Nouveau-${stamp}!`;
const quiz = JSON.parse(readFileSync(join(process.cwd(), `lib/quiz/data/${GUIDE}.json`), "utf8"));
const steps = Object.keys(quiz);
mkdirSync(SHOTS, { recursive: true });

let pass = 0;
let fail = 0;
const ok = (cond, msg, detail = "") => {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "✓" : "✗"} ${msg}${detail ? `  (${detail})` : ""}`);
};
let n = 0;
const shot = (page, name, fullPage = false) =>
  page.screenshot({ path: join(SHOTS, `${String(++n).padStart(2, "0")}-${name}.png`), fullPage });

async function lastMail(subject) {
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`${MAIL}/api/v1/search?query=${encodeURIComponent(`to:${EMAIL}`)}`).then((x) => x.json());
    const m = (r.messages || []).find((x) => subject.test(x.Subject));
    if (m) return fetch(`${MAIL}/api/v1/message/${m.ID}`).then((x) => x.json());
    await new Promise((res) => setTimeout(res, 1000));
  }
  return null;
}
const linkOf = (msg) => (msg.HTML.match(/href="([^"]+)"/)?.[1] ?? "").replace(/&amp;/g, "&");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("dialog", (d) => d.accept());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => r.status() >= 500 && errors.push(`HTTP ${r.status()} ${r.url()}`));
// Le formulaire de la page, jamais le bouton « Déconnexion » de l'en-tête.
const submit = () => page.click('main button[type="submit"]');
const header = async () => (await page.locator("header").innerText()).replace(/\n/g, " ");
async function login(pw) {
  await page.context().clearCookies();
  await page.goto(`${BASE}/fr/login`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', pw);
  await submit();
  await page.waitForTimeout(2000);
  return /\/fr\/dashboard/.test(page.url());
}

try {
  // 1. Inscription
  await page.goto(`${BASE}/fr/signup`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await submit();
  ok(/\/signup/.test(page.url()), "inscription bloquée sans consentement");
  await page.check('input[name="consent"]');
  await submit();
  await page.waitForTimeout(2000);
  ok(/boîte mail/i.test(await page.locator("main").innerText()), "message « vérifie ta boîte mail »");

  // 2. Confirmation par email
  const confirm = await lastMail(/confirm/i);
  ok(!!confirm, "email de confirmation reçu");
  await page.goto(linkOf(confirm), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  ok(/\/fr\/dashboard/.test(page.url()), "lien de confirmation → tableau de bord", page.url());
  ok(/Déconnexion/.test(await header()), "menu connecté : « Déconnexion »");
  await shot(page, "dashboard-nouveau");

  // 3. Premier guide, étape par étape via les QCM
  await page.goto(`${BASE}/fr/guides/${GUIDE}`, { waitUntil: "domcontentloaded" });
  for (const step of steps) {
    for (let qi = 0; qi < quiz[step].length; qi++) {
      const radios = page.locator(`input[type=radio][name="quiz-${GUIDE}-${step}-${qi}"]`);
      await radios.first().waitFor({ timeout: 15000 });
      await radios.nth(quiz[step][qi].answer).check();
      await page.getByRole("button", { name: /Valider l'étape/ }).click();
      await page.waitForTimeout(1300);
    }
  }
  await page.waitForTimeout(1500);
  const total = `${steps.length} sur ${steps.length} étapes`;
  ok((await page.locator("main").innerText()).includes(total), `guide terminé : ${total}`);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  ok((await page.locator("main").innerText()).includes(total), "progression conservée après rechargement");
  await page.goto(`${BASE}/fr/dashboard`, { waitUntil: "domcontentloaded" });
  ok(/1\/\d+ guides termin/i.test(await page.locator("main").innerText()), "tableau de bord : 1 guide terminé");
  await shot(page, "dashboard-1-guide");

  // 4. Examen blanc
  await page.goto(`${BASE}/fr/exams/cli-linux`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.locator("main input[type=radio]").first().check();
  await page.getByRole("button", { name: /Terminer l'examen/ }).click();
  await page.waitForTimeout(1500);
  ok(/\d+%/.test(await page.locator("main").innerText()), "examen blanc : score affiché");

  // 5. Déconnexion depuis le menu
  await page.getByRole("banner").getByRole("button", { name: "Déconnexion" }).click();
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}/fr/dashboard`);
  ok(/\/fr\/login/.test(page.url()), "déconnecté : tableau de bord protégé");

  // 6. Mot de passe oublié → nouveau mot de passe
  await page.goto(`${BASE}/fr/reset`);
  await page.fill('input[name="email"]', EMAIL);
  await submit();
  const reset = await lastMail(/reset/i);
  ok(!!reset, "email de réinitialisation reçu");
  await page.goto(linkOf(reset), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  ok(/\/fr\/account$/.test(page.url()), "lien de réinitialisation → écran « Nouveau mot de passe »", page.url());
  await page.fill('input[name="password"]', NEWPASS);
  await submit();
  await page.waitForTimeout(2000);
  ok(await login(NEWPASS), "connexion avec le nouveau mot de passe");
  ok(!(await login(PASS)), "ancien mot de passe refusé");

  // 7. Suppression du compte
  await login(NEWPASS);
  await page.getByRole("button", { name: /supprimer/i }).first().click();
  await page.waitForTimeout(2500);
  ok(!(await login(NEWPASS)), "compte supprimé : connexion impossible");

  ok(errors.length === 0, "aucune erreur JavaScript ni 5xx", errors.slice(0, 3).join(" | "));
} catch (e) {
  fail++;
  console.log(`✗ erreur : ${e.message.split("\n")[0]}`);
  await shot(page, "erreur", true).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n${pass} OK / ${fail} KO · captures : ${SHOTS}`);
process.exit(fail ? 1 : 0);
