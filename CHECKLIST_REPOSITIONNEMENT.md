# Checklist — Repositionnement stratégique Boussole Animale

**Progression : 8/14 tâches (57%)**

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

### Option D — Structure de la section éditoriale — ✅ TRANCHÉE : D1
- **D1 (retenu)** : nouvelle collection de contenu `enquetes` séparée de `guides`, avec son propre schéma
  (sources journalistiques, ton long-form) et son propre layout — l'URL et le schéma à part sont ce qui
  rend la différenciation éditoriale visible, pas seulement le ton du texte. Construit en réutilisant la
  structure de `GuideLayout.astro` plutôt qu'en dupliquant à l'aveugle.
- **D2** : un champ `type: 'guide' | 'enquete'` ajouté à la collection `guides` existante — écarté, dilue
  la différenciation recherchée sous une URL `/guides/...` commune.

**Décidé mais pas construit** : bâtir la collection/le schéma/le layout à vide, sans article réel, reviendrait
à deviner la forme des champs (citations, structure, interviews) avant de savoir ce qu'un vrai article
demande. Construction repoussée au moment où un article réel sera prêt à intégrer, plutôt que faite en
amont sur devis.

### Option E — Régie publicitaire
- À définir : réseau (AdSense / Ezoic / Mediavine / autre), nombre et emplacement des slots, priorité
  (avant ou après le repositionnement structurel). Le plumbing de consentement RGPD est prêt, le reste est
  à zéro — voir constat 3.

---

## Chantier 1 — Calculateur espace vital (le rendre central)

**4/4 sous-tâches — chantier terminé**

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
- [x] **Trancher l'option B** — retenu : **B1**. Hero de l'accueil (`src/pages/index.astro`) réécrit :
      le calculateur d'espace vital devient le CTA principal ("Votre logement est-il fait pour ce chien ou
      ce chat ?" → "Tester mon logement →"), le quiz race reste immédiatement visible juste en dessous
      en lien secondaire ("Faites le quiz complet →") plutôt qu'enterré dans Outils — pour ne pas perdre
      son trafic et ses conversions déjà établis pendant que l'espace vital fait ses preuves. Reste de la
      page (fiches à la une, cartes Chiens/Chats/Outils, derniers guides) inchangé. Vérifié en navigateur
      (desktop + mobile) et `npm run build` + `npm run audit:links` tous verts après la modification.

## Chantier 2 — Diagnostic unifié (fusion des calculateurs)

**3/3 sous-tâches — chantier terminé**

- [x] **Trancher l'option C** — retenu : **C1**, nouvelle page à part, aucun bandeau promotionnel sur les
      calculateurs individuels pour l'instant (à revisiter avec des données GA4 réelles, même discipline
      que pour B1).
