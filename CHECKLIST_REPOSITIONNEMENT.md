# Checklist — Repositionnement stratégique Boussole Animale

**Progression : 3/14 tâches (21%)**

Contexte : analyse concurrentielle jugeant le marché des quiz "race" et calculateurs de budget déjà
occupé (Royal Canin, Woopets, assure-mon-chien.fr, royaume-des-animaux.fr), mais sans concurrent identifié
sur un calculateur d'espace vital dédié ni sur une ligne éditoriale de fond sur le bien-être animal urbain.
Objectif : repositionner Boussole Animale comme LE diagnostic de compatibilité logement/mode de vie/animal,
avec une identité éditoriale forte sur le bien-être animal en ville.

**Contrainte de rythme** : 2-4h/semaine côté validation utilisateur → chaque chantier est découpé en
livrables indépendants et déployables séparément, pas un big-bang.

**Discipline établie** : aucune modification structurante (repositionnement home, fusion des calculateurs,
nouvelle collection de contenu) n'est implémentée sans validation explicite des options ci-dessous.
Push uniquement sur confirmation, comme sur tous les chantiers précédents.

---

## Constats de l'état des lieux (avant tout code)

Relecture des fichiers concernés le 15/09/2026 — trois écarts entre le brief et l'état réel du code à
avoir en tête avant de trancher les options :

1. **Le calculateur d'espace vital n'existe pas du tout aujourd'hui.** Le brief le décrit comme
   "secondaire" — en réalité il est absent de `src/pages/outils/` (seuls existent : quiz race, coût
   mensuel chien, coût mensuel chat, âge chien/chat). C'est donc une création complète, pas une
   promotion d'un outil existant. Bonne nouvelle : la donnée nécessaire pour un premier jet existe déjà
   sur les 60 fiches (`taille`, `poids`, `niveauActivite`, `adapteAppartement`) — pas besoin de
   retoucher les fiches pour livrer une v1.

2. **Aucun champ "besoin de stimulation mentale" distinct de `niveauActivite`** dans le schéma des races
   (`src/content.config.ts`). `niveauActivite` (faible/modéré/élevé/très élevé) est déjà indépendant de
   la taille de la race — croiser taille + niveauActivite couvre déjà partiellement "races calmes de
   grande taille" et "petites races hyperactives" sans nouveau champ. Mais ce n'est pas une vraie
   séparation activité physique / stimulation mentale. Option à trancher, voir chantier 1.

3. **Aucune régie publicitaire n'est implémentée sur le site actuellement.** Le plumbing RGPD est prêt
   (`src/lib/consentement.ts` déclare déjà une catégorie `publicite`, refusée par défaut, avec la
   convention documentée `if (!consentementDonne('publicite')) return;` pour tout futur script tiers),
   mais aucun script AdSense/Ezoic/Mediavine n'existe dans le code. "Rester cohérent avec la structure
   actuelle" pour les emplacements pub n'a donc pas de précédent à suivre — c'est un choix complet à
   faire (réseau, nombre d'emplacements, pages concernées), voir chantier 4.

4. **La section éditoriale "enquête" n'a pas de précédent dans le schéma de contenu.** La collection
   `guides` existante (`guideSchema`) est calibrée pour des guides pratiques courts (budget, comparatifs),
   pas pour du long-form type enquête avec sources journalistiques. Décision à trancher, voir chantier 3.

5. **Le sitemap est déjà automatique** (`@astrojs/sitemap`, `astro.config.mjs`) avec priorité/fréquence
   par motif d'URL. Ce n'est pas un chantier en soi : ajouter une nouvelle section n'demande qu'une ligne
   de regex supplémentaire dans `serialize()`. Reclassé en sous-tâche du chantier 4, pas un item à part.

---

## Options à valider avant d'implémenter quoi que ce soit

### Option A — Portée du calculateur d'espace vital (v1) — ✅ TRANCHÉE : A1
- **A1 (recommandé pour démarrer vite)** : scoring basé sur les champs existants (taille, niveauActivite,
  adapteAppartement) + nouvelles questions logement (surface, balcon/jardin, étage). Aucune fiche à
  retoucher, livrable en un sprint.
- **A2** : ajouter un champ `besoinStimulationMentale` au schéma et le renseigner sur les 60 fiches avant
  de coder le calculateur — plus fidèle à la demande "croiser énergie ET stimulation mentale", mais gros
  travail de re-documentation avant de voir le moindre résultat, peu compatible avec 2-4h/semaine.

### Option B — Repositionnement de la page d'accueil
- **B1** : le calculateur d'espace vital devient le CTA principal du hero, le quiz race passe en second
  (sous le hero ou dans "Outils").
- **B2** : hero à deux entrées de valeur égale ("Quelle race me correspond" / "Quel espace lui faut-il"),
  sans trancher lequel est prioritaire.
- **B3** : garder le hero quiz actuel intact, faire remonter l'espace vital uniquement dans la nav
  principale et la page Outils (repositionnement plus prudent, réversible).

### Option C — Fusion des calculateurs
- **C1** : nouveau parcours unifié comme page à part (`/outils/diagnostic/`), calculateurs individuels
  inchangés et toujours accessibles pour le SEO longue traîne existant.
- **C2** : les calculateurs individuels redirigent avec un bandeau "essayez aussi le diagnostic complet"
  plutôt que de rester des points d'entrée neutres.

### Option D — Structure de la section éditoriale
- **D1** : nouvelle collection de contenu `enquetes` séparée de `guides`, avec son propre schéma
  (sources journalistiques, ton long-form) et son propre layout.
- **D2** : un champ `type: 'guide' | 'enquete'` ajouté à la collection `guides` existante, avec un layout
  conditionnel — moins de duplication de code, mais mélange deux tons éditoriaux dans une seule collection.

### Option E — Régie publicitaire
- À définir : réseau (AdSense / Ezoic / Mediavine / autre), nombre et emplacement des slots, priorité
  (avant ou après le repositionnement structurel). Le plumbing de consentement RGPD est prêt, le reste est
  à zéro — voir constat 3.

---

## Chantier 1 — Calculateur espace vital (le rendre central)

**3/4 sous-tâches**

- [x] **Trancher l'option A** — retenu : **A1**, scoring sur les données race existantes (taille,
      niveauActivite, adapteAppartement), aucune fiche à retoucher.
