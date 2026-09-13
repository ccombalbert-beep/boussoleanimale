# Stratégie de contenu réseaux sociaux — Boussole Animale

Ce document définit la doctrine éditoriale du pipeline social. Il n'invente rien : chaque pilier, chaque
format, s'appuie sur du contenu qui existe déjà dans `src/content/` (26 fiches chien, 18 fiches chat, 6 guides,
4 outils). Le rôle du social n'est pas de produire un nouveau discours, c'est de **redistribuer le contenu
vérifié du site** dans les codes de chaque plateforme.

## 1. Identité de marque, transposée au social

Le site tient sur une promesse : *jamais généré en masse, toujours sourcé, jamais de mythe non corrigé*. Le
social doit tenir la même promesse ou il la détruit — un compte qui balance des "faits chien" approximatifs
pour l'engagement ruine la crédibilité que les fiches ont mis du temps à construire.

**Ce qu'on garde du site :**
- Un fait vérifiable par post (chiffre réel, source citée dans la fiche, jamais inventé)
- Le réflexe "mythe vs réalité" — le meilleur outil de scroll-stop qu'on ait, déjà écrit dans chaque fiche
- L'esthétique "cabinet naturaliste" : planche zoologique, papier, discrétion, jamais criard
- Zéro photo/vidéo d'animal générée par IA (cf. décision prise en session : ça fragiliserait la crédibilité)

**Ce qu'on adapte pour le social :**
- **Tutoiement.** Le site vouvoie (registre guide éditorial). Le social tutoie — c'est le registre par défaut
  de la cible TikTok/Reels en France, et ça marque une différence de contexte assumée (le site informe, le
  compte social discute). *Décision à valider par l'utilisateur — facile à inverser, un seul paramètre de ton
  dans le générateur (`voice.tutoiement: true`).*
- **Punchline avant nuance.** Une fiche pose la nuance dès la deuxième phrase. Un post ouvre sur l'accroche
  brute, la nuance vient en légende ou en deuxième slide de carrousel.

## 2. Les 5 piliers de contenu

Chaque pilier correspond à un champ ou une section précise du schéma de contenu existant
(`src/content.config.ts`) — le générateur (axe 2) sait dans quel champ piocher pour chacun.

| # | Pilier | Source dans le contenu | Objectif | Formats principaux |
|---|--------|------------------------|----------|---------------------|
| 1 | **Portrait de race** | `resume`, `caractère et tempérament`, fiche signalétique | Éducation, notoriété SEO→social | Carrousel IG, Reel "portrait" |
| 2 | **Mythe vs Réalité** | champ `mythes[]` | Débunkage, fort taux de partage | Reel/TikTok hook, carrousel 1 mythe = 1 slide |
| 3 | **Dans les chiffres** | `budget`, `esperanceDeVie`, guides comparatifs | Transparence, trafic vers les calculateurs | Carrousel data, story avec sticker sondage |
| 4 | **Cabinet Naturaliste** | photo seule + `imageCredit`, citation courte | Esthétique, image de marque, respiration | Post photo simple, story |
| 5 | **Le saviez-vous** | champ `faq[]` | Volume/fréquence, format le plus rapide à produire | TikTok court (15-25s), story Q/R |

**Pourquoi 5 et pas plus :** un pilier de plus dilue la reconnaissance de format. Un abonné doit pouvoir dire
"ah, c'est un mythe vs réalité" dès la première seconde, rien qu'à la mise en page.

## 3. Matrice plateforme

| Plateforme | Formats retenus | Fréquence cible | Automatisation réaliste |
|---|---|---|---|
| **Instagram** | Carrousel (piliers 1, 2, 3), Reel (piliers 2, 5), Story (piliers 3, 4) | 4 posts/semaine + 3-4 stories | Élevée — Graph API officielle (compte Business requis) |
| **TikTok** | Vidéo courte voix off + sous-titres (piliers 2, 5), portrait (pilier 1) | 3-4 vidéos/semaine | Moyenne — Content Posting API existe mais validation d'app nécessaire ; upload manuel viable en attendant |
| **Snapchat** | Repost du Reel/TikTok en story | Opportuniste | Faible — pas d'API publique de publication organique, cf. décision prise en session. Manuel uniquement. |