- [x] **Construire le parcours unifié** (`/outils/diagnostic/`) — `src/components/DiagnosticUnifie.tsx`,
      7 questions (espèce, surface, extérieur, étage, budget, présence quotidienne, expérience), résultat
      en détail par critère (espace & logement, budget, présence, expérience), pas qu'un score global.
      Refactor de fond pour éviter la duplication demandée : les primitives de scoring (`tailleChien()`,
      `budgetRace()`, `NIVEAU_ORDRE`, `SURFACE_RANG`, etc.) ont été extraites dans un nouveau
      `src/lib/raceScoring.ts`, partagé désormais par `QuizRace.tsx`, `CalculateurEspaceVital.tsx` et
      `DiagnosticUnifie.tsx` — qui réutilise en plus directement `scoreChien()`/`scoreChat()` du
      calculateur d'espace vital plutôt que de réécrire cette logique. Le critère "présence quotidienne"
      est un nouvel axe (temps seul chaque jour), traité différemment chien/chat comme le reste (le chat
      tolère mieux la solitude à niveau d'activité équivalent). Testé en navigateur bout en bout, `npx
      astro check` (0 erreur), `npm run build` (86 pages, +1) et `npm run audit:links` (0 lien cassé, 0
      page orpheline) — tous verts.
- [x] **Garder les calculateurs individuels en l'état** — `/outils/espace-vital/`, `/outils/cout-mensuel-*/`
      et le quiz race ne sont pas touchés, toujours accessibles pour le SEO longue traîne existant. Le
      diagnostic est purement additif, listé en premier sur `/outils/` mais sans redirection ni bandeau.

## Chantier 3 — Section éditoriale "Bien-être animal en ville"

**1/3 sous-tâches**

- [x] **Trancher l'option D** — retenu : **D1**, nouvelle collection `enquetes` séparée (voir détail
      ci-dessus).
- [ ] **Intégrer le premier article** — **en attente d'un article réel**, volontairement non construit à
      vide (voir note sous l'option D). L'utilisateur attend un appel avec le président d'une association
      pour du contenu original (interview) avant de rédiger l'article ; le brouillon précédent ("Le
      bien-être animal en ville : enquête sur une cohabitation sous tension") a été annulé faute d'image
      Wikimedia sourcée et vérifiée. La collection, le schéma et le layout `enquetes` seront construits en
      même temps que ce premier article, pas avant.
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

## Retours utilisateurs post-lancement

### Retour vétérinaire (15/09/2026) — pénalité "étage sans ascenseur" trop limitée au gabarit

**Constat** : un testeur (avec expertise vétérinaire) a signalé qu'avec le scénario "appartement en étage
sans ascenseur", le calculateur d'espace vital recommandait Bouledogue Français, Bouledogue Anglais, Bichon
Frisé et Carlin — trois races brachycéphales et plusieurs races à risque de hernie discale/luxation de la
rotule, alors que la pénalité "sans ascenseur" ne s'appliquait qu'au gabarit "grand" dans le code d'origine.
Escaliers répétés + brachycéphalie ou prédisposition articulaire/dorsale = vraie sollicitation santé, pas
seulement une question de poids.

**Correction apportée** :
- Ajout d'un champ optionnel `predispositions: { brachycephale, risqueArticulaireOuDorsal }` au schéma des
  races (`src/content.config.ts`) — **dérivé du texte déjà documenté** en section "Santé et prédispositions"
  de chaque fiche (BOAS, hémivertèbres, luxation de la rotule, hernie discale, dysplasie...), pas une
  nouvelle recherche inventée. 19 fiches concernées : chiens — Bouledogue Anglais, Bouledogue Français
  (les deux prédispositions), Boxer, Carlin, Dogue de Bordeaux, Shih Tzu (brachycéphalie) ; Bichon Frisé,
  Chihuahua, Caniche, Spitz Nain, Staffordshire Bull Terrier, Yorkshire Terrier, Jack Russell Terrier,
  Teckel (articulaire/dorsal). Chats — Himalayen, Exotic Shorthair, Persan (brachycéphalie) ; Chartreux,
  Devon Rex, Maine Coon (articulaire/dorsal).
- Le scoring "étage sans ascenseur" dans `CalculateurEspaceVital.tsx` (réutilisé par le diagnostic unifié)
  cumule désormais les motifs applicables — grand gabarit, brachycéphalie, prédisposition articulaire ou
  dorsale — plutôt qu'un seul critère exclusif, avec un message qui nomme la raison précise.
- Nouvelle question FAQ ajoutée sur `/outils/espace-vital/` expliquant ce choix.
- Vérifié en reproduisant exactement le scénario signalé : Bichon Frisé et Bouledogue Anglais affichent
  désormais un △ avec l'explication correcte, les races non concernées (Cavalier King Charles, Cocker
  Américain) restent en ✓ sans fausse alerte. `npx astro check` (0 erreur), `npm run build` (86 pages) et
  `npm run audit:links` (0 lien cassé) tous verts.

---

## Ce qui reste bloqué sur une décision utilisateur ou une information externe

- **Option E** (régie publicitaire) — décision utilisateur encore ouverte, voir chantier 5.
- **Chantier 3** (premier article "enquête") — bloqué sur un événement externe, pas une décision : l'utilisateur
  attend un appel avec le président d'une association pour obtenir du contenu original (interview) avant
  de rédiger. Rien à faire de mon côté tant que ce contenu n'existe pas.

## Prochaine action recommandée

Options A, B, C et D sont tranchées, chantiers 1 et 2 livrés et en production. Il reste : attendre le
contenu du chantier 3 (hors de mon contrôle), ou avancer sur le chantier 4 (SEO & maillage — maillage
interne, sitemap, meta) qui ne dépend d'aucune option restante et peut être fait dès maintenant si
l'utilisateur veut continuer sans attendre l'article. L'option E (régie pub) reste recommandée en dernier,
une fois la structure de page stabilisée.
