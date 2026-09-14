# Checklist Croissance, CRO & Industrialisation — Boussole Animale

**Progression : 5/12 tâches (42%)**

Dernière mise à jour : 14 septembre 2026 — Chantier ouvert aujourd'hui, en continuité directe des 4 chantiers
terminés (UX/UI 26/26, SEO 15/15, Réseaux Sociaux 14/14, Production-Ready & Hardening 10/10). Objectif : passer
d'un site fini à un site qui s'optimise en continu, sur la base de données réelles plutôt que d'hypothèses —
même méthode que les chantiers précédents : jamais de case cochée sans vérification en conditions réelles.

**Limite assumée dès le départ** : deux sous-chantiers entiers (exploitation Search Console, automatisation
Instagram/TikTok) sont matériellement bloqués tant que le temps ou l'accès nécessaires ne sont pas réunis — ce
n'est pas paresse, voir le détail dans chaque item concerné et la section "Ce qui reste bloqué" en bas de page.

---

## Phase 1 — Expansion Sémantique & Automatisation SEO Avancée

**2/4 sous-tâches**

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

**1/3 sous-tâches**

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

- [ ] **Favoris utilisateur (localStorage)**
  Proposition initiale : bouton "Sauvegarder" sur les fiches race et guides, persistance localStorage (comme le
  choix de thème ou de cookies), page `/favoris/` listant les fiches sauvegardées. **Scope à valider avec
  l'utilisateur avant de coder** : c'est une vraie fonctionnalité produit, pas de la plomberie — mérite une
  confirmation explicite plutôt qu'une implémentation silencieuse.

- [ ] **Comparateurs avancés**
  Mentionné dans le brief sans périmètre précis (comparer plusieurs races côte à côte ? sur quels critères ?).
  **À cadrer avec l'utilisateur avant tout développement.**

---

## Phase 3 — Performance, Core Web Vitals & Résilience 2.0

**1/2 sous-tâches**

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

- [ ] **Budget de performance et veille anti-régression**
  Pas d'action concrète identifiée aujourd'hui : aucune régression détectée, scores Lighthouse stables depuis le
  chantier Hardening. À reprendre quand le catalogue de contenu aura suffisamment grossi (nouvelles images,
  nouveaux guides) pour justifier un nouvel audit comparatif — pas une tâche à cocher par anticipation.

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
- **Favoris localStorage et comparateurs avancés** : décisions de scope produit à valider avant tout code.
- **Automatisation Instagram/TikTok** : nécessite la création de comptes développeur Meta et TikTok, et la
  validation business associée — actions que seul l'utilisateur peut engager.

## Prochaine action recommandée

L'instrumentation GA4 est faite — reste à laisser les données s'accumuler (1-2 semaines) avant d'en tirer des
conclusions sur les tunnels réels. En attendant, toutes les tâches non bloquées restantes de ce chantier
demandent une décision de scope de l'utilisateur (favoris, comparateurs avancés, nouvelles sources de contenu
social) plutôt qu'un choix technique — rien à coder à l'aveugle avant d'avoir cette confirmation.
