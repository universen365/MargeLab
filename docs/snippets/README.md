# Snippets qualité (non branchés)

Le repo n’a **pas encore** de scaffold Vite. Ces fichiers sont des **références**. Ne pas poser un `tsconfig.json` isolé à la racine avant `pnpm create vite`.

## TypeScript

Fusionner `docs/snippets/tsconfig.strict.json` dans le `compilerOptions` du scaffold Vite, sans retirer `jsx`, `moduleResolution`, `paths`, etc.

## ESLint

Après le scaffold, étendre la config officielle du framework plutôt que d’inventer une config parallèle.

Pistes (à activer selon stack) :

- TypeScript recommandé (règles type-aware si `project` est branché)
- Interdire `@ts-ignore` sans commentaire
- `no-unused-vars` / imports inutilisés
- Pas d’`eslint-disable` de fichier entier

Exemple d’intention (pseudo, à traduire dans la config réelle) :

```js
// eslint.config.js — à écrire lors du scaffold, pas maintenant
{
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" }
    ],
    "no-restricted-syntax": "off"
  }
}
```

Ne pas ajouter ESLint à la racine avant le choix du package manager et du template.
