# Checklist Production-Ready & Hardening — Boussole Animale

**Progression : 10/10 tâches (100%)**

Dernière mise à jour : 13 septembre 2026 — **Chantier terminé.** Le site est en ligne : https://boussoleanimale.fr,
HTTPS actif (certificat Let's Encrypt provisionné), redirections HTTP→HTTPS et www→apex fonctionnelles, CSP
vérifiée en production. Code poussé sur GitHub (`ccombalbert-beep/boussoleanimale`), déployé via Netlify, DNS
configuré chez OVH (domaine et hébergement mail restent chez OVH, le site lui-même est servi par Netlify). Les
mentions légales ont été complétées avec l'identité réelle fournie par l'utilisateur (Corentin Combalbert, à
titre personnel, sans SIRET) — plus aucune tâche bloquée sur ce chantier.

Chantier suivant la même méthode que UX/UI et SEO : audit du code réel avant de cocher quoi que ce soit, jamais
de case cochée sur la seule base d'une intention.

---

## Phase 1 — Sécurité, Headers & Conformité Légale (Hardening)

**4/4 sous-tâches**

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

- [x] **Mentions légales — informations réelles**
  `src/pages/mentions-legales.astro` complété avec l'identité fournie par l'utilisateur : Corentin Combalbert,
  éditeur à titre personnel (non professionnel, aucun SIRET à ce jour). Directeur de publication : la même
  personne. Hébergeur : distinction faite entre Netlify (qui sert réellement le site — hébergeur au sens LCEN) et
  OVH (domaine + emails uniquement) ; écart repéré et signalé à l'utilisateur avant publication (il avait
  spontanément dit "OVH", mais légalement c'est Netlify qui héberge le contenu), qui a choisi de mentionner les
  deux avec leur rôle exact. Ajouts au passage : propriété intellectuelle (textes/fiches + licences Wikimedia
  Commons), rappel que le contenu est informatif et ne remplace pas un avis vétérinaire, droit applicable. Un
  détail de `confidentialite.astro` corrigé en cohérence (renvoyait vers "raison sociale/forme juridique/SIRET"
  dans les mentions légales, inexact pour un éditeur particulier sans société).

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

- [x] **`netlify.toml`, redirections HTTPS, liaison du domaine `boussoleanimale.fr`**
  **Le site est en ligne.** Parcours complet réalisé avec l'utilisateur (domaine + hébergement mail achetés chez
  OVH, hébergement du site sur Netlify — décision motivée : le projet était déjà entièrement pré-configuré pour
  Netlify, `netlify.toml`/CSP/404 inclus, et Netlify est gratuit) :
  1. Clé SSH générée côté serveur pour l'authentification GitHub (pas de mot de passe manipulé)
  2. Tous les fichiers de la session commités (130 fichiers — rien n'avait encore été commité), `.gitignore`
     corrigé au passage (`social/node_modules/`, `social/output/`, `.scratch/` s'étaient glissés en tracked,
     ~80 Mo à exclure avant le premier commit)
  3. Poussé sur `github.com/ccombalbert-beep/boussoleanimale`, connecté à Netlify (build/publish détectés
     automatiquement depuis `netlify.toml`)
  4. Site vérifié en direct sur l'URL `.netlify.app` : CSP appliquée, zéro erreur console, fiche race et 404
     fonctionnelles avant de toucher au domaine
  5. DNS configuré chez OVH : `@ A` repointé vers `75.2.60.5`, `@ AAAA` (obsolète) supprimé, `www A`/`AAAA`
     remplacés par un `CNAME` vers `boussoleanimale.netlify.app.` — les enregistrements mail (MX, SPF, DKIM)
     n'ont pas été touchés
  6. Certificat Let's Encrypt provisionné automatiquement après validation DNS (~2 minutes)
  7. **Vérifié en production** : `https://boussoleanimale.fr` sert 200 avec la CSP complète, `http://` →
     `https://` redirige (301), `www.` → apex redirige (301), HSTS actif

---

## Ce qui reste bloqué sur des informations ou accès utilisateur

Plus rien. Toutes les tâches de ce chantier, et de l'ensemble du projet (UX/UI, SEO, Réseaux Sociaux, Hardening),
sont terminées.

## Infrastructure de déploiement, pour référence

- **Domaine** : `boussoleanimale.fr`, acheté et géré chez OVH (registrar + zone DNS + emails `@boussoleanimale.fr`
  via MX Plan OVH).
- **Hébergement du site** : Netlify, gratuit, déployé automatiquement à chaque push sur `main` du dépôt GitHub
  `ccombalbert-beep/boussoleanimale`.
- **DNS** : `@ A → 75.2.60.5` (apex, IP de Netlify), `www CNAME → boussoleanimale.netlify.app.` (redirige vers
  l'apex). Les enregistrements mail OVH (MX, SPF, DKIM, autoconfig/autodiscover) sont restés intacts.
- **HTTPS** : certificat Let's Encrypt provisionné automatiquement par Netlify après validation DNS.
