#!/usr/bin/env node
// Génère l'en-tête Content-Security-Policy après chaque build et l'écrit
// dans dist/_headers (format Netlify).
//
// Pourquoi ce script et pas des hash codés en dur dans netlify.toml : Astro
// injecte des <script> inline dont le contenu varie selon la page (runtime
// d'hydratation Preact pour client:visible vs client:load, props sérialisées
// par île...) — coder les hash à la main casserait silencieusement le site
// au moindre changement (édition d'un composant, mise à jour d'Astro). Ce
// script scanne TOUT dist/ à chaque build et recalcule les hash réels, donc
// il ne peut pas désynchroniser du contenu effectivement servi.
//
// À lancer après `astro build` (cf. "postbuild" dans package.json).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
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

const SCRIPT_TAG_RE = /<script([^>]*)>([\s\S]*?)<\/script>/g;

function extractInlineScriptHashes(html) {
  const hashes = new Set();
  let m;
  SCRIPT_TAG_RE.lastIndex = 0;
  while ((m = SCRIPT_TAG_RE.exec(html))) {
    const attrs = m[1];
    const body = m[2].trim();
    if (!body) continue;
    if (/\bsrc=/.test(attrs)) continue; // script externe, pas concerné par les hash
    // application/ld+json et application/json sont des blocs de données, pas
    // du script exécutable — la CSP script-src ne s'y applique pas (spec).
    if (/type=["']application\/(ld\+)?json["']/.test(attrs)) continue;
    const hash = createHash('sha256').update(body, 'utf-8').digest('base64');
    hashes.add(`'sha256-${hash}'`);
  }
  return hashes;
}

if (!statSync(DIST, { throwIfNoEntry: false })) {
  console.error('dist/ introuvable — lancer après `astro build`.');
  process.exit(1);
}

const files = listHtmlFiles(DIST);
const allHashes = new Set();
for (const f of files) {
  const html = readFileSync(f, 'utf-8');
  for (const h of extractInlineScriptHashes(html)) allHashes.add(h);
}

// Hash d'un script qu'Astro <ClientRouter /> (View Transitions) recrée
// dynamiquement au chargement via createElement('script') — absent du HTML
// statique généré, donc invisible au scan ci-dessus, mais vérifié stable sur
// plusieurs rechargements (code interne d'Astro, pas du contenu variable).
// À revérifier après toute mise à jour majeure d'Astro : si le hash change,
// le site cassera silencieusement pour ce script précis (violation CSP
// visible en console, testé avec scripts/serve-dist-with-headers.mjs +
// l'onglet Console du navigateur — cf. CHECKLIST_PROD.md phase 1).
const CLIENT_ROUTER_RUNTIME_HASH = "'sha256-eFej0pYgZ1hHPi/dKt50oi4YrA2MNRS+a6xW8YTNkH8='";

const scriptSrc = ["'self'", ...allHashes, CLIENT_ROUTER_RUNTIME_HASH].join(' ');

// style-src garde 'unsafe-inline' : l'effet "magnetic" du CTA principal
// (Layout.astro) pose el.style.transform/transition en JS à chaque
// mousemove — un style différent à chaque frame, impossible à allowlister
// par hash. Testé en conditions réelles (navigateur + CSP appliquée) : sans
// cette exception, l'effet est cassé silencieusement (aucune erreur JS,
// juste plus d'animation). Le risque accepté est faible : l'injection de
// style seule ne permet pas d'exécuter du code, contrairement à script-src
// qui reste strict (hash uniquement, aucun 'unsafe-inline').
const csp = [
  `default-src 'self'`,
  `script-src ${scriptSrc}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join('; ');

const headersFile = [
  '/*',
  `  Content-Security-Policy: ${csp}`,
  '  X-Frame-Options: DENY',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: geolocation=(), microphone=(), camera=()',
  '',
  '/images/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '/_astro/*',
  '  Cache-Control: public, max-age=31536000, immutable',
].join('\n');

writeFileSync(path.join(DIST, '_headers'), headersFile + '\n');

console.log(`✓ CSP générée à partir de ${files.length} page(s) — ${allHashes.size} hash de script inline — dist/_headers écrit.`);
