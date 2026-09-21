# Checklist qualité

À parcourir **avant** de déclarer une slice terminée. Ne pas lancer les outils (lint, tests, build) sauf demande.

## Périmètre

- [ ] La slice fait une seule chose
- [ ] Rien hors `Cahier des charges.md` (sauf demande explicite)
- [ ] Pas de feature « pour plus tard » ni de domaine inventé

## Architecture

- [ ] Dépendances vers l’intérieur (`src/pages` → features → services → lib)
- [ ] Aucun import UI depuis `lib` / `services`
- [ ] Calculs hors JSX ; pages = composition / routing
- [ ] localStorage uniquement via `src/lib/storage`
- [ ] Motif répété 2+ fois factorisé
- [ ] Pas de fichier / export / import mort
- [ ] Pas de god file (service ≲ 300 lignes, UI ≲ 200)

## TypeScript / code

- [ ] Types stricts, erreurs IDE de la slice corrigées
- [ ] Pas de `@ts-ignore` / `eslint-disable` / `any` sans justification courte
- [ ] Noms explicites ; commentaires seulement si besoin
- [ ] Option la plus maintenable retenue

## Tests

- [ ] Module métier touché : happy path
- [ ] Cas d’erreur couvert si applicable
- [ ] Fonctions pures préférées ; pas de mock métier inutile
- [ ] Si flux non auto : étapes écrites dans **Tests manuels**

## UI (si pages / layouts)

- [ ] Mobile-first ; une colonne ; pas un dashboard desktop réduit
- [ ] Zones tactiles ≥ 44px ; nav = barre du bas ou liste, pas hamburger de dashboard
- [ ] Tokens / charte uniquement (pas de couleurs/rayons hors système)
- [ ] Labels, focus visible, contraste

## Secrets & git

- [ ] Aucune clé / `.env` commité
- [ ] Message Conventional Commit prêt (non exécuté sauf demande)

## Clôture

- [ ] `docs/slice-end-template.md` rempli
- [ ] Commandes Gates + Git listées, une par ligne, non lancées sauf demande
