import "server-only";
import Stripe from "stripe";
import { stripeSecretKey } from "./env";

// Client Stripe — SERVEUR UNIQUEMENT (la clé secrète ne doit jamais atteindre le
// navigateur). Instancié paresseusement pour ne pas exiger la clé au build.
// apiVersion omise volontairement : on suit la version par défaut du compte.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  cached ??= new Stripe(stripeSecretKey(), { typescript: true });
  return cached;
}
