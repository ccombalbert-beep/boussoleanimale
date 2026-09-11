// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // À mettre à jour avec le sous-domaine Netlify pendant le développement,
  // puis avec le domaine définitif une fois acheté.
  site: 'https://boussoleanimale.fr',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [preact(), mdx(), sitemap()]
});