# Cahier des charges — Calculateur de coût et de prix

**Version : 2.0 — MVP**

Application simple, générique, utilisable par n’importe quel petit business de fabrication ou de revente (cosmétique, savon, bougie, alimentaire, artisanat, etc.).

---

## 1. Problème

Beaucoup de personnes vendent sans savoir ce que leur revient vraiment un article.

Elles connaissent le prix d’achat d’une matière, mais oublient le transport, les charges, et surtout **la part réellement utilisée** dans un pot ou une bouteille. Résultat : un prix trop bas, et une perte sans le voir.

L’application répond à une seule question :

> **« Ça m’a coûté combien de fabriquer (ou d’acheter) ça, et à quel prix je dois vendre chaque unité pour gagner ce que je veux ? »**

---

## 2. Principes

- Simple et compréhensible au premier regard.
- Vocabulaire du quotidien : matières, productions, pots, charges, bénéfice. Pas de jargon comptable.
- Parcours clairs, dans l’ordre réel du travail.
- Générique : on parle d’**unités** (pots, bouteilles, pièces…), pas d’un métier en particulier.
- Une personne non technique doit pouvoir s’en servir seule.

**Hors MVP :** stock avancé, ventes, clients, packs, livraisons, tableau de bord commercial, exports, multi-utilisateurs.

---

## 3. Parcours utilisateur

Trois écrans, dans cet ordre d’usage :

1. **Mes matières** — ce que j’ai acheté et ce que ça m’a vraiment coûté
2. **Mes productions** (et **mes reventes**) — un lot fabriqué ou un lot acheté
3. **Le prix** — coût d’une unité, prix suggéré, bénéfice

On ne peut pas chiffrer une production tant que les matières n’existent pas.

---

## 4. Mes matières

C’est le catalogue de tout ce qu’on achète pour le business : ingrédients, flacons, étiquettes, etc.

### 4.1. Créer une matière

Champs :

- nom (ex. Huile d’olive, Karité, Flacon 200 ml)
- unité (kg, g, L, ml, pièce…)
- **quantité achetée** (ex. 5 kg, 2 L, 50 pièces)
- **prix d’achat** de cette quantité
- **charges** pour l’amener jusqu’ici (transport, douane, autre…) via **+ Ajouter une charge**
  - nom de la charge
  - montant

### 4.2. Calcul automatique

```
Coût réel du lot     = prix d’achat + toutes les charges
Prix d’une unité     = coût réel du lot ÷ quantité achetée
```

Exemple :

- Karité : 5 kg achetés à 25 000 F
- Transport : 2 000 F
- Coût réel : **27 000 F**
- 1 kg = **5 400 F** → 1 g = **5,4 F**

L’utilisatrice ne fait jamais ce calcul à la main.

### 4.3. Quantité restante

La matière affiche la **quantité encore disponible**.

Quand une production utilise cette matière, la quantité utilisée est **retirée automatiquement**.

Pas d’écran « stock » séparé : le reste se voit sur la fiche matière.

---

## 5. Mes productions (je fabrique)

Une production = **un lot réel**, pas une fiche théorique.

Exemple : « Crème capillaire — lot du 21 septembre ».

### 5.1. Créer une production

- nom
- les **matières utilisées**, choisies dans le catalogue, avec la **quantité mise dans le lot**
- **charges de fabrication** (ce qui n’est pas une matière) : main-d’œuvre, gaz, électricité, autre  
  via **+ Ajouter une charge**
- **nombre d’unités produites** + type d’unité (pots, bouteilles, pièces…)

Exemple : 20 pots, 30 bouteilles, 12 pièces.

### 5.2. Calcul automatique

Pour chaque matière :

```
Coût de la matière dans le lot = quantité utilisée × prix d’une unité de cette matière
```

Puis :

```
Coût total du lot     = somme des matières + charges de fabrication
Coût d’une unité      = coût total du lot ÷ nombre d’unités produites
```

Exemple :

- Matières : 50 000 F
- Main-d’œuvre : 5 000 F
- Gaz : 2 000 F
- **Lot = 57 000 F**
- 20 pots → **chaque pot coûte 2 850 F**

