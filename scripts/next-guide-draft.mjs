#!/usr/bin/env node
// Scaffolding pour le prochain guide SEO du calendrier (SEO_GUIDES_PLAN.md).
//
// Ce script ne rédige AUCUN contenu — il lit le calendrier, trouve la
// première semaine au statut "à rédiger", et crée un fichier .mdx avec le
// frontmatter pré-rempli (titre, maillage interne, date) et un squelette de
// titres à développer. La rédaction reste faite par Claude en session,
// volontairement : voir la section "workflow" de SEO_GUIDES_PLAN.md pour
// pourquoi ce n'est pas un appel API non supervisé.
//
// Usage : npm run guide:next
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'SEO_GUIDES_PLAN.md');
const GUIDES_DIR = path.join(ROOT, 'src', 'content', 'guides');

const plan = readFileSync(PLAN_PATH, 'utf-8');

const blockMatch = plan.match(/```json\n([\s\S]*?)\n```/);
if (!blockMatch) {
  console.error('Bloc ```json``` du calendrier introuvable dans SEO_GUIDES_PLAN.md.');
  process.exit(1);
}
const calendrier = JSON.parse(blockMatch[1]);

const prochaine = calendrier.find((entree) => entree.statut === 'à rédiger');
if (!prochaine) {
  console.log('Aucune semaine "à rédiger" — calendrier à jour ou trimestre terminé. Voir SEO_GUIDES_PLAN.md.');
  process.exit(0);
}

const cheminGuide = path.join(GUIDES_DIR, `${prochaine.slug}.mdx`);
if (existsSync(cheminGuide)) {
  console.error(`${cheminGuide} existe déjà — corriger le statut dans SEO_GUIDES_PLAN.md avant de relancer.`);
  process.exit(1);
}

const aujourdHui = new Date().toISOString().slice(0, 10);

const racesLieesYaml = prochaine.maillage.racesLiees
  .map((r) => `  - { slug: ${r.slug}, espece: ${r.espece} }`)
  .join('\n');

const outilsCommentaire = prochaine.maillage.outils.length
  ? `\n<!-- Outils à lier contextuellement dans le corps du texte, pas en liste : ${prochaine.maillage.outils.join(', ')} -->`
  : '';

const squelette = `---
titre: "TODO — titre éditorial complet pour : ${prochaine.sujet}"
titreCourt: "TODO"
resume: "TODO — 200 caractères max, sert aussi de meta description."
categorie: "TODO — une valeur parmi bien-etre-sante, education-comportement, mode-de-vie-urbain, budget-pratique (voir src/lib/guideCategories.ts)"

image: "TODO — réutiliser une image déjà vérifiée d'une fiche race existante (../../assets/images/races/<slug>.jpg)"
imageAlt: "TODO"
imageCredit:
  auteur: "TODO"
  licence: "TODO"
  lienLicence: "TODO"
  source: "TODO"

racesLiees:
${racesLieesYaml}

faq:
  - question: "TODO — au moins 3 questions réelles"
    reponse: "TODO"

sources:
  - "TODO"
auteur: "Rédaction Boussole Animale"
dateMiseAJour: ${aujourdHui}
---
${outilsCommentaire}
<!--
  Semaine ${prochaine.semaine} — requête cible : "${prochaine.requeteCible}"
  Intention : ${prochaine.intention}
  Brouillon généré par scripts/next-guide-draft.mjs — à rédiger, puis relire
  avant tout commit (voir SEO_GUIDES_PLAN.md, section workflow).
-->

## TODO — premier H2, répond frontalement à "${prochaine.requeteCible}"

## TODO — H2 suivants, un par sous-angle
`;

writeFileSync(cheminGuide, squelette);

const planMisAJour = plan.replace(
  blockMatch[0],
  '```json\n' +
    JSON.stringify(
      calendrier.map((e) => (e.slug === prochaine.slug ? { ...e, statut: 'brouillon créé' } : e)),
      null,
      2
    ) +
    '\n```'
);
writeFileSync(PLAN_PATH, planMisAJour);

console.log(`✓ Brouillon créé : src/content/guides/${prochaine.slug}.mdx (semaine ${prochaine.semaine})`);
console.log(`  Requête cible : "${prochaine.requeteCible}"`);
console.log(`  Statut mis à jour dans SEO_GUIDES_PLAN.md : "brouillon créé"`);