## 4. Stratégie de hashtags

Trois couches systématiques, jamais plus de 10-12 tags par post (au-delà, dilution démontrée sur IG/TikTok) :

1. **Marque (1 tag, toujours)** — `#boussoleanimale`
2. **Reach large (2-3 tags)** — `#chien #chat #adoptionanimaux #animaldecompagnie` (rotation selon espèce du post)
3. **Niche/race (2-4 tags)** — `#basenji #racedechien #teckel...` — générés automatiquement à partir du `nom` et
   `groupeFCI`/espèce de la fiche source, cf. générateur axe 2.
4. **Intention (1-2 tags)** — `#futuradoptant #conseilchien #viedanimal` selon le pilier

## 5. Appels à l'action (CTA)

Le CTA ne redirige jamais vers "notre site" de façon vague — toujours vers la ressource précise qui prolonge
le post :

- Pilier 1/2 → "Fiche complète (santé, budget, mythes) : lien en bio → [slug]"
- Pilier 3 → "Calcule le budget réel de **ta** situation : lien en bio → calculateur"
- Pilier 5 → "D'autres questions comme ça : fiche complète en bio"

Sur TikTok/Reels, le lien en bio doit être mis à jour à chaque post (limite de la plateforme : un seul lien
actif) — cf. `social/WORKFLOW.md` pour la procédure, ou passage à un lien "hub" type Linktree/page dédiée si le
rythme de publication dépasse un post par jour.

## 6. Schéma de données du calendrier éditorial

Chaque entrée de calendrier (`social/calendar/semaine-XX.json`) suit ce schéma :

```jsonc
{
  "date": "2026-09-15",          // date de publication cible, ISO
  "platform": "instagram",        // "instagram" | "tiktok" | "snapchat"
  "format": "carousel",           // "carousel" | "reel" | "story" | "tiktok-video" | "photo"
  "pillar": 1,                    // 1-5, cf. tableau piliers
  "source": {
    "type": "race",               // "race" | "guide" | "outil"
    "collection": "chiens",       // "chiens" | "chats" | "guides" | null
    "slug": "basenji"             // slug exact du fichier MDX source
  },
  "workingTitle": "Le chien qui n'aboie jamais",
  "status": "planned",            // "planned" | "generated" | "in_review" | "approved" | "published"
  "notes": ""                     // notes libres de l'humain qui valide
}
```

`status` est le seul champ que le pipeline modifie automatiquement (généré → in_review) ; le passage à
`approved` est **toujours** un geste humain (cf. `WORKFLOW.md`, axe 4).

## 7. Calendrier — 4 semaines de lancement

Voir `social/calendar/semaine-01.json` à `semaine-04.json`. Répartition volontaire :

- **Semaine 1** : que du pilier 1 et 2 (portrait + mythe) — les formats les plus sûrs, pour roder le pipeline
  sans complexité de données (pas de comparaison multi-fiches).
- **Semaine 2** : introduction du pilier 5 (FAQ éclair, format le plus rapide) et premier pilier 3 (chiffres),
  qui s'appuie sur un guide déjà écrit (`combien-coute-un-chien-par-mois`).
- **Semaine 3** : introduction du pilier 4 (Cabinet Naturaliste, respiration esthétique) — un post sans texte
  dense, pour casser le rythme "carrousel éducatif" et tester l'engagement sur du pur visuel.
- **Semaine 4** : rythme de croisière, les 5 piliers représentés, base pour dupliquer le mois suivant en
  changeant seulement les fiches sources (le calendrier devient un gabarit réutilisable, pas juste un plan
  figé).

## 8. Ce que ce système ne fait pas (backlog assumé)

- Il ne publie rien tout seul. Cf. `WORKFLOW.md` — validation humaine systématique en V1.
- Il ne génère pas de voix off IA premium (ElevenLabs etc.) — le test vidéo de session utilise la synthèse
  macOS, fonctionnelle mais robotique. Passage à une voix premium = décision de budget, pas de complexité
  technique (une clé API à brancher).
- Il ne poste rien sur Snapchat — pas d'API organique publique, cf. section 3.
- Il ne fait pas de veille concurrentielle ni d'A/B testing de hooks — V1 se concentre sur la production, pas
  l'optimisation.
