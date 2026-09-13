#!/usr/bin/env node
// Génère hooks + légende + hashtags pour chaque entrée d'un calendrier
// hebdomadaire, et écrit le résultat dans output/review/ pour validation
// humaine. Rien n'est publié : ce script ne fait QUE de la génération.
//
// Usage : node scripts/generate-hooks.mjs calendar/semaine-01.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { readSource } from './lib/content-source.mjs';
import { buildContent } from './lib/templates.mjs';

const calendarFile = process.argv[2];
if (!calendarFile) {
  console.error('Usage: node scripts/generate-hooks.mjs calendar/semaine-01.json');
  process.exit(1);
}

const calendar = JSON.parse(readFileSync(calendarFile, 'utf-8'));
const outDir = path.join('output', 'review');
mkdirSync(outDir, { recursive: true });

let count = 0;
for (const entry of calendar.entries) {
  const data = readSource(entry.source);
  const generated = buildContent(entry.pillar, data);

  const id = `${entry.date}_${entry.platform}_${entry.source.slug}`;
  const record = {
    ...entry,
    status: 'in_review',
    generatedAt: new Date().toISOString(),
    url: data.url,
    ...generated,
  };

  writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(record, null, 2));

  const md = [
    `# ${entry.workingTitle}`,
    ``,
    `**${entry.date} · ${entry.platform} · ${entry.format} · pilier ${entry.pillar}**`,
    `Source : \`${entry.source.type}/${entry.source.slug}\` → ${data.url}`,
    ``,
    `## Hooks (choisir 1, ou tester les 3)`,
    ...generated.hooks.map((h, i) => `${i + 1}. ${h}`),
    ``,
    `## Légende`,
    '```',
    generated.caption,
    '```',
    ``,
    `## Hashtags`,
    generated.hashtags.join(' '),
    ``,
    `## Notes de calendrier`,
    entry.notes || '_(aucune)_',
    ``,
    `---`,
    `**Statut : à valider par un humain avant publication.** Voir social/WORKFLOW.md.`,
  ].join('\n');
  writeFileSync(path.join(outDir, `${id}.md`), md);

  count++;
}

console.log(`✓ ${count} post(s) généré(s) dans ${outDir}/ (semaine ${calendar.week} — ${calendar.theme})`);