C’est le chiffre central de l’application.

Les flacons et étiquettes sont des **matières** (achetées avec quantité + prix + transport), pas des charges. On les ajoute dans la recette comme le karité.

---

## 6. Mes reventes (j’achète et je revends)

Même logique, sans recette.

- nom
- quantité achetée (ex. 30 articles)
- prix d’achat du lot
- charges (transport, douane, autre)
- éventuellement le **type d’unité** (pièce, boîte…)

```
Coût réel du lot     = prix d’achat + charges
Coût d’une unité     = coût réel du lot ÷ quantité
```

Ensuite, **le même écran de prix** que pour une production.

---

## 7. Fixer le prix d’une unité

Accessible depuis chaque production et chaque revente, une fois le coût unitaire connu.

L’utilisatrice choisit ce qu’elle veut gagner, de façon simple :

- un **pourcentage** (ex. +20 %, +40 %, +50 %, ou un % libre)
- **ou** un **bénéfice en francs par unité** (ex. je veux gagner 1 000 F par pot)

L’application affiche :

- coût d’une unité
- **prix de vente suggéré**
- bénéfice par unité
- bénéfice sur **tout le lot**

Phrase type :

> Coût d’un pot : 2 850 F  
> Pour gagner 1 000 F par pot, vends-le **3 850 F**.  
> Sur ce lot (20 pots), tu gagnes **20 000 F**.

Si elle a déjà un prix en tête, elle peut le saisir : l’app dit si elle **gagne** ou **perd** par unité, et de combien.

Pas de distinction « marge / bénéfice » dans l’interface. On parle seulement de **bénéfice**.

---

## 8. Liste d’accueil

Une liste unique, lisible :

- matières (avec quantité restante)
- productions (avec coût d’un pot et prix suggéré si déjà choisi)
- reventes

Filtres simples : **Matières** | **Productions** | **Reventes**

Libellé visible : **Fabriqué** ou **Acheté**.

Boutons principaux :

- **+ Ajouter une matière**
- **+ Ajouter une production**
- **+ Ajouter une revente**

---

## 9. Ce que l’application ne fait pas (v1)

- enregistrer les ventes au quotidien
- gérer les packs / promotions
- gérer les clients, fournisseurs, livraisons
- tableau de bord chiffre d’affaires
- historique avancé des prix d’achat
- conversion d’unités complexe au-delà du nécessaire (g/kg, ml/L)
- application mobile native, multi-utilisateurs, export Excel/PDF

Si une conversion simple est utile (acheter en kg, utiliser en g), elle se fait automatiquement entre unités compatibles. Sinon, on reste sur l’unité saisie.

---

## 10. Données à enregistrer (vue simple)

**Matière**  
nom, unité, quantité achetée, quantité restante, prix d’achat, charges, coût réel, prix unitaire

**Production**  
nom, liste matières + quantités, charges de fabrication, nombre d’unités, type d’unité, coût du lot, coût unitaire, objectif de bénéfice, prix suggéré

**Revente**  
nom, quantité, prix d’achat, charges, coût unitaire, objectif de bénéfice, prix suggéré

Les données restent sur l’appareil (ou un stockage local simple). Pas besoin de compte utilisateur pour le MVP.

---

## 11. Interface

- Une colonne, adaptée au téléphone
- Peu de champs, beaucoup d’espace
- Chaque écran a **une** action principale
- Les totaux (coût du lot, coût d’un pot, prix suggéré) sont toujours visibles, en grand
- Ton neutre, propre, lisible — pas lié à une marque

---

## 12. Critères de réussite du MVP

L’utilisatrice peut, sans formation :

1. enregistrer ses matières avec transport et autres charges ;
2. créer une production en choisissant ces matières et les quantités utilisées ;
3. indiquer combien de pots / bouteilles sont sortis ;
4. voir le coût d’une unité ;
5. obtenir un prix de vente pour le bénéfice qu’elle souhaite ;
6. faire la même chose pour un article acheté et revendu.

Si ces six points marchent, le MVP est terminé.
