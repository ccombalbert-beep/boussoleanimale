// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod du sitemap : uniquement des dates réelles, lues dans le frontmatter
// des contenus. Les pages sans date fiable (outils, pages légales) n'en ont
// pas, plutôt qu'une date de build qui changerait à chaque déploiement.
function datesDeMiseAJour() {
  const dates = new Map();
  const plusRecente = (/** @type {string} */ chemin, /** @type {string} */ date) => {
    if (!dates.has(chemin) || date > dates.get(chemin)) dates.set(chemin, date);
  };
  for (const [collection, base] of [
    ['chiens', '/chiens/races/'],
    ['chats', '/chats/races/'],
    ['guides', '/guides/'],
  ]) {
    const dossier = new URL(`./src/content/${collection}/`, import.meta.url);
    for (const fichier of readdirSync(dossier)) {
      if (!fichier.endsWith('.mdx')) continue;
      const contenu = readFileSync(new URL(fichier, dossier), 'utf-8');
      const date = contenu.match(/^dateMiseAJour: (\d{4}-\d{2}-\d{2})/m)?.[1];
      if (!date) continue;
      plusRecente(`${base}${fichier.replace(/\.mdx$/, '')}/`, date);
      // Les pages d'index et l'accueil changent quand leur contenu change.
      plusRecente(`/${collection}/`, date);
      plusRecente('/', date);
    }
  }
  return dates;
}

const lastmodParChemin = datesDeMiseAJour();

// https://astro.build/config
export default defineConfig({
  // À mettre à jour avec le sous-domaine Netlify pendant le développement,
  // puis avec le domaine définitif une fois acheté.
  site: 'https://boussoleanimale.fr',

  // Tous les liens internes du site utilisent déjà systématiquement le slash
  // final (vérifié) : ce réglage le rend explicite plutôt qu'implicite, fait
  // avertir Astro en dev si un lien s'en écarte jamais, et évite qu'une même
  // page soit indexable sous deux URLs différentes (avec et sans slash).
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    preact(),
    mdx(),
    sitemap({
      // Priorité et fréquence par type de page — Google les ignore very
      // largement pour le classement, mais elles restent un signal correct
      // pour les autres moteurs et documentent l'architecture du site.
      serialize(entree) {
        const chemin = new URL(entree.url).pathname;
        const lastmod = lastmodParChemin.get(chemin);
        const item = lastmod ? { ...entree, lastmod } : entree;
        if (chemin === '/') {
          return { ...item, priority: 1.0, changefreq: EnumChangefreq.WEEKLY };
        }
        if (/^\/(chiens|chats|guides|outils|enquetes)\/$/.test(chemin)) {
          return { ...item, priority: 0.8, changefreq: EnumChangefreq.WEEKLY };
        }
        if (/^\/(chiens|chats)\/races\/[^/]+\/$/.test(chemin)) {
          return { ...item, priority: 0.7, changefreq: EnumChangefreq.MONTHLY };
        }
        if (/^\/(guides|enquetes)\/[^/]+\/$/.test(chemin)) {
          return { ...item, priority: 0.7, changefreq: EnumChangefreq.MONTHLY };
        }
        if (chemin.startsWith('/outils/')) {
          return { ...item, priority: 0.6, changefreq: EnumChangefreq.MONTHLY };
        }
        return { ...item, priority: 0.3, changefreq: EnumChangefreq.YEARLY };
      },
    }),
  ]
});