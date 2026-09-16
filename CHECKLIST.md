# Checklist — Boussole Animale (tâches restantes)

**Progression : 6/13 tâches (46%)**

Checklist unique, compilée le 15 septembre 2026 à partir de tout ce qui restait ouvert dans
`CHECKLIST_PROD.md` (100% terminé, rien à reporter), `CHECKLIST_CRO_GROWTH.md` (73%) et
`CHECKLIST_REPOSITIONNEMENT.md` (57%) — ces trois fichiers sont supprimés une fois celle-ci en place.
Seules les tâches non terminées sont reprises ici ; l'historique détaillé de tout ce qui a déjà été
livré reste dans l'historique git (chaque chantier a été commité et documenté au fur et à mesure).

---

## Contenu éditorial

- [ ] **Intégrer le premier article de la section "enquêtes"** — *en cours*
      Article sur le Monceau Dog Club (parc Monceau, bien-être canin en ville), rédigé et affiné avec
      l'utilisateur sur plusieurs versions (ton impersonnel aligné avec le reste du site, fidèle au
      communiqué de presse fourni, mention de corédaction humain/IA ajoutée). Communiqué de presse
      original reformaté en PDF pour être proposé au téléchargement. Email de validation à Vincent
      Danna (fondateur du Monceau Dog Club) rédigé. **Reste à faire** : envoi de l'email et validation
      de Vincent, puis construction réelle de l'infrastructure de contenu (collection `enquetes`,
      schéma, layout — décidée en option D1 mais volontairement pas construite à vide, voir chantier
      repositionnement) et publication effective sur le site une fois le feu vert obtenu.
- [ ] **Schema.org Article + FAQPage pour les enquêtes**
      Sur le modèle déjà en place pour les guides (`GuideLayout.astro` génère déjà `FAQPage`
      automatiquement si `faq` est présent en frontmatter) — à répliquer sur le layout `enquetes` au
      moment de la construction réelle, en même temps que le premier article.
