// Liste les champs légaux encore à compléter dans lib/legal/config.ts.
// Bloquant pour la mise en service (skill mise-en-prod), pas pour la CI :
// la CI reste verte tant que l'éditeur n'a pas fourni les informations.
import { missingLegalFields } from "../lib/legal/config.ts";

const missing = missingLegalFields();
if (missing.length === 0) {
  console.log("✓ informations légales complètes");
} else {
  console.log(`✗ ${missing.length} champ(s) légal(aux) à compléter dans lib/legal/config.ts :`);
  for (const m of missing) console.log(`  - ${m}`);
  if (process.argv.includes("--strict")) process.exit(1);
}
