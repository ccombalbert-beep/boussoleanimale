#!/usr/bin/env node
// Sert dist/ en appliquant les en-têtes de dist/_headers (format Netlify,
// règle "/*" uniquement) — pour vérifier la CSP réellement en conditions
// proches de la prod avant déploiement. `astro preview` ne lit pas
// _headers, d'où ce petit serveur de test local, jetable après usage.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

// Types compressibles côté Netlify (texte) — les binaires (images, polices)
// ne le sont pas. Sans ça, un audit Lighthouse contre ce serveur surestime
// nettement le temps de transfert réel par rapport à la prod Netlify, qui
// compresse automatiquement (brotli/gzip).
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt']);

const DIST = path.resolve(process.cwd(), 'dist');
const PORT = 4322;

const globalHeaders = {};
const headersRaw = readFileSync(path.join(DIST, '_headers'), 'utf-8');
const lines = headersRaw.split('\n');
let inGlobalBlock = false;
for (const line of lines) {
  if (line.trim() === '/*') { inGlobalBlock = true; continue; }
  if (inGlobalBlock && line.startsWith('/')) { inGlobalBlock = false; }
  if (inGlobalBlock && line.trim()) {
    const idx = line.indexOf(':');
    globalHeaders[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.xml': 'application/xml', '.woff2': 'font/woff2' };

createServer((req, res) => {
  let filePath = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!existsSync(filePath) && !path.extname(filePath)) filePath = path.join(DIST, req.url, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('404'); return; }
  const ext = path.extname(filePath);
  for (const [k, v] of Object.entries(globalHeaders)) res.setHeader(k, v);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');

  const body = readFileSync(filePath);
  const acceptsGzip = (req.headers['accept-encoding'] || '').includes('gzip');
  if (COMPRESSIBLE.has(ext) && acceptsGzip) {
    res.setHeader('Content-Encoding', 'gzip');
    res.writeHead(200);
    res.end(gzipSync(body));
  } else {
    res.writeHead(200);
    res.end(body);
  }
}).listen(PORT, () => console.log(`Serveur de test (avec en-têtes) sur http://localhost:${PORT}`));
