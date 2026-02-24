// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Wired via Docker Compose (and can be set locally):
  //   SITE_URL=https://auburnmontessori.org
  site: process.env.SITE_URL || 'https://auburnmontessori.org',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});