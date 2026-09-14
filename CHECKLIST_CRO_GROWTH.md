# Checklist Croissance, CRO & Industrialisation — Boussole Animale

**Progression : 11/15 tâches (73%)**

Dernière mise à jour : 14 septembre 2026 — Chantier ouvert aujourd'hui, en continuité directe des 4 chantiers
terminés (UX/UI 26/26, SEO 15/15, Réseaux Sociaux 14/14, Production-Ready & Hardening 10/10). Objectif : passer
d'un site fini à un site qui s'optimise en continu, sur la base de données réelles plutôt que d'hypothèses —
même méthode que les chantiers précédents : jamais de case cochée sans vérification en conditions réelles.

**Limite assumée dès le départ** : deux sous-chantiers entiers (exploitation Search Console, automatisation
Instagram/TikTok) sont matériellement bloqués tant que le temps ou l'accès nécessaires ne sont pas réunis — ce
n'est pas paresse, voir le détail dans chaque item concerné et la section "Ce qui reste bloqué" en bas de page.

---

## Phase 1 — Expansion Sémantique & Automatisation SEO Avancée

**3/5 sous-tâches**

- [x] **Pipeline de guides hebdomadaires industrialisé**
  Déjà construit et en production depuis le 13 septembre 2026, pas un nouveau chantier : voir
  `SEO_GUIDES_PLAN.md`. Calendrier de 13 semaines, 12 guides déjà rédigés et mis en attente
  (`.mdx.draft` + `datePublicationPrevue`), publication automatique au rythme d'un par semaine via une tâche
  planifiée (`scripts/publish-next-guide.mjs`). Semaine 1 publiée, semaine 2 programmée le 20 septembre 2026.
  Chaque guide est mappé à ≥3 fiches race existantes pour un maillage interne réel, jamais décoratif.

- [x] **Audit du maillage interne**
  `scripts/audit-internal-links.mjs` (nouveau, `npm run audit:links`) : scanne tout `dist/**/*.html` généré,
  détecte les liens internes cassés (cible inexistante) et les fiches/guides orphelins (zéro lien entrant depuis
  une autre page publiée). Premier passage sur les 74 pages du build actuel : **0 lien cassé, 0 page orpheline**
  — le maillage des 8 fiches ajoutées hier (Beauceron, Bouledogue Anglais, Carlin, Staffordshire Bull Terrier,
  Bleu Russe, Exotic Shorthair, Somali, Munchkin) est correctement intégré aux hubs. À relancer après chaque
  ajout de contenu, pas seulement aujourd'hui.

- [x] **Ré-audit titres/meta/alt et ajout de données structurées ItemList**
  Répond à la question "que peut-on faire pour pousser le SEO au maximum ?" : le plus gros levier restant
  (backlinks/autorité externe) n'est pas actionnable de ce côté — nécessite des actions réelles de
  l'utilisateur (annuaires, partenariats, contenu invité). Concentré donc sur ce qui l'est.
  **Ré-audit des 16 fiches ajoutées depuis le dernier audit SEO** (8 races du 13 septembre + 8 du 14 septembre) :
  titres SEO générés par le même gabarit que tout le catalogue (`${nom} : caractère, prix, santé`, 50 à 71
  caractères + suffixe site — cohérent avec la fourchette cible 45-70 déjà validée, un seul cas à 71
  caractères, écart négligeable) ; alt text 74 à 110 caractères sur les 16, aucun générique, aucun manquant ;
  meta descriptions passées par la même fonction de troncature centralisée (`tronquerPourMeta()`,
  `src/lib/seo.ts`) que tout le site — rien à corriger, le gabarit existant tenait déjà la charge.
  **Ajout de données structurées `ItemList`** sur `/chiens/` et `/chats/` (nouveau, pas encore fait) : signale
  explicitement à Google qu'il s'agit d'un catalogue complet de races, pas une simple liste de blog — généré
  automatiquement depuis les mêmes données que la grille affichée (34 et 26 éléments respectivement), donc
  jamais désynchronisé d'une nouvelle fiche ajoutée. **Testé en conditions réelles** : JSON-LD vérifié dans le
  navigateur sur les deux hubs, `numberOfItems` et `itemListElement` corrects, URLs absolues valides.

