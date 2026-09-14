#!/usr/bin/env node
// Promeut le prochain guide SEO dû à publication (SEO_GUIDES_PLAN.md).
//
// Ne rédige ni ne modifie aucun contenu : renomme le brouillon déjà écrit et
// relu (<slug>.mdx.draft -> <slug>.mdx, ce qui le fait entrer dans le build
// Astro) et met à jour son statut dans le calendrier. La rédaction reste un
// choix humain fait en amont — ce script ne fait que respecter le rythme
// d'un guide par semaine, jamais plus vite (voir SEO_GUIDES_PLAN.md, section
// workflow, pour pourquoi ce rythme est délibéré).
//
// Usage : npm run guide:publish-week
import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
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

const aujourdHui = new Date().toISOString().slice(0, 10);

const dus = calendrier
  .filter((e) => e.statut === 'rédigé, prêt' && e.datePublicationPrevue <= aujourdHui)
  .sort((a, b) => a.datePublicationPrevue.localeCompare(b.datePublicationPrevue));

if (dus.length === 0) {
  console.log(`Aucun guide dû aujourd'hui (${aujourdHui}). Rien à publier.`);
  process.exit(0);
}

const prochain = dus[0];
const cheminDraft = path.join(GUIDES_DIR, `${prochain.slug}.mdx.draft`);
const cheminFinal = path.join(GUIDES_DIR, `${prochain.slug}.mdx`);

if (!existsSync(cheminDraft)) {
  console.error(`Brouillon introuvable : ${cheminDraft} — vérifier le calendrier avant de relancer.`);
  process.exit(1);
}
if (existsSync(cheminFinal)) {
  console.error(`${cheminFinal} existe déjà — un guide de ce slug est peut-être déjà publié.`);
  process.exit(1);
}

renameSync(cheminDraft, cheminFinal);

const calendrierMisAJour = calendrier.map((e) =>
  e.slug === prochain.slug ? { ...e, statut: 'publié' } : e
);
const nbPublies = calendrierMisAJour.filter((e) => e.statut === 'publié').length;

let planMisAJour = plan.replace(
  blockMatch[0],
  '```json\n' + JSON.stringify(calendrierMisAJour, null, 2) + '\n```'
);
planMisAJour = planMisAJour.replace(
  /\*\*Statut : .*\*\*/,
  `**Statut : ${nbPublies}/13 publiés (dernier en date : semaine ${prochain.semaine}, ${aujourdHui})**`
);
writeFileSync(PLAN_PATH, planMisAJour);

console.log(`✓ Publié : src/content/guides/${prochain.slug}.mdx (semaine ${prochain.semaine})`);
console.log(`  Titre : ${prochain.sujet}`);
console.log(`  ${nbPublies}/13 guides publiés au total.`);
