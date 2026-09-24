#!/usr/bin/env node
// Testeur de parcours COMPLET — navigateur réel (Playwright/Chromium).
// Rejoue le parcours utilisateur de bout en bout, y compris la CONNEXION par
// email/mot de passe, et vérifie la REDIRECTION post-login (le bug « connexion →
// accueil » se manifesterait ici : on asserte l'atterrissage sur /dashboard).
//
// Prérequis :
//   - Playwright installé (npm i -D playwright) et un Chromium dispo.
//   - Un compte de test déjà confirmé (email/mot de passe).
//
// Usage :
//   BASE_URL=https://learn.jiha.tech \
//   TEST_EMAIL=you@example.com TEST_PASSWORD=•••• \
//   node scripts/journey-e2e.mjs
//
// Sans TEST_EMAIL/TEST_PASSWORD : seul le parcours anonyme est joué dans le navigateur.
// Sort en code 1 si un test échoue.

const BASE = (process.env.BASE_URL || "https://learn.jiha.tech").replace(/\/$/, "");
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright absent. Installe-le : npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // --- Parcours anonyme ---
  await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
  ok(/jiha/i.test(await page.title()) || (await page.locator("body").innerText()).length > 0, "accueil chargé");

  await page.goto(`${BASE}/en/guides`, { waitUntil: "domcontentloaded" });
  ok(/\/en\/signup$/.test(page.url()), `guides (anon) redirige vers signup (${page.url()})`);

  await page.goto(`${BASE}/en/exams`, { waitUntil: "domcontentloaded" });
  ok(/\/en\/signup$/.test(page.url()), `exams (anon) redirige vers signup (${page.url()})`);

  // --- Parcours connecté (si identifiants fournis) ---
  if (EMAIL && PASSWORD) {
    await page.goto(`${BASE}/en/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([
      page.waitForURL(/\/(en|fr)\/(dashboard|login)/, { timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForLoadState("domcontentloaded");

    // LE test clé : après connexion on doit être sur le dashboard, pas sur l'accueil.
    const url = page.url();
    ok(
      /\/(en|fr)\/dashboard/.test(url),
      `après connexion → dashboard attendu, obtenu ${url}` +
        (/\/(en|fr)\/?$/.test(url) ? "  ⚠ atterri sur l'accueil (config redirect Supabase ?)" : ""),
    );

    if (/dashboard/.test(url)) {
      const txt = await page.locator("body").innerText();
      ok(/guides (terminés|completed)/i.test(txt), "dashboard : compteur de progression affiché");
      ok(EMAIL ? txt.includes(EMAIL) : true, "dashboard : email de l'utilisateur affiché");

      // Navigation authentifiée : parcours + examens accessibles
      await page.goto(`${BASE}/en/guides`, { waitUntil: "domcontentloaded" });
      ok(/\/en\/guides$/.test(page.url()), "parcours accessible une fois connecté");

      await page.goto(`${BASE}/en/exams`, { waitUntil: "domcontentloaded" });
      ok(/\/en\/exams$/.test(page.url()), "examens accessibles une fois connecté");
      const examTxt = await page.locator("body").innerText();
      ok(/questions/i.test(examTxt), "index examens : cartes d'examen présentes");
    }
  } else {
    console.log("• (parcours connecté ignoré : définis TEST_EMAIL et TEST_PASSWORD)");
  }
} catch (e) {
  fail++;
  console.log(`✗ erreur : ${e.message.split("\n")[0]}`);
} finally {
  await browser.close();
}

console.log(`\n${pass} OK / ${fail} KO`);
process.exit(fail ? 1 : 0);
