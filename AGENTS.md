# AGENTS.md

Règles d’exécution pour l’agent Cursor. Qualité : `docs/quality-checklist.md`. Clôture : `docs/slice-end-template.md`. Produit : `Cahier des charges.md`.

## Mission

Calculateur de coût et de prix, générique, utilisable au téléphone. Trois parcours : matières, productions/reventes, prix. Données dans Supabase.

## Stack (figée)

- App unique : **Vite + React + TypeScript + Tailwind**
- **pnpm**, tests **Vitest**
- Persistance : **Supabase** via `src/lib/supabase` (+ Auth email)
- Pas de Next.js / Prisma / paiement en v1

## Rythme

1. Une slice par tour.
2. Coder uniquement ce qui est demandé.
3. Expliquer fichiers + pourquoi.
4. STOP. Attendre validation.
5. Template fin de slice + Gates/Git **sans les lancer** sauf demande.

Interdit sans demande : lint, typecheck, test, build, commit, push, force-push, refactor massif.

## Couches

`src/pages` → `src/features` → `src/services` → `src/lib`

Les calculs sont des fonctions pures testées. L’UI compose et affiche.

## Qualité

- TypeScript strict. DRY dès 2 occurrences. Pas de code mort.
- Découper ~300 lignes (service) / ~200 (UI).
- Tests min sur chaque module de calcul touché.
- Mobile-first, cibles ≥ 44px, totaux bien visibles.
- Secrets uniquement dans `.env` (gitignoré).

## Git

Conventional Commits. Branches `feat/...`. Commit seulement sur demande.
