# Pipeline social — Boussole Animale

Système de génération de contenu pour Instagram et TikTok, construit à partir du contenu réel du site
(`src/content/`). Isolé du site Astro : son propre `package.json`, aucune dépendance partagée, aucun impact
sur `npm run build` du site principal.

## Démarrage

```bash
cd social
npm install       # une seule fois — installe gray-matter (lecture des fiches) et sharp (rendu des visuels)
```

## Les 4 pièces du système

| Document / dossier | Rôle |
|---|---|
| [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md) | Piliers de contenu, voix de marque, matrice plateforme, hashtags, schéma du calendrier |
| [`calendar/`](./calendar) | 4 semaines de calendrier éditorial (JSON), gabarit réutilisable pour les mois suivants |
| [`scripts/`](./scripts) | Le moteur : lecture du contenu → hooks/légendes → visuels → export |
| [`WORKFLOW.md`](./WORKFLOW.md) | Comment faire tourner tout ça, où est la validation humaine, comment publier |

## Utilisation rapide — générer une semaine

```bash
node scripts/generate-hooks.mjs calendar/semaine-01.json    # → output/review/*.{json,md}
node scripts/generate-visual.mjs calendar/semaine-01.json   # → output/review/visuals/*.png
```

Ouvrir les `.md` générés dans `output/review/` pour relire et choisir. Puis suivre `WORKFLOW.md` pour la
validation et l'export vers Buffer/Metricool.

## Architecture des scripts

```
scripts/
├── lib/
│   ├── content-source.mjs     # Lit une fiche race/guide/outil — source de vérité = src/content/
│   ├── templates.mjs          # Gabarits de copywriting (5 piliers) → hooks + légende + hashtags
│   ├── templates-visual.mjs   # Gabarits visuels (SVG) → specimen card, carrousel mythe, carte naturaliste
│   └── visual-helpers.mjs     # Rendu SVG+photo → PNG via sharp, palette de marque, découpe de texte
├── generate-hooks.mjs         # CLI — texte
├── generate-visual.mjs        # CLI — visuels
└── export-buffer.mjs          # CLI — compile output/approved/ en CSV + .txt
```

Chaque module a un rôle unique et testable isolément (`node -e "..."` pour tester une fonction sans passer
par le CLI complet — utile en développement).

## Fidélité typographique — limite technique connue

Les visuels utilisent **Georgia** (titres) et **Helvetica Neue** (corps) plutôt que les vraies polices du
site (Newsreader Variable / Inter Variable). Ce n'est pas un choix esthétique : le moteur de rendu SVG utilisé
ici (sharp/librsvg) ne charge pas les fichiers de police variable du projet, même installés dans
`~/Library/Fonts` — le cache fontconfig n'est pas accessible sans Homebrew dans cet environnement. Georgia et
Helvetica Neue ont été choisies parce qu'elles reproduisent la même hiérarchie (serif élégant + sans-serif
neutre) que Newsreader/Inter, pas au hasard.

**Pour un rendu pixel-parfait avec les vraies polices de marque**, deux pistes, par ordre de préférence :
1. Installer Homebrew + `fc-cache -f` pour que fontconfig voie les polices installées, puis re-tester
   l'embarquement des `.woff2` en base64 dans le SVG (déjà testé, l'embarquement seul ne suffit pas sans cache
   fontconfig fonctionnel).
2. Remplacer le moteur de rendu : générer les visuels en HTML/CSS (avec les vraies polices en `@font-face`,
   comme le fait déjà le site) et les rastériser via un vrai moteur de rendu web (Chromium headless / le
   Browser tool de la session) plutôt que sharp. Plus lourd à automatiser en ligne de commande pure, mais
   fidélité garantie puisque c'est le même moteur que celui qui affiche déjà le site.

## Ce qui n'est PAS dans ce pipeline (volontairement, cf. `CONTENT_STRATEGY.md` §8)

- Publication automatique — étape toujours manuelle en V1, cf. `WORKFLOW.md`
- Voix off IA premium — le test vidéo de session (`.scratch/video-test/`) utilise la synthèse macOS gratuite ;
  une voix ElevenLabs ou équivalente demande une clé API et un budget, pas une complexité technique nouvelle
- Publication Snapchat — pas d'API organique publique, reste manuel
- Réécriture des textes par un modèle de langage — génération déterministe et gratuite, cf. `WORKFLOW.md`
  "Limite connue"
