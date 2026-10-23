"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import {
  requestResetAction,
  signInAction,
  signUpAction,
  type AuthState,
} from "@/lib/auth/actions";
import { GoogleButton } from "./google-button";
import styles from "./auth-form.module.css";

type Mode = "login" | "signup" | "reset";

const COPY = {
  fr: {
    login: { title: "Connexion", submit: "Se connecter" },
    signup: { title: "Créer un compte", submit: "Créer mon compte" },
    reset: { title: "Mot de passe oublié", submit: "Envoyer le lien" },
    email: "Email",
    password: "Mot de passe",
    consent: {
      pre: "J'accepte les ",
      terms: "conditions d'utilisation",
      mid: " et le traitement de mes données (compte, progression) décrit dans la ",
      privacy: "politique de confidentialité",
      post: ". Je peux supprimer mon compte à tout moment.",
    },
    or: "ou",
    toSignup: "Pas de compte ? Créer un compte",
    toLogin: "Déjà un compte ? Se connecter",
    toReset: "Mot de passe oublié ?",
  },
  en: {
    login: { title: "Sign in", submit: "Sign in" },
    signup: { title: "Sign up", submit: "Create my account" },
    reset: { title: "Forgot password", submit: "Send the link" },
    email: "Email",
    password: "Password",
    consent: {
      pre: "I accept the ",
      terms: "terms of use",
      mid: " and the processing of my data (account, progress) described in the ",
      privacy: "privacy policy",
      post: ". I can delete my account at any time.",
    },
    or: "or",
    toSignup: "No account? Sign up",
    toLogin: "Already have an account? Sign in",
    toReset: "Forgot your password?",
  },
} as const;

export function AuthForm({ mode, locale }: { mode: Mode; locale: Locale }) {
  const action =
    mode === "login"
      ? signInAction
      : mode === "signup"
        ? signUpAction
        : requestResetAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const c = COPY[locale];

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>
        <span className="cli-header">~/auth</span>
        <br />
        {c[mode].title}
      </h1>

      {mode !== "reset" ? (
        <>
          <GoogleButton locale={locale} />
          <div className={styles.divider}>{c.or}</div>
        </>
      ) : null}

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="lang" value={locale} />
        <label className={styles.label}>
          {c.email}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={styles.input}
          />
        </label>

        {mode !== "reset" ? (
          <label className={styles.label}>
            {c.password}
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className={styles.input}
            />
          </label>
        ) : null}

        {mode === "signup" ? (
          <label className={styles.consent}>
            <input type="checkbox" name="consent" required />
            <span>
              {c.consent.pre}
              <Link href={`/${locale}/legal/terms`} target="_blank">
                {c.consent.terms}
              </Link>
              {c.consent.mid}
              <Link href={`/${locale}/legal/privacy`} target="_blank">
                {c.consent.privacy}
              </Link>
              {c.consent.post}
            </span>
          </label>
        ) : null}

        {state.error ? <p className={styles.error}>{state.error}</p> : null}
        {state.message ? (
          <p className={styles.message}>{state.message}</p>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={pending}
        >
          {pending ? "…" : c[mode].submit}
        </button>
      </form>

      <nav className={styles.links}>
        {mode === "login" ? (
          <>
            <Link href={`/${locale}/reset`}>{c.toReset}</Link>
            <Link href={`/${locale}/signup`}>{c.toSignup}</Link>
          </>
        ) : (
          <Link href={`/${locale}/login`}>{c.toLogin}</Link>
        )}
      </nav>
    </div>
  );
}
