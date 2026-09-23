# Login en dur (username / mot de passe)

Plus d’inscription ni de mail de confirmation.

## Identifiants (défaut dans le code)

| Champ | Valeur par défaut |
|--------|-------------------|
| Identifiant | `margelab` |
| Mot de passe | `margelab` |

À changer dans `src/lib/hardcodedLogin.ts` ou via `.env` / Vercel :
`VITE_LOGIN_USERNAME`, `VITE_LOGIN_PASSWORD`, `VITE_LOGIN_EMAIL`.

## Supabase (une fois)

**Authentication → Providers → Email** → **Confirm email = OFF**  
(sinon le compte technique ne pourra pas se connecter au 1er essai).

Au premier login réussi, l’app crée le compte technique `VITE_LOGIN_EMAIL` si besoin.
