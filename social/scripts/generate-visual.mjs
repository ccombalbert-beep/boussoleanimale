#!/usr/bin/env node
// Génère les visuels statiques (PNG) pour chaque entrée d'un calendrier.
// Lit la même source que generate-hooks.mjs, choisit le gabarit selon le
// pilier, compose la vraie photo déjà vérifiée du site avec le calque SVG,
// et écrit dans output/review/visuals/.
//
// Usage : node scripts/generate-visual.mjs calendar/semaine-01.json
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSource } from './lib/content-source.mjs';
import { specimenCard, mytheCarousel, naturalisteCard } from './lib/templates-visual.mjs';
import { renderOverlaidImage } from './lib/visual-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '../../');

const calendarFile = process.argv[2];
if (!calendarFile) {
  console.error('Usage: node scripts/generate-visual.mjs calendar/semaine-01.json');
  process.exit(1);
}

const W = 1080;
const H = 1350;

function templateFor(pillar) {
  if (pillar === 1 || pillar === 3) return specimenCard;
  if (pillar === 2) return mytheCarousel;
  if (pillar === 4) return naturalisteCard;
  return null; // pilier 5 : pas de gabarit visuel dédié en V1 (texte pur suffit sur la plupart des posts FAQ)
}

const calendar = JSON.parse(readFileSync(calendarFile, 'utf-8'));
const outDir = path.join('output', 'review', 'visuals');
mkdirSync(outDir, { recursive: true });

let rendered = 0;
let skipped = 0;

for (const entry of calendar.entries) {
  const build = templateFor(entry.pillar);
  if (!build) {
    skipped++;
    continue;
  }
  if (entry.source.type === 'outil') {
    // Les outils n'ont pas de photo de fiche dédiée — pas de visuel généré,
    // ce sont des posts natifs (sticker sondage, lien) à composer à la main.
    skipped++;
    continue;
  }

  const data = readSource(entry.source);
  const imagePath = path.join(SITE_ROOT, 'src/assets/images/races', `${entry.source.slug}.jpg`);
  if (!existsSync(imagePath)) {
    console.warn(`⚠ image introuvable pour ${entry.source.slug}, ignoré`);
    skipped++;
    continue;
  }

  const slides = build(data);
  const baseId = `${entry.date}_${entry.platform}_${entry.source.slug}`;

  for (const slide of slides) {
    const outPath = path.join(outDir, `${baseId}_${slide.name}.png`);
    await renderOverlaidImage({ imagePath, overlaySvg: slide.svg, outPath, width: W, height: H });
    rendered++;
  }
}

console.log(`✓ ${rendered} visuel(s) généré(s), ${skipped} entrée(s) sans gabarit visuel (dans ${outDir}/)`);
