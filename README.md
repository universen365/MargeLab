# MargeLab

Calculateur de coût et de prix (matières → productions / reventes → prix).

## Prérequis

1. Projet Supabase avec le script `supabase/schema.sql` exécuté
2. Auth Email activé (désactive « Confirm email » pour tester plus vite)
3. Fichier `.env` rempli (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Lancer

```bash
pnpm install
pnpm dev
```

Ouvre l’URL affichée → crée un compte → ajoute une matière.

## Scripts

- `pnpm dev` — serveur local
- `pnpm test` — tests des calculs
- `pnpm typecheck` — TypeScript
- `pnpm build` — build production
