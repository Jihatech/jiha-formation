# Release <AAAA-MM-JJ> · <titre court>

**Type** : release courante | ouverture publique
**Déploiement** : <URL Vercel> · SHA `<sha court>`
**PR incluses** : #<n> <titre>, #<n> <titre>

## Ce qui change pour l'étudiant

- <changement visible, en une phrase>

## Preuves

| Vérification | Résultat |
|---|---|
| lint + typecheck | ✅ / ❌ |
| `pnpm check` (parser, quiz, légal) | ✅ / ❌ |
| `pnpm build` | ✅ / ❌ |
| CI GitHub | ✅ / ❌ <lien> |
| Smoke test prod (pages 200) | ✅ / ❌ |
| Parcours e2e en prod | ✅ / ❌ |
| Erreurs runtime 1 h après | <nombre> |

## Bloquants restants (actions humaines)

| Point | Action exacte | Qui |
|---|---|---|
| <ex. E1 SMTP> | <ex. Supabase > Auth > SMTP : renseigner Resend> | Ilyasse |

## Reporté dans la ROADMAP

- <élément retiré du périmètre et pourquoi>

## Rollback

Déploiement précédent à promouvoir si régression : <URL Vercel du déploiement N-1>
