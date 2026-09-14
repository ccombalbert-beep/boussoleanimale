#!/usr/bin/env node
// Audit du maillage interne : liens internes cassés et pages de contenu
// orphelines (aucun lien entrant depuis une autre page publiée). Lit
// directement dist/ (lancer après `npm run build`) plutôt que de dupliquer
// la logique de routage d'Astro — la seule source fiable du HTML réellement
// servi.
//
// Usage : node scripts/audit-internal-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.cwd(), 'dist');

function listHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error('dist/ introuvable — lancer après `npm run build`.');
  process.exit(1);
}

const files = listHtmlFiles(DIST);

function urlToPagePath(urlPath) {
  // "/chiens/races/labrador/" -> matches dist/chiens/races/labrador/index.html
  let p = urlPath.split('#')[0].split('?')[0];
  if (!p.startsWith('/')) return null;
  if (p === '/') return path.join(DIST, 'index.html');
  if (p.endsWith('/')) return path.join(DIST, p.slice(1, -1), 'index.html');
  return path.join(DIST, p.slice(1));
}

const HREF_RE = /<a\b[^>]*\shref="([^"]+)"/g;

const inbound = new Map(); // pagePath -> Set of source page paths
const brokenLinks = []; // { from, href }
const CONTENT_PATTERNS = [/\/chiens\/races\/[^/]+\/$/, /\/chats\/races\/[^/]+\/$/, /\/guides\/[^/]+\/$/];

for (const file of files) {
  const html = readFileSync(file, 'utf-8');
  let m;
  HREF_RE.lastIndex = 0;
  while ((m = HREF_RE.exec(html))) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue; // externe ou protocol-relative
    const targetPath = urlToPagePath(href);
    if (!targetPath) continue;
    if (!existsSync(targetPath)) {
      brokenLinks.push({ from: file.replace(DIST, ''), href });
      continue;
    }
    if (!inbound.has(targetPath)) inbound.set(targetPath, new Set());
    if (targetPath !== file) inbound.get(targetPath).add(file);
  }
}

const orphans = [];
for (const file of files) {
  const urlPath = file.replace(DIST, '').replace(/index\.html$/, '');
  if (!CONTENT_PATTERNS.some((re) => re.test(urlPath || '/'))) continue;
  const incoming = inbound.get(file);
  if (!incoming || incoming.size === 0) orphans.push(urlPath);
}

console.log(`Pages scannées : ${files.length}`);
console.log(`Liens internes cassés : ${brokenLinks.length}`);
for (const b of brokenLinks) console.log(`  - ${b.from} -> ${b.href}`);
console.log(`Pages de contenu orphelines (0 lien entrant) : ${orphans.length}`);
for (const o of orphans) console.log(`  - ${o}`);

if (brokenLinks.length === 0 && orphans.length === 0) {
  console.log('\n✓ Maillage interne propre : aucun lien cassé, aucune fiche/guide orphelin.');
}
