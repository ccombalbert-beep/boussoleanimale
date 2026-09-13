# Checklist Production-Ready & Hardening — Boussole Animale

**Progression : 8/10 tâches (80%)**

Dernière mise à jour : 13 septembre 2026 — Phase 3 (Core Web Vitals/Lighthouse) terminée : audit réel sur 5 pages
représentatives, un vrai bug d'accessibilité trouvé et corrigé (ordre des titres cassé sur les hubs /chiens/ et
/chats/, désormais 100/100 partout). Il ne reste que les 2 tâches bloquées sur des informations que seul
l'utilisateur peut fournir (identité de l'éditeur pour les mentions légales, accès Netlify/registrar pour le
domaine) — tout le reste faisable sans lui est fait.

Chantier suivant la même méthode que UX/UI et SEO : audit du code réel avant de cocher quoi que ce soit, jamais
de case cochée sur la seule base d'une intention.

---

## Phase 1 — Sécurité, Headers & Conformité Légale (Hardening)

**3/4 sous-tâches**

- [x] **Content Security Policy implémentée et testée**
  Générée automatiquement à chaque build (`scripts/generate-csp.mjs`, hook `postbuild` dans `package.json`) —
  scanne tout `dist/**/*.html`, calcule le hash SHA-256 de chaque script inline réellement présent, écrit
  `dist/_headers` (format Netlify) avec CSP + `X-Frame-Options: DENY` + `X-Content-Type-Options: nosniff` +
  `Referrer-Policy: strict-origin-when-cross-origin` + `Permissions-Policy`.
  **Pourquoi un script et pas des hash codés en dur dans `netlify.toml`** : Astro injecte des scripts inline
  dont le contenu varie selon la page (runtime d'hydratation Preact). Une CSP figée à la main se désynchronise
  silencieusement au moindre changement de composant ou mise à jour d'Astro ; ce script ne peut pas dériver
  puisqu'il relit le build réel à chaque fois.
  **Testé pour de vrai, pas juste écrit** : serveur local reproduisant le comportement `_headers` de Netlify
  (`scripts/serve-dist-with-headers.mjs`) + navigateur réel. Deux problèmes réels trouvés et corrigés que
  l'analyse statique seule n'aurait pas révélés :
  - Un script est recréé dynamiquement au chargement par `<ClientRouter />` (View Transitions), absent du HTML
    statique donc invisible au scan — hash vérifié stable sur plusieurs rechargements, ajouté en exception
    documentée dans le script (`CLIENT_ROUTER_RUNTIME_HASH`). À revérifier après toute montée de version majeure
    d'Astro.
  - L'effet "magnetic" du CTA principal (`Layout.astro`) pose `el.style.transform`/`transition` en JS à chaque
    mousemove — un style différent à chaque frame, impossible à allowlister par hash. `style-src` garde donc
    `'unsafe-inline'`, seule exception du document ; `script-src` reste strict (hash uniquement, zéro
    `'unsafe-inline'`, zéro `'unsafe-eval'`).
  - Correction (audit phase 2) : une deuxième source d'attribut `style` inline existe, `HubRaces.tsx` pose
    `style={\`view-transition-name: race-photo-${race.slug}\`}` sur chaque image — déjà couverte par le même
    `'unsafe-inline'` de `style-src`, donc aucun changement de policy nécessaire, mais la justification du
    commentaire dans `generate-csp.mjs` ne mentionnait que l'effet magnétique ; à garder en tête si `style-src`
    est un jour resserré.
  - Validé en conditions réelles après correctif : navigation interne (ClientRouter), bascule clair/sombre,
    ouverture + personnalisation + enregistrement du bandeau cookies — **zéro violation CSP** en console sur un
    onglet propre.

- [x] **Secrets, variables d'environnement et logs de test nettoyés**
  Audit du dépôt : aucun fichier `.env`/`.env.production` présent, `.gitignore` les couvre déjà correctement.
  Recherche exhaustive de `console.log`/`console.debug`/`debugger` dans `src/` : aucune occurrence. Aucun
  attribut `style="..."` inline dans le code source (confirmé avant d'écrire la CSP — seuls les styles posés
  dynamiquement en JS existent, cf. ci-dessus).

- [x] **Bandeau de consentement cookies (CMP) — intégration et validation**
  Construit et testé dans une session précédente (`src/components/CookieBanner.astro` + `src/lib/consentement.ts`) :
  Tout accepter / Tout refuser / Personnaliser, persistance localStorage, réouverture via "Gérer les cookies" en
  pied de page, testé clair/sombre/mobile. Revalidé aujourd'hui sous la nouvelle CSP stricte (aucune régression).

- [ ] **Mentions légales — informations réelles**
  **Bloqué, volontairement.** `src/pages/mentions-legales.astro` reste un placeholder (éditeur, SIRET, hébergeur
  à renseigner). Cette information ne peut pas être inventée — voir la note permanente à ce sujet : à compléter
  automatiquement dès que le site est en ligne et que l'utilisateur fournit l'identité réelle de l'éditeur et de
  l'hébergeur. Ne pas cocher cette case tant que ces informations n'ont pas été fournies.

---

## Phase 2 — Résilience, Erreurs & Edge Cases

**2/2 sous-tâches**

- [x] **Page 404 sur-mesure, style "Cabinet Naturaliste"**
  `src/pages/404.astro` : filigrane rose des vents (`CompassMark`), accroche "Spécimen non répertorié" dans le
  ton éditorial du site, 4 cartes de rebond (Chiens/Chats/Outils/Guides) + retour accueil. Vérifié clair/sombre
  dans le navigateur. `dist/404.html` généré par le build — Netlify le sert automatiquement comme page 404 sans
  configuration supplémentaire.

- [x] **Tests de robustesse des calculateurs et du quiz face aux entrées extrêmes**
  Audit de code d'abord : `CalculateurCout.tsx`, `CalculateurAge.tsx` et `QuizRace.tsx` n'exposent aucun champ
  texte/numérique libre — uniquement boutons, cases à cocher et un `<input type="range">` borné par le
  navigateur (min/max/step). Les classiques "nombre négatif / NaN / chaîne non numérique" ne s'appliquent donc
  pas : robuste par construction, pas par validation ajoutée après coup. Le champ de recherche de `HubRaces.tsx`
  (`type="text"`) utilise une simple sous-chaîne (`.includes()`), jamais une regex construite depuis l'entrée
  utilisateur — pas de risque de plantage ni d'injection.
  **Testé en conditions réelles dans le navigateur** (pas seulement lu) :
  - Retour arrière navigateur en plein quiz → quitte proprement la page, aucune corruption d'état au retour.
  - **Bug réel trouvé et corrigé** : un double-clic rapide sur une réponse du quiz faisait sauter une question
    entière — le second clic atterrissait sur le bouton de la question suivante, apparu à la même position
    écran avant que l'utilisateur ne la voie. Reproduit avec un vrai double-clic natif, corrigé par un verrou
    anti-double-soumission dans `QuizRace.tsx` (`enTraitement`, relâché une fois la nouvelle question affichée),
    revérifié après correctif : un double-clic n'avance plus que d'une question.
  - Réponses volontairement contradictoires (appartement + activité élevée + débutant + entretien minimal +
    enfants) → aucun plantage, 3 résultats cohérents affichés (dégradation gracieuse vers les meilleures
    correspondances disponibles plutôt qu'une erreur).

---

## Phase 3 — Performance, Core Web Vitals & Lighthouse

**2/2 sous-tâches**

- [x] **Audit Core Web Vitals (LCP, CLS, INP)**
  Lighthouse (via `npx lighthouse`) exécuté contre un vrai build de production (`npm run build` + serveur local
  qui rejoue exactement les en-têtes `dist/_headers`, y compris la CSP) sur 5 pages représentatives : accueil,
  une fiche race, une page outil (île Preact), et les deux hubs /chiens/ et /chats/.
  **Correctif préalable important** : le premier passage utilisait un serveur de test sans compression, ce qui
  gonflait artificiellement le temps de transfert par rapport à la vraie prod Netlify (qui compresse
  automatiquement). Ajout de la compression gzip à `scripts/serve-dist-with-headers.mjs` avant de tirer la
  moindre conclusion — Performance accueil passée de 92 à 95 rien qu'avec cette correction de méthodologie.
  **Résultats finaux (après correctifs)** :
  | Page | Performance | Accessibilité | LCP | CLS | TBT (proxy INP) |
  |---|---|---|---|---|---|
  | Accueil | 95 | 100 | 2.6 s | 0.038 | 0 ms |
  | Fiche Malinois | 96 | 100 | 2.4 s | 0.001 | 0 ms |
  | Outil quiz | 97 | 100 | 2.3 s | 0.002 | 0 ms |
  | Hub /chiens/ | 93 | 100 | 2.9 s | 0.018 | 0 ms |
  | Hub /chats/ | 95 | 100 | — | — | 0 ms |

  Best Practices et SEO à 100 sur toutes les pages testées. TBT à 0 ms partout (aucune tâche longue bloquant le
  thread principal — bon proxy de laboratoire pour l'INP, qui nécessite des données de terrain réelles pour être
  mesuré au sens strict).

  **Bug réel trouvé et corrigé** : la page `heading-order` de Lighthouse a révélé que les hubs /chiens/ et
  /chats/ sautaient du H1 directement aux cartes de race en H3 (aucun H2 entre les deux) — cassait la hiérarchie
  sémantique pour les lecteurs d'écran. `HubRaces.tsx` : `<h3>` → `<h2>` sur le titre de chaque carte (composant
  partagé par les deux hubs, un seul correctif pour les deux). Accessibilité passée de 99 à 100 sur les deux
  pages, revérifié après correctif.

  **CLS non ramené à 0 littéral, décision assumée** : la source identifiée sur l'accueil (section "Fiches à la
  une") est un léger décalage au chargement des polices variables auto-hébergées (`font-display: swap`,
  comportement par défaut de `@fontsource`). 0.038 reste très largement sous le seuil "bon" de Google (< 0.1).
  L'éliminer complètement demanderait un réglage fin des métriques de police (`size-adjust`,
  `ascent-override`...) pour un gain marginal sur un score déjà excellent — jugé non justifié à ce stade.

