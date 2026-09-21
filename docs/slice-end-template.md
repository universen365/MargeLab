# Template — fin de slice

Copier ce bloc en fin de tour. Ne pas lancer lint / tests / build / git sauf demande.

---

## Slice

**Titre :**  
**Objectif :**  
**Hors scope (volontaire) :**

## Done

- 

## Not done

- 

## Limitations

- 

## Checklist qualité

- [ ] `docs/quality-checklist.md` parcourue pour cette slice

## Tests manuels (si applicable)

1. 
2. 

## Fichiers touchés + pourquoi

| Fichier | Pourquoi |
| -------- | -------- |
| | |

## Gates

À lancer **seulement si demandé**. Une commande par ligne (`pnpm`).

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Git

À lancer **seulement si demandé**. Une commande par ligne.

```text
git status
git add -A
git commit -m "feat: description de la slice"
git status
```

Branche typique (si créée sur demande) :

```text
git checkout -b feat/nom-de-la-slice
```

**Interdit :** `git push --force` sur `main`.
