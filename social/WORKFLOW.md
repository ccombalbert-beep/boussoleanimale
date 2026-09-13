# Workflow opérationnel — pipeline social Boussole Animale

Ce document décrit comment faire tourner le pipeline au quotidien : qui fait quoi, dans quel ordre, et où est
le point de contrôle humain. **Aucune étape de ce pipeline ne publie automatiquement quoi que ce soit** — c'est
un choix délibéré pour la V1 (cf. `CONTENT_STRATEGY.md`, section 8).

## Vue d'ensemble

```
calendar/semaine-XX.json
        │
        ├─► generate-hooks.mjs   ──► output/review/*.json + *.md   (hooks, légende, hashtags)
        │
        └─► generate-visual.mjs  ──► output/review/visuals/*.png   (carrousels, cartes)
                        │
                        ▼
              ┌─────────────────────┐
              │  VALIDATION HUMAINE  │   ← seule étape non automatisée, volontairement
              └─────────────────────┘
                        │
                        ▼
              output/approved/*.json  (déplacé/copié manuellement, ou statut modifié)
                        │
                        ▼
              export-buffer.mjs ──► output/exports/buffer-import.csv + *.txt
                        │
                        ▼
        Buffer / Metricool (import CSV)   OU   copier-coller manuel dans l'app
                        │
                        ▼
                  Publication (toujours déclenchée par un humain en V1)
```

## Étape 1 — Génération (hebdomadaire, ~2 minutes)

```bash
cd social
node scripts/generate-hooks.mjs calendar/semaine-01.json
node scripts/generate-visual.mjs calendar/semaine-01.json
```

Produit, pour chaque entrée du calendrier :
- Un `.json` structuré (hooks, légende, hashtags) et un `.md` lisible dans `output/review/`
- Les visuels PNG correspondants dans `output/review/visuals/` (sauf pilier 5 et sources `outil`, qui n'ont
  pas de gabarit visuel dédié en V1 — texte seul ou composition manuelle sur sticker natif)

## Étape 2 — Validation humaine (obligatoire, avant chaque publication)

Ouvrir les `.md` dans `output/review/` un par un. Trois issues possibles :

1. **Approuver tel quel** → copier le `.json` correspondant dans `output/approved/`, ajouter deux champs :
   - `"hookChoisi"`: lequel des 3 hooks proposés est retenu (ou un hook réécrit à la main)
   - `"mediaFiles"`: liste des fichiers visuels à joindre (noms de fichiers dans `output/review/visuals/`)
2. **Corriger puis approuver** → éditer directement le texte (`caption`, `hooks`) dans le `.json` avant de le
   déplacer vers `approved/`. C'est l'issue la plus fréquente : le générateur produit une base solide et
   sourcée, pas une copie finale — cf. limite connue ci-dessous.
3. **Rejeter** → laisser dans `review/`, ou supprimer. Ne jamais publier un post généré sans être passé par
   ce tri.

**Points de vigilance spécifiques**, à vérifier systématiquement avant d'approuver :
- **Sujets santé/bien-être sensibles** (ex. Scottish Fold, races catégorisées) : le ton doit rester factuel,
  jamais alarmiste ni putaclic — relire à voix haute.
- **Sujets légaux** (Rottweiler catégorie 2, Amstaff catégorie 1/2 selon LOF) : l'exactitude n'est pas
  négociable, revérifier contre la fiche source avant publication, pas seulement contre la légende générée.
- **Longueur de légende** : le générateur reprend parfois le texte intégral d'un champ `realite`/`resume`
  écrit pour le web, plus long qu'une légende social idéale. Raccourcir à l'œil si ça dépasse 5-6 lignes utiles.

## Étape 3 — Export

```bash
node scripts/export-buffer.mjs
```

Génère `output/exports/buffer-import.csv` (colonnes : Date, Heure, Plateforme, Format, Texte, Médias, Lien) —
importable tel quel dans Buffer ou Metricool (vérifier le mapping de colonnes exact à la première utilisation,
chaque outil a son propre format d'import). Génère aussi un `.txt` par post pour un copier-coller manuel si
aucun outil de scheduling n'est encore branché.

**Heure de publication** : le script met `10:00` par défaut sur chaque ligne — c'est un placeholder, pas une
recommandation. À ajuster une fois que de vraies données d'audience existent (Instagram/TikTok Insights).

## Étape 4 — Publication

**V1 (aujourd'hui) : toujours manuelle**, via Buffer/Metricool (import du CSV) ou directement dans l'app.
Snapchat reste manuel dans tous les cas (pas d'API organique, cf. `CONTENT_STRATEGY.md` §3).

**V2 (une fois le rythme rodé) : publication via API pour Instagram/TikTok**, si le volume le justifie :
- Instagram Graph API nécessite un compte Business/Creator + une app Meta validée (délai de revue possible).
- TikTok Content Posting API nécessite une validation d'app similaire.
- Dans les deux cas, la partie "génération" de ce pipeline ne change pas — seule l'étape 4 change, en
  remplaçant l'export CSV par un appel API authentifié. Le point de validation humaine (étape 2) devrait être
  conservé même en V2, au moins pour les sujets sensibles listés plus haut.

## Limite connue à ne pas perdre de vue

Le générateur de légendes (`generate-hooks.mjs`) est **déterministe et gratuit** : aucun appel à un modèle de
langage, aucune clé API, aucun coût récurrent. C'est un choix assumé pour que le pipeline tourne offline et
sans dépendance externe. La contrepartie : il extrait et reformate le contenu existant, il ne le réécrit pas
pour le rendre plus percutant. La validation humaine (étape 2) n'est donc pas une formalité — c'est là que le
texte passe de "correct" à "publiable". Si le volume de production augmente au point que ce resserrage manuel
devient le goulot d'étranglement, la prochaine amélioration logique est d'ajouter une passe de reformulation
(via l'API Claude ou équivalent) entre `generate-hooks.mjs` et la validation humaine — pas de la remplacer.

## Qui valide quoi (à adapter à l'équipe réelle)

Une seule personne suffit pour la V1 au rythme prévu (~4-7 posts/semaine). Si l'équipe grandit :
- **Validation contenu/ton** : quiconque connaît la voix de marque (cf. `CONTENT_STRATEGY.md` §1)
- **Validation sujets sensibles** (santé, légal) : idéalement la même personne qui valide les fiches du site,
  pour la cohérence factuelle
- **Publication effective** : peut être délégué une fois le CSV approuvé — c'est un geste mécanique à ce stade