- [x] **Optimisation police/assets — audité, décision documentée plutôt qu'une correction risquée**
  Investigation de la ressource bloquant le rendu la plus significative trouvée par Lighthouse : le CSS compilé
  du site (`Layout.[hash].css`, 38 Ko brut / 8,4 Ko gzippé) est chargé en un seul fichier externe bloquant sur
  chaque page. Option envisagée puis écartée : forcer `build.inlineStylesheets: 'always'` dans
  `astro.config.mjs` pour l'inliner entièrement. **Pourquoi ce n'est pas fait** : ça ferait perdre le bénéfice de
  cache partagé entre les 65 pages du site — pour un site de contenu où la navigation interne entre fiches/hubs
  est le usage réel (pas des visites mono-page isolées), inliner systématiquement pénaliserait les visites
  répétées pour gagner quelques points sur un score de laboratoire mono-page déjà à 93-97. Le réglage par défaut
  d'Astro (`'auto'`, qui n'inline que les feuilles de style sous ~4 Ko) reste le bon compromis ici.

---

## Phase 4 — Déploiement, Domaine & CI/CD

**1/2 sous-tâches**

- [x] **Build de production sans erreur d'hydratation**
  `npm run build` : 64 pages, 0 erreur. Vérifié en conditions réelles (pas seulement "le build passe") :
  navigation client-side (ClientRouter), hydratation Preact (quiz), interactions (thème, cookies) testées dans
  le navigateur sur le build de production servi statiquement — aucune erreur d'hydratation observée. Sous
  réserve : testé sur un échantillon de pages (accueil, hub chats, une fiche), pas exhaustivement sur les 64.

- [ ] **`netlify.toml`, redirections HTTPS, liaison du domaine `boussoleanimale.fr`**
  Partiellement engagé : `netlify.toml` nettoyé (les en-têtes viennent maintenant exclusivement de
  `dist/_headers`, généré au build — plus de risque de double définition/conflit). **Bloqué pour la suite** :
  la liaison réelle du domaine et la configuration HTTPS se font depuis le compte Netlify + le registrar du
  domaine, auxquels je n'ai pas accès. Aucun remote git n'est configuré non plus (`git remote -v` vide) — needs
  l'utilisateur pour connecter le dépôt à Netlify.

---

## Ce qui reste bloqué sur des informations ou accès utilisateur

- **Mentions légales** : identité réelle de l'éditeur, SIRET (si applicable), hébergeur.
- **Domaine & déploiement** : accès au compte Netlify, au registrar de `boussoleanimale.fr`, et au remote git
  (aucun remote configuré actuellement).
- **Lighthouse en conditions réelles** : un audit local (`astro preview` + Lighthouse CLI) est faisable dès
  maintenant sans attendre la mise en ligne — à faire en phase 3, pas fondamentalement bloqué.
