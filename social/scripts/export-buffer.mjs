#!/usr/bin/env node
// Compile les posts approuvés (output/approved/*.json) en un CSV prêt pour
// un import en masse Buffer/Metricool, + un .txt par post pour copier-coller
// manuel si aucun outil de scheduling n'est encore branché.
//
// Ce script NE PUBLIE RIEN. Il exporte seulement — cf. WORKFLOW.md, axe 4 :
// aucun appel API de publication dans ce pipeline v1.
//
// Usage : node scripts/export-buffer.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const approvedDir = 'output/approved';
const exportDir = 'output/exports';
mkdirSync(exportDir, { recursive: true });

let files = [];
try {
  files = readdirSync(approvedDir).filter((f) => f.endsWith('.json'));
} catch {
  console.error(`Dossier ${approvedDir}/ introuvable ou vide — rien à exporter.`);
  console.error(`Voir social/WORKFLOW.md : les posts approuvés doivent y être déplacés depuis output/review/.`);
  process.exit(1);
}

if (files.length === 0) {
  console.log(`Aucun post approuvé dans ${approvedDir}/. Rien à exporter.`);
  process.exit(0);
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const rows = [['Date', 'Heure', 'Plateforme', 'Format', 'Texte', 'Média(s)', 'Lien de destination']];

for (const file of files) {
  const post = JSON.parse(readFileSync(path.join(approvedDir, file), 'utf-8'));
  const hookChoisi = post.hookChoisi ?? post.hooks?.[0] ?? '';
  const texteComplet = [hookChoisi, '', post.caption, '', post.hashtags?.join(' ')].filter(Boolean).join('\n');

  rows.push([
    post.date,
    '10:00', // heure par défaut, à ajuster manuellement selon les créneaux d'audience réels une fois mesurés
    post.platform,
    post.format,
    texteComplet,
    // ?? ne rattrape pas un tableau vide ([] n'est ni null ni undefined) —
    // sans ce test explicite, les posts sans gabarit visuel (pilier 5,
    // sources "outil") se retrouvaient avec une cellule Média(s) vide et
    // silencieuse plutôt qu'un signal explicite pour qui importe le CSV.
    post.mediaFiles?.length ? post.mediaFiles.join(' | ') : '(à joindre manuellement)',
    `https://boussoleanimale.fr${post.url ?? ''}`,
  ]);

  // Fichier texte individuel, pratique pour un copier-coller direct dans
  // l'app mobile Instagram/TikTok si aucun outil de scheduling n'est branché.
  const txtName = file.replace(/\.json$/, '.txt');
  writeFileSync(path.join(exportDir, txtName), texteComplet);
}

const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
writeFileSync(path.join(exportDir, 'buffer-import.csv'), csv);

console.log(`✓ ${files.length} post(s) exporté(s) → ${exportDir}/buffer-import.csv + un .txt par post`);