- [ ] **Extension du calendrier éditorial au-delà de la semaine 13**
  Le calendrier actuel couvre un trimestre (jusqu'au 6 décembre 2026). Reprendre la méthode de
  `SEO_GUIDES_PLAN.md` (intention de recherche + maillage disponible + écart avec l'existant) pour planifier les
  semaines suivantes — à faire quand la semaine 13 approche, pas mainenant en urgence.

- [ ] **Exploitation des données Search Console**
  **Bloqué, temporairement et volontairement.** Search Console n'est connecté que depuis le 13 septembre 2026 —
  1 jour de données au moment de ce chantier, aucune requête réelle exploitable pour prioriser quoi que ce soit.
  `SEO_GUIDES_PLAN.md` porte déjà la note de rappel : recalibrer le calendrier avec les données réelles
  (Performances → Requêtes) dans 3-4 semaines, pas avant. Cocher cette case avant d'avoir de vraies données
  serait exactement le genre de case cochée sur intention que ce projet évite depuis le début.

---

## Phase 2 — Conversion, Rétention & Expérience Utilisateur (CRO)

**5/5 sous-tâches**

- [x] **Instrumentation GA4 des tunnels de conversion**
  `src/lib/analytics.ts` (nouveau) : helper `trackEvent()` partagé, même garde de consentement que le reste du
  site (`gtag` doit déjà exister — sinon no-op silencieux, rien en attente). Quiz (`QuizRace.tsx`) : `quiz_start`
  au montage, `quiz_step` à chaque question atteinte (`step`/`total`, calcule l'abandon par étape dans GA4),
  `quiz_complete` avec le premier résultat obtenu. Les 3 calculateurs (`CalculateurCout.tsx`,
  `CalculateurCoutChat.tsx`, `CalculateurAge.tsx`) : `calculator_view` au montage, `calculator_interact` sur
  chaque contrôle (taille, gamme, assurance, toilettage, litière, extérieur, espèce, âge) avec le champ et la
  valeur — le slider d'âge est tracké sur `onChange` (relâchement), pas `onInput` (glissement continu), pour ne
  pas noyer GA4 d'événements. **Testé en conditions réelles dans le navigateur**, pas juste lu dans le code :
  après consentement, `quiz_start` puis `quiz_step` (`step: 2, total: 5`) confirmés dans `dataLayer` après
  réponse à la première question ; `calculator_view` puis `calculator_interact` (`taille: grand`,
  `assurance: true`) confirmés sur le calculateur de coût chien. `npx astro check` : 0 erreur.

- [x] **Favoris utilisateur (localStorage)**
  Scope validé avec l'utilisateur : fiches race + guides (pas seulement les fiches). `src/lib/favoris.ts`
  (stockage localStorage, événement `favoris:maj` pour synchroniser plusieurs boutons affichés sur une même
  page — même schéma que `consentement.ts`) + `src/components/BoutonFavori.tsx` (icône cœur, variante compacte
  en superposition sur les cartes des hubs, variante standard sur l'en-tête des fiches/guides). Nouvelle page
  `/favoris/` (`src/pages/favoris/index.astro` + `FavorisListe.tsx`) : précharge tout le catalogue côté serveur
  (comme les hubs), filtre côté client selon les favoris réels au montage — obligatoire sur un site statique
  sans compte utilisateur, le localStorage n'existant que côté navigateur. Lien "Favoris" ajouté à la navigation
  (desktop et menu mobile). **Testé en conditions réelles** : favori basculé sur une fiche et sur un guide,
  retrouvés sur `/favoris/` avec la bonne image/titre/résumé ; état resynchronisé correctement entre les deux
  emplacements (bouton sur la carte du hub et bouton sur la page de la fiche).

- [x] **Comparateurs avancés**
  Scope validé avec l'utilisateur : même espèce uniquement (pas chien vs chat), 2 à 3 races, sélection via des
  cases à cocher sur les pages `/chiens/` et `/chats/` (pas une page de recherche dédiée). Ajout dans
  `HubRaces.tsx` : case "Comparer" par carte (plafonnée à 3), barre flottante "Comparer (n) →" qui apparaît dès
  2 sélections et redirige vers `/comparateur/?especes=...&races=slug1,slug2`. Nouvelle page `/comparateur/`
  (`src/pages/comparateur/index.astro` + `Comparateur.tsx`) : la sélection vit dans l'URL mais n'est lue que
  côté client (site statique, pas de SSR) — même stratégie que les filtres des hubs. Tableau comparatif sur
  taille, poids, espérance de vie, niveau d'activité, type de poil, aboiement (chiens), appartement, enfants,
  prix d'achat et coût mensuel, avec un bouton "Retirer" par colonne qui met à jour l'URL sans recharger la
  page. **Testé en conditions réelles** : 2 races cochées sur `/chiens/` → barre flottante → tableau généré
  avec les vraies données (American Staffordshire Terrier vs Basenji vérifiés à l'écran), aucune erreur console.
  `npx astro check` : 0 erreur après ajout de ces deux fonctionnalités (76 pages au total, +2 vs avant).

- [x] **Quiz "quelle race me correspond" — pool de races élargi et automatique**
  Le quiz ne comparait que 6 races codées en dur dans `QuizRace.tsx`, sur un catalogue qui en compte désormais 30
  — repéré en répondant à une question exploratoire de l'utilisateur sur "professionnaliser" le quiz, avant tout
  développement. Corrigé à la racine plutôt qu'en ajoutant des questions sur un pool encore restreint :
  `QuizRace.tsx` reçoit maintenant `races` en prop, alimenté par `quelle-race-me-correspond.astro` depuis
  `getCollection('chiens')` — toute nouvelle fiche chien intègre automatiquement le pool du quiz au prochain
  build, sans rien à modifier dans le composant. Le scoring, auparavant basé sur des champs inventés
  (`ficheDisponible`, `entretienFaible`, listes `experience`/`logement` par race saisies à la main), a été
  réécrit pour ne dépendre que de champs réels et garantis présents sur chaque fiche (`niveauActivite`,
  `adapteAppartement`, `adapteEnfants`, `aboiement`) : distance ordinale sur le niveau d'activité plutôt qu'un
  simple "correspond / ne correspond pas", heuristique documentée pour "débutant" (activité très élevée
  déconseillée) plutôt qu'une liste inventée par race. La question "entretien du poil" — sans champ réel pour
  l'étayer sur 30 races — a été remplacée par "tolérance aux aboiements", qui réutilise le champ `aboiement`
  déjà présent sur chaque fiche et déjà utilisé par les filtres des hubs : même nombre de questions (5), mais
  chacune maintenant fondée sur une donnée réelle plutôt qu'un jugement à saisir manuellement par race. FAQ de
  la page mise à jour (l'ancien texte affirmait encore "6 races" / "14 races" au total, périmé). **Testé en
  conditions réelles** : parcours complet du quiz (appartement, faible activité, débutant, aboiement faible,
  pas d'enfants) → résultats Bouledogue Anglais / Carlin / Shih Tzu, cohérents avec les réponses et incluant des
  races ajoutées hier — preuve que l'intégration automatique fonctionne, pas seulement que le code compile.
  Ajout volontairement limité au pool de races (pas de nouvelles questions) : décision prise avec l'utilisateur
  d'attendre les données réelles de `quiz_step` avant de rallonger le quiz plutôt que d'ajouter des questions à
  l'aveugle — voir Phase 1.

- [x] **Quiz — deux questions supplémentaires (taille, budget)**
  Revenu sur la décision d'attendre les données `quiz_step` ci-dessus : l'utilisateur a explicitement demandé ces
  deux questions plutôt que d'attendre, choix assumé de sa part après que le compromis (abandon potentiel vs.
  précision) lui a été présenté. "Quelle taille de chien recherchez-vous ?" (petit/moyen/grand/peu importe) :
  classée sur le poids moyen de chaque race (`poids.min`/`poids.max`, garanti présent sur toutes les fiches),
  mêmes seuils que `CalculateurAge.tsx` (petit &lt;9 kg, moyen 9-23 kg, grand &gt;23 kg) pour ne pas avoir deux
  découpages différents sur le site. "Quel budget mensuel visez-vous ?" (moins de 70 €/70-120 €/plus de
  120 €/peu importe) : seuils choisis en regardant la vraie distribution des coûts mensuels des 30 fiches
  (30-60 € à 100-200 €), pas arbitrairement. Le quiz passe de 5 à 7 questions ; toutes les mentions codées en dur
  du nombre de questions ont été mises à jour (page du quiz, page `/outils/`, FAQ, meta description). **Testé en
  conditions réelles** : parcours complet (appartement, petit, faible activité, débutant, budget bas, aboiement
  faible, pas d'enfants) → Shih Tzu / Carlin / Bichon Frisé, tous effectivement petits et économiques — résultat
  visiblement plus affiné qu'avant l'ajout des deux critères. `npx astro check` : 0 erreur.

---

## Phase 3 — Performance, Core Web Vitals & Résilience 2.0

**2/2 sous-tâches**

- [x] **RUM (Real User Monitoring) — Core Web Vitals en conditions réelles**
  `src/components/WebVitals.astro` (nouveau), branché dans `Layout.astro` à côté d'`Analytics.astro`. Utilise la
  librairie officielle `web-vitals` (npm, ajoutée en dépendance) pour mesurer LCP, CLS, INP, FCP et TTFB
  réellement vécus par chaque visiteur — pas seulement les scores de laboratoire Lighthouse (93-97) déjà
  obtenus lors du chantier Hardening. Envoie chaque métrique vers GA4 selon le schéma d'événement officiellement
  documenté par web.dev (`value`, `metric_id`, `metric_value`, `metric_delta`). **Respecte le même consentement
  que le reste du site** : ne s'active que si `gtag` existe déjà, donc jamais avant l'acceptation de la
  catégorie "audience" — aucune collecte supplémentaire hors du cadre déjà posé. **Testé en conditions réelles
  dans le navigateur** : après consentement, l'événement `TTFB` apparaît bien dans `dataLayer` avec la structure
  exacte attendue (`metric_id`, `metric_value`, `metric_delta` réels, pas simulés) ; LCP/CLS/INP n'ont pas eu
  l'occasion de se déclencher dans la fenêtre de test (ils se déclenchent au changement de visibilité ou à
  l'interaction, logique interne de la librairie officielle, pas du code custom à ce projet) — le mécanisme
  bout-en-bout est vérifié, pas supposé.

- [x] **Budget de performance et veille anti-régression — premier audit comparatif**
  Le catalogue est passé de 65 à 84 pages depuis le chantier Hardening (+16 fiches race, +guides, +favoris,
  +comparateur) — le seuil "catalogue suffisamment grossi" noté ci-dessus est atteint, premier vrai audit
  comparatif lancé (`npx lighthouse`, même méthodologie que le chantier Hardening : build de production,
  serveur local gzippé reproduisant Netlify).
  **Résultats** : accueil stable (Performance 95, a11y/best-practices/SEO 100 — identique au chantier
  Hardening). Hub `/chiens/` : 93 → 91 (LCP 2.9s → 3.1s). Hub `/chats/` : 95 → 92. **Régression réelle mais
  attendue et proportionnée** : les deux hubs affichent désormais 34 et 26 cartes (poids, images) contre un
  catalogue plus restreint au moment du premier audit — pas un bug introduit, la conséquence mécanique de
  16 fiches supplémentaires dans une grille qui charge tout en une fois. Les deux scores restent confortablement
  dans la zone "bon" de Lighthouse (≥ 90) ; a11y/best-practices/SEO restent à 100 partout. **Décision assumée,
  pas d'optimisation forcée à ce stade** : une pagination ou un chargement progressif des hubs serait la
  correction naturelle si la baisse continuait avec le catalogue, mais 2-3 points sur une grille qui a grossi
  de plus de 40 % ne justifie pas cette complexité aujourd'hui — à surveiller au prochain lot de fiches, pas à
  corriger par anticipation.

---

## Phase 4 — Scalabilité du Pipeline Social & Éditorial

**1/3 sous-tâches**

- [x] **Calendrier social 4 semaines validé**
  Acquis du chantier précédent (14/14), pas un nouvel item : `social/calendar/semaine-01.json` à `semaine-04.json`,
  28 posts réels générés et testés. Rappelé ici uniquement comme point de départ de l'industrialisation, pas
  recompté dans la progression d'un chantier déjà clos.

- [ ] **Nouvelles sources de contenu pour le pipeline**
  Le pipeline lit aujourd'hui les fiches race et guides existants (`social/scripts/lib/content-source.mjs`).
  Étendre à d'autres sources (ex. FAQ des fiches en format question/réponse dédié, données des calculateurs)
  reste à cadrer — pas de périmètre précis fourni pour l'instant.

- [ ] **Automatisation des publications via API (Instagram Graph API / TikTok Content Posting API)**
  **Bloqué, non contournable sans l'utilisateur.** Ces API nécessitent un compte développeur Meta/TikTok, une
  validation business (Meta exige une revue d'app pour l'accès en production à l'API de publication), et des
  jetons d'accès liés à de vrais comptes professionnels Instagram/TikTok — aucun de ces éléments ne peut être
  créé ou simulé de ce côté. Dès que ces accès existent, le sas de validation humaine déjà en place dans le
  pipeline (axe D du chantier Réseaux Sociaux) reste le principe directeur : une API ne doit remplacer que la
  publication mécanique, jamais la relecture avant publication.

---

## Ce qui reste bloqué sur des informations, accès ou décisions utilisateur

- **Search Console** : pas assez de données pour être exploitable avant début octobre 2026 environ (3-4 semaines
  après connexion) — rien à débloquer, juste à attendre.
- **Automatisation Instagram/TikTok** : nécessite la création de comptes développeur Meta et TikTok, et la
  validation business associée — actions que seul l'utilisateur peut engager.
- **Nouvelles sources de contenu pour le pipeline social** : périmètre pas encore défini.
- **Backlinks / autorité externe** : identifié comme le plus gros levier SEO restant (14 septembre 2026), mais
  entièrement hors de portée technique — annuaires spécialisés, partenariats éleveurs/vétérinaires/associations,
  contenu invité. Aucune action de ce côté sans engagement réel de l'utilisateur ; possibilité d'aider à préparer
  un support (argumentaire, liste de cibles) si le sujet est repris.

## Prochaine action recommandée

L'instrumentation GA4, les favoris, le comparateur et les données structurées sont en place — reste à laisser
les données s'accumuler (1-2 semaines pour GA4, 3-4 pour Search Console) avant d'en tirer des conclusions.
Toutes les tâches non bloquées restantes demandent soit une décision de scope de l'utilisateur (nouvelles
sources de contenu social), soit une démarche hors-site (backlinks) — rien à coder à l'aveugle avant l'une ou
l'autre.
