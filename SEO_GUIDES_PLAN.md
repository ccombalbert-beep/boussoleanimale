# Plan des guides SEO hebdomadaires — Boussole Animale

**Statut : 1/13 publié (semaine 1)**

Chantier de contenu longue traîne : un guide par semaine sur un trimestre (13 semaines), articulé avec le
maillage interne existant (26 fiches chien, 18 fiches chat, 5 outils) plutôt que des articles isolés. Objectif :
capter du trafic informationnel qualifié et faire remonter les fiches déjà publiées via des liens contextuels
réels — jamais un lien ajouté pour la forme.

## Méthodologie de sélection des sujets

**Limite assumée, à dire clairement plutôt qu'à masquer** : je n'ai pas accès à un outil de volume de recherche
(Keyword Planner, Ahrefs, SEMrush...) ni, pour l'instant, à des données Search Console exploitables — le site
vient d'être indexé aujourd'hui (13 septembre 2026), 0 page encore explorée. La priorisation ci-dessous repose
donc sur trois critères vérifiables sans outil payant :

1. **Intention de recherche réelle et récurrente** dans le secteur animalier (questions qu'un futur propriétaire
   se pose systématiquement avant d'adopter — budget, allergies, compatibilité, comportement), pas des mots-clés
   à la mode.
2. **Écart avec les 6 guides déjà publiés** (`combien-coute-un-chien/chat-par-mois`, `quelle-race-de-chien-pour-
   appartement`, `quelle-race-vit-le-plus-longtemps`, `races-compatibles-avec-enfants`,
   `races-de-chien-qui-n-aboient-pas`) — chaque nouveau sujet comble un angle non couvert plutôt que de le
   dupliquer.
3. **Densité de maillage interne disponible** : un sujet n'est retenu que s'il peut lier au moins 3 fiches race
   déjà publiées et, si pertinent, un outil interactif — sinon le guide reste un article isolé, ce qu'on évite
   délibérément.

**À recalibrer dans 3-4 semaines** : une fois Search Console accumulé des données réelles (Performances →
Requêtes), reprendre ce calendrier et faire remonter les sujets qui montrent déjà des impressions naturelles
avant d'écrire les semaines encore "à rédiger" — la priorisation ci-dessous est une hypothèse de départ
raisonnée, pas une vérité mesurée.

## Calendrier — Trimestre Q4 2026 (13 semaines)

Source de vérité pour `scripts/next-guide-draft.mjs`, qui lit directement ce bloc JSON — le garder valide et à
jour à chaque publication (`statut` passe de `"à rédiger"` à `"publié"`).

```json
[
  {
    "semaine": 1,
    "slug": "race-de-chien-hypoallergenique",
    "sujet": "Race de chien hypoallergénique : les races qui limitent vraiment les allergies",
    "requeteCible": "race de chien hypoallergénique",
    "pilier": "Choix de race",
    "intention": "La requête informationnelle la plus recherchée et la plus évergreen du secteur canin — et la plus sujette aux approximations marketing (aucun chien n'est 100% hypoallergénique). Fort potentiel de maillage : 4 fiches déjà publiées correspondent exactement au sujet.",
    "maillage": {
      "racesLiees": [
        { "slug": "caniche", "espece": "chien" },
        { "slug": "bichon-frise", "espece": "chien" },
        { "slug": "shih-tzu", "espece": "chien" },
        { "slug": "yorkshire-terrier", "espece": "chien" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "publié"
  },
  {
    "semaine": 2,
    "slug": "chat-ou-chien-comment-choisir",
    "sujet": "Chat ou chien : comment choisir selon son mode de vie",
    "requeteCible": "chat ou chien lequel choisir",
    "pilier": "Choix d'espèce",
    "intention": "Requête en amont de toutes les autres — beaucoup de visiteurs arrivent sur le site sans avoir encore choisi l'espèce. Permet de lier les deux calculateurs de budget ET le quiz en un seul guide.",
    "maillage": {
      "racesLiees": [
        { "slug": "labrador", "espece": "chien" },
        { "slug": "berger-australien", "espece": "chien" },
        { "slug": "europeen", "espece": "chat" },
        { "slug": "maine-coon", "espece": "chat" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/", "/outils/cout-mensuel-chien/", "/outils/cout-mensuel-chat/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 3,
    "slug": "cout-adoption-chien-refuge-eleveur",
    "sujet": "Combien coûte l'adoption d'un chien : refuge, éleveur, et les frais qu'on oublie",
    "requeteCible": "prix adoption chien refuge",
    "pilier": "Budget",
    "intention": "Complète les guides budget mensuel existants sur l'angle coût d'ACQUISITION (frais de refuge, identification, primo-vaccination, stérilisation) plutôt que d'entretien — angle non couvert à ce jour.",
    "maillage": {
      "racesLiees": [
        { "slug": "berger-allemand", "espece": "chien" },
        { "slug": "border-collie", "espece": "chien" }
      ],
      "outils": ["/outils/cout-mensuel-chien/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 4,
    "slug": "race-de-chat-la-plus-affectueuse",
    "sujet": "Race de chat la plus affectueuse et câline au quotidien",
    "requeteCible": "race de chat la plus affectueuse",
    "pilier": "Choix de race",
    "intention": "Équivalent chat du sujet hypoallergénique en volume de recherche informationnelle typique — et un vrai contraste à documenter (toutes les races ne recherchent pas le contact humain au même degré).",
    "maillage": {
      "racesLiees": [
        { "slug": "ragdoll", "espece": "chat" },
        { "slug": "siamois", "espece": "chat" },
        { "slug": "sacre-de-birmanie", "espece": "chat" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 5,
    "slug": "quelle-race-de-chien-pour-un-premier-chien",
    "sujet": "Quelle race de chien choisir quand on n'a jamais eu de chien",
    "requeteCible": "quelle race de chien pour un premier chien",
    "pilier": "Choix de race",
    "intention": "Le quiz interne a explicitement un critère 'débutant' — ce guide capte la requête de recherche correspondante et redirige naturellement vers l'outil plutôt que de le dupliquer en texte.",
    "maillage": {
      "racesLiees": [
        { "slug": "labrador", "espece": "chien" },
        { "slug": "cavalier-king-charles", "espece": "chien" },
        { "slug": "golden-retriever", "espece": "chien" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 6,
    "slug": "race-de-chien-qui-perd-le-moins-de-poils",
    "sujet": "Race de chien qui perd le moins de poils",
    "requeteCible": "chien qui perd le moins ses poils",
    "pilier": "Entretien",
    "intention": "Distinct du guide hypoallergénique (semaine 1) : la mue et les allergènes sont deux mécanismes différents, une confusion fréquente qui mérite d'être clarifiée plutôt qu'un simple doublon de mots-clés.",
    "maillage": {
      "racesLiees": [
        { "slug": "caniche", "espece": "chien" },
        { "slug": "yorkshire-terrier", "espece": "chien" },
        { "slug": "basenji", "espece": "chien" }
      ],
      "outils": []
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 7,
    "slug": "race-de-chat-qui-s-entend-avec-un-chien",
    "sujet": "Race de chat qui s'entend bien avec un chien",
    "requeteCible": "race de chat qui aime les chiens",
    "pilier": "Cohabitation",
    "intention": "Pendant du guide 'races compatibles avec enfants' existant, sur l'angle multi-espèces plutôt que multi-âges — foyers qui ont déjà un chien et envisagent un chat, ou l'inverse.",
    "maillage": {
      "racesLiees": [
        { "slug": "maine-coon", "espece": "chat" },
        { "slug": "ragdoll", "espece": "chat" },
        { "slug": "europeen", "espece": "chat" }
      ],
      "outils": []
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 8,
    "slug": "race-de-chien-de-garde-mythe-realite",
    "sujet": "Race de chien de garde et de protection : ce que ça veut vraiment dire",
    "requeteCible": "race de chien de garde",
    "pilier": "Comportement",
    "intention": "Requête à forte charge d'idées reçues (agressivité confondue avec vigilance) — traitement 'mythe vs réalité' dans l'esprit déjà établi sur les fiches race, sur un sujet que les guides actuels ne couvrent pas.",
    "maillage": {
      "racesLiees": [
        { "slug": "berger-allemand", "espece": "chien" },
        { "slug": "rottweiler", "espece": "chien" },
        { "slug": "malinois", "espece": "chien" }
      ],
      "outils": []
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 9,
    "slug": "budget-premiere-annee-chaton",
    "sujet": "Budget première année d'un chaton : adoption, équipement, stérilisation",
    "requeteCible": "budget première année chaton",
    "pilier": "Budget",
    "intention": "Pendant chat du guide semaine 3 (côté chien) — complète le guide de coût mensuel chat existant sur l'angle des dépenses ponctuelles de la première année plutôt que récurrentes.",
    "maillage": {
      "racesLiees": [
        { "slug": "british-shorthair", "espece": "chat" },
        { "slug": "bengal", "espece": "chat" }
      ],
      "outils": ["/outils/cout-mensuel-chat/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 10,
    "slug": "race-de-chat-pour-appartement-sans-exterieur",
    "sujet": "Race de chat pour un appartement sans accès à l'extérieur",
    "requeteCible": "race de chat d'appartement sans extérieur",
    "pilier": "Mode de vie",
    "intention": "Pendant chat du guide 'race de chien pour appartement' déjà publié — angle différent (besoin d'enrichissement environnemental en intérieur pur, pas juste de gabarit).",
    "maillage": {
      "racesLiees": [
        { "slug": "british-shorthair", "espece": "chat" },
        { "slug": "chartreux", "espece": "chat" },
        { "slug": "persan", "espece": "chat" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 11,
    "slug": "maladies-hereditaires-par-race-de-chien",
    "sujet": "Maladies héréditaires les plus fréquentes par race de chien : ce qu'il faut vérifier avant d'adopter",
    "requeteCible": "maladies héréditaires race de chien",
    "pilier": "Santé",
    "intention": "Agrège transversalement les prédispositions de santé déjà documentées fiche par fiche (dysplasie, syndrome obstructif brachycéphale...) en un point d'entrée dédié — angle santé absent des guides actuels.",
    "maillage": {
      "racesLiees": [
        { "slug": "bouledogue-francais", "espece": "chien" },
        { "slug": "berger-allemand", "espece": "chien" },
        { "slug": "cavalier-king-charles", "espece": "chien" }
      ],
      "outils": []
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 12,
    "slug": "race-de-chien-pour-une-vie-calme",
    "sujet": "Race de chien adaptée à une vie calme ou à une personne âgée",
    "requeteCible": "race de chien calme pour senior",
    "pilier": "Mode de vie",
    "intention": "Angle démographique spécifique non couvert — foyers cherchant explicitement un niveau d'activité faible, distinct du guide appartement (une race calme n'est pas forcément une petite race).",
    "maillage": {
      "racesLiees": [
        { "slug": "cavalier-king-charles", "espece": "chien" },
        { "slug": "basenji", "espece": "chien" },
        { "slug": "shih-tzu", "espece": "chien" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "à rédiger"
  },
  {
    "semaine": 13,
    "slug": "race-de-chat-independante",
    "sujet": "Race de chat indépendante, pour un foyer souvent absent en journée",
    "requeteCible": "race de chat indépendante qui reste seule",
    "pilier": "Mode de vie",
    "intention": "Clôture le trimestre sur le pendant exact du guide semaine 4 (affectueux vs indépendant) — les deux couvrent ensemble le spectre complet de la requête de personnalité féline, sans se dupliquer.",
    "maillage": {
      "racesLiees": [
        { "slug": "chartreux", "espece": "chat" },
        { "slug": "american-shorthair", "espece": "chat" },
        { "slug": "abyssin", "espece": "chat" }
      ],
      "outils": ["/outils/quelle-race-me-correspond/"]
    },
    "statut": "à rédiger"
  }
]
```

## Le gabarit d'un guide (frontmatter + structure)

Chaque guide est un fichier `.mdx` dans `src/content/guides/`, conforme au `guideSchema` de
`src/content.config.ts`. Gabarit annoté :

```yaml
---
titre: "Titre éditorial complet (accroche + clarificateur, pour le H1 et le SERP si titreCourt absent)"
titreCourt: "Version courte optionnelle, si le titre éditorial dépasse la largeur utile en <title>"
resume: "1-2 phrases, 200 caractères max — sert d'intro ET de meta description."

image: "../../assets/images/races/<slug-existant>.jpg"   # réutilise une image déjà vérifiée d'une fiche race
imageAlt: "Description factuelle de la photo"
imageCredit:                                                # obligatoire sauf image CC0/domaine public
  auteur: "..."
  licence: "..."
  lienLicence: "https://..."
  source: "https://commons.wikimedia.org/..."

racesLiees:                                                  # résolu automatiquement depuis le calendrier
  - { slug: "...", espece: "chien" }

faq:                                                          # optionnel — génère le schema FAQPage en plus d'Article
  - question: "..."
    reponse: "..."

sources:
  - "..."
auteur: "Rédaction Boussole Animale"
dateMiseAJour: AAAA-MM-JJ
---

## Premier H2 — répond frontalement à l'intention de recherche dès le début

...

## H2 suivants — un par sous-angle du sujet

...
```

**Règles non négociables, héritées des fiches race** : aucune statistique inventée, aucun chiffre de volume de
recherche présenté comme mesuré (dire "requête fréquente" plutôt que donner un nombre qu'on n'a pas), au moins
un point "ce qu'on croit vs ce qui est vrai" quand le sujet s'y prête (cf. `mythes` sur les fiches race), et des
liens internes contextuels — jamais une liste de liens ajoutée à la fin pour la forme.

## Le workflow, et pourquoi il reste volontairement semi-automatisé

Quatre étapes, dont trois sont réellement automatisées et une reste manuelle par choix éditorial assumé, pas par
limitation technique :

1. **Scaffolding automatique** (`npm run guide:next`, script `scripts/next-guide-draft.mjs`) : lit ce fichier,
   trouve la première semaine `"à rédiger"`, crée `src/content/guides/<slug>.mdx` avec le frontmatter pré-rempli
   (titre, racesLiees résolus depuis le calendrier, date du jour) et un squelette de `## ` correspondant aux
   sources d'intention listées — puis passe le statut de cette semaine à `"brouillon créé"`. **Automatisé.**
2. **Rédaction** : faite par Claude en session, avec la même rigueur que les fiches race (recherche réelle,
   pas de contenu généré par simple substitution de variables). **Volontairement non automatisée via une API** —
   même choix que pour le pipeline réseaux sociaux (`social/`), qui n'appelle aucune IA générative non supervisée
   : un vrai appel API nécessiterait une clé Anthropic à la charge de l'utilisateur, sans le contrôle qualité
   qu'apporte une session de rédaction supervisée, pour un contenu dont la valeur SEO dépend justement de ne
   *pas* avoir l'air généré en masse.
3. **Validation humaine obligatoire** : avant tout `git push` (qui déclenche le déploiement automatique Netlify),
   l'utilisateur relit le guide rendu — comme pour chaque changement de ce projet, aucun commit n'est poussé sans
   confirmation explicite. C'est le même garde-fou que pour tout le reste du site, pas une étape ajoutée
   spécifiquement ici.
4. **Publication** : une fois approuvé, `git push` suffit — sitemap (`@astrojs/sitemap`), données structurées
   (Article + FAQPage si `faq` présent), maillage interne et page `/guides/` se mettent à jour automatiquement
   au build, sans intervention manuelle supplémentaire. **Automatisé.**

## Historique

- **Semaine 1 (13 septembre 2026)** : `race-de-chien-hypoallergenique` rédigé et publié — premier guide de la
  série, choisi comme sujet le plus stratégique (volume informationnel évergreen le plus élevé du secteur canin,
  4 fiches déjà publiées à lier). Ajout au passage du support FAQPage aux guides (`content.config.ts` +
  `GuideLayout.astro`), jusque-là réservé aux fiches race.