- [ ] **Étendre le calendrier éditorial des guides hebdomadaires au-delà de la semaine 13**
      Le calendrier actuel (`SEO_GUIDES_PLAN.md`) couvre jusqu'au 6 décembre 2026. Reprendre la même
      méthode (intention de recherche + maillage disponible + écart avec l'existant) pour planifier la
      suite. Pas urgent — à faire quand la semaine 13 approche, pas maintenant.
- [x] **Catégorisation éditoriale des guides (option A, non-cassante)**
      Champ `categorie` optionnel ajouté au schéma des guides (`src/lib/guideCategories.ts` : 4
      catégories — Bien-être & Santé, Éducation & Comportement, Mode de vie urbain, Budget & Aspects
      pratiques). URLs de guides inchangées (`/guides/[slug]/`, zéro redirection). Les 7 guides publiés
      et les 12 brouillons en attente ont chacun reçu leur catégorie. `/guides/` regroupe désormais les
      guides par catégorie (avec un groupe "Non classé" de repli, non utilisé pour l'instant). Le fil
      d'Ariane des fiches guide insère la catégorie entre "Guides" et le titre (label sans lien, valide
      en JSON-LD `BreadcrumbList`). `scripts/next-guide-draft.mjs` inclut désormais un placeholder
      `categorie` dans le squelette généré. Vérifié : `npx astro check` (0 erreur), `npm run build` (86
      pages, aucune URL changée), `npm run audit:links` (0 lien cassé, 0 orphelin).

## Qualité & cohérence des outils

- [x] **Coût vétérinaire du calculateur de coût (chien) proportionnel au gabarit**
      Le forfait "santé courante" était fixe (25 €) alors que le site explique lui-même dans sa FAQ que
      les actes vétérinaires courants se calculent au poids. Remplacé par un barème par taille
      (18/25/32 € petit/moyen/grand), cohérent avec le reste du calculateur (l'assurance variait déjà
      par gabarit). Le calculateur chat n'a pas été touché : son forfait santé fixe est justifié, le
      poids ne pesant pas de la même façon sur le coût vétérinaire félin.
- [x] **Refonte du scoring du quiz race (`QuizRace.tsx`)**
      `scoreRace()` retournait un score brut sans justification, contrairement aux deux autres outils
      (espace vital, diagnostic) qui expliquent chaque point via des "raisons" affichées à l'utilisateur.
      Refactorisé pour retourner `{score, raisons}` sur tous les critères (logement, taille, activité,
      expérience, budget, aboiement, enfants), avec un garde-fou explicite : une race jugée "adaptée à
      l'appartement" mais à activité élevée affiche désormais une mise en garde même quand elle
      obtient un bon score.

## SEO & données

- [ ] **Exploiter les données Search Console**
      Connecté depuis le 13 septembre 2026 seulement — pas assez de recul pour en tirer des priorités
      fiables. À reprendre début octobre 2026 environ (3-4 semaines de données), pas avant : cocher
      cette case plus tôt reviendrait à décider sur une intention plutôt que sur des données réelles.
- [x] **Maillage interne du repositionnement**
      Liens contextuels ajoutés dans les deux sens : chaque fiche de race pointe désormais vers le
      calculateur d'espace vital depuis son bloc de données (`RaceLayout.astro`), le guide "quelle
      race pour appartement" mène vers espace vital + diagnostic avant le quiz, et la page du quiz
      renvoie vers le diagnostic unifié. `npm run audit:links` : 0 lien cassé, 0 page orpheline.
- [x] **Sitemap : ajouter le motif d'URL `enquetes`**
      Ligne de regex ajoutée dans `serialize()` (`astro.config.mjs`), en avance sur la construction
      réelle de la section — ne matche rien tant qu'aucune page `enquetes` n'existe, prêt pour quand
      elle sera publiée. Vérifié : `/outils/espace-vital/` et `/outils/diagnostic/` déjà couverts par
      le motif `/outils/*` existant, rien à ajouter de ce côté.
- [x] **Meta title/description sur `/outils/espace-vital/`**
      Reciblé sur "quel chien pour mon appartement" et "espace vital chien appartement" (titre et
      description, le mot "appartement" n'apparaissait auparavant que dans la FAQ). Le troisième
      mot-clé visé, "bien-être animal en ville", sera couvert naturellement par l'article Monceau Dog
      Club une fois publié — pas de page existante pertinente pour le cibler en attendant.

## Réseaux sociaux

- [ ] **Définir de nouvelles sources de contenu pour le pipeline social**
      Le pipeline (`social/scripts/lib/content-source.mjs`) ne lit aujourd'hui que les fiches de race
      et les guides. Extension possible : FAQ des fiches en format question/réponse dédié, données des
      calculateurs. Périmètre pas encore défini — décision de scope à prendre avant tout développement.
- [ ] **Automatiser les publications via API (Instagram Graph API / TikTok Content Posting API)**
      Bloqué, non contournable sans l'utilisateur : nécessite un compte développeur Meta et TikTok,
      une validation business (Meta exige une revue d'app pour l'accès en production), et des jetons
      liés à de vrais comptes professionnels. Dès que ces accès existeront, le sas de validation
      humaine déjà en place dans le pipeline doit rester le principe directeur — une API ne doit
      remplacer que la publication mécanique, jamais la relecture avant publication.

## Monétisation

- [ ] **Trancher l'option E (régie publicitaire) puis intégrer les emplacements**
      Réseau à choisir (AdSense / Ezoic / Mediavine / autre), nombre et emplacement des slots. Le
      plumbing RGPD est déjà prêt (`src/lib/consentement.ts` déclare une catégorie `publicite`,
      refusée par défaut) — le reste est à zéro. À positionner une fois la structure de page du
      repositionnement stabilisée, pas avant.

---

## Ce qui reste bloqué sur une décision utilisateur ou une information externe

- **Search Console** : question de temps, pas de décision — début octobre 2026 environ.
- **Nouvelles sources de contenu social** : décision de scope à prendre par l'utilisateur.
- **Automatisation Instagram/TikTok** : comptes développeur et validation business à créer par
  l'utilisateur.
- **Option E (régie publicitaire)** : décision utilisateur encore ouverte.
- **Premier article enquêtes** : en attente de la validation de Vincent Danna (Monceau Dog Club).
- **Backlinks / autorité externe** : identifié comme le plus gros levier SEO restant, mais entièrement
  hors de portée technique (annuaires, partenariats éleveurs/vétérinaires/associations, contenu
  invité) — nécessite un engagement réel de l'utilisateur, pas une action de code.

## Prochaine action recommandée

Maillage interne, sitemap, meta du repositionnement, audit de cohérence quiz/calculateurs et
catégorisation éditoriale des guides sont faits (15-16/09/2026). La validation de Vincent Danna reste
la clé pour débloquer les deux dernières tâches de contenu éditorial (premier article + schema.org
associé). En dehors de ça, ce qui reste demande soit une décision de l'utilisateur (nouvelles sources
sociales, option E régie pub), soit d'attendre (Search Console, comptes développeur Instagram/TikTok).
