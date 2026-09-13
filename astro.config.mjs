// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';

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
      serialize(item) {
        const chemin = new URL(item.url).pathname;
        if (chemin === '/') {
          return { ...item, priority: 1.0, changefreq: EnumChangefreq.WEEKLY };
        }
        if (/^\/(chiens|chats|guides|outils)\/$/.test(chemin)) {
          return { ...item, priority: 0.8, changefreq: EnumChangefreq.WEEKLY };
        }
        if (/^\/(chiens|chats)\/races\/[^/]+\/$/.test(chemin)) {
          return { ...item, priority: 0.7, changefreq: EnumChangefreq.MONTHLY };
        }
        if (/^\/guides\/[^/]+\/$/.test(chemin)) {
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