- [x] **Construire le calculateur** (`/outils/espace-vital/`) — `src/components/CalculateurEspaceVital.tsx`
      + page dédiée, chiens et chats couverts par le même outil avec un scoring **délibérément différent
      par espèce** (chez le chien : gabarit réel via poids × surface × accès extérieur selon le niveau
      d'activité × étage ; chez le chat : `adapteAppartement` + niveau d'activité comme besoin
      d'aménagement vertical, extérieur traité comme point de vigilance sécurité et non comme bonus
      automatique). Chaque race affiche ses raisons de correspondance (✓/△), pas qu'un score brut. Ajouté
      à la page `/outils/` existante. Testé en navigateur (parcours chien et chat), `npx astro check` (0
      erreur), `npm run build` (85 pages, +1) et `npm run audit:links` (0 lien cassé, 0 page orpheline) —
      tous verts.
- [x] **Ajouter le suivi GA4** — `calculator_view` (calculator: espace_vital) au montage, `calculator_interact`
      par réponse et sur le résultat final, même pattern que `CalculateurCout.tsx` via `src/lib/analytics.ts`.
- [ ] **Trancher l'option B** puis repositionner l'entrée du calculateur (accueil et/ou nav) en
      conséquence — non fait volontairement : modification structurante de l'accueil, en attente de
      validation.

## Chantier 2 — Diagnostic unifié (fusion des calculateurs)

**0/3 sous-tâches**

- [ ] **Trancher l'option C**
- [ ] **Construire le parcours unifié** : une saisie (espace, budget, temps de présence quotidien,
      expérience), sortie = score de compatibilité global + détail par critère, réutilisant les fonctions
      de scoring déjà écrites pour le quiz (`tailleRace()`, `budgetRace()`, distance ordinale sur
      `niveauActivite`) plutôt que de les dupliquer.
- [ ] **Garder les calculateurs individuels en l'état** pour le SEO longue traîne (aucune régression sur
      les URLs existantes déjà indexées).

## Chantier 3 — Section éditoriale "Bien-être animal en ville"

**0/3 sous-tâches**

- [ ] **Trancher l'option D** (structure de contenu)
- [ ] **Intégrer le premier article** ("Le bien-être animal en ville : enquête sur une cohabitation sous
      tension") une fois l'option D tranchée et une image Wikimedia Commons sourcée et vérifiée (licence +
      inspection visuelle, même exigence que pour les fiches race) — remplacer les liens internes de
      l'article vers des outils qui n'existent pas encore ("calculateur d'espace vital", "calculateur de
      budget annuel", "temps de présence requis") par les outils réels au moment de l'intégration.
- [ ] **Schema.org Article + FAQPage** sur ce type de contenu, sur le modèle déjà en place pour les guides
      (`GuideLayout.astro` génère déjà FAQPage automatiquement si `faq` est présent en frontmatter).

## Chantier 4 — SEO & maillage

**0/3 sous-tâches**

- [ ] **Maillage interne** entre fiches race, calculateurs et section éditoriale (liens contextuels dans
      les deux sens, comme déjà pratiqué dans les guides existants).
- [ ] **Sitemap** : ajouter le nouveau motif d'URL à `serialize()` dans `astro.config.mjs` (une ligne,
      pas un chantier en soi — voir constat 5).
- [ ] **Meta title/description** ciblant "espace vital chien appartement", "quel chien pour mon
      appartement", "bien-être animal en ville" sur les nouvelles pages créées.

## Chantier 5 — Monétisation display ads

**0/1 sous-tâche** *(bloqué sur une décision utilisateur — voir option E)*

- [ ] **Trancher l'option E** puis intégrer les emplacements, gatés sur `consentementDonne('publicite')`
      (le plumbing RGPD existe déjà, voir constat 3) — à positionner une fois la nouvelle structure de
      page stabilisée pour éviter de définir des emplacements sur une mise en page qui va encore bouger.

---

## Ce qui reste bloqué sur une décision utilisateur

- Toutes les options A à E ci-dessus.
- Le choix de la régie publicitaire (chantier 5) n'a techniquement aucune dépendance envers les autres
  chantiers, mais a plus de sens une fois la structure de page stabilisée — recommandation : le traiter en
  dernier.

## Prochaine action recommandée

Valider les options A à E (ou certaines d'entre elles pour débloquer un chantier à la fois, vu la
contrainte de 2-4h/semaine) — aucun code de production n'est modifié tant que ce n'est pas fait. Le
chantier 1 (calculateur espace vital, option A1 recommandée) est le plus indépendant et le plus rapide à
livrer en premier : il ne dépend d'aucune autre option tranchée.
