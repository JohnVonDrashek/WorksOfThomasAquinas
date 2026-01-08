import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dhspriory.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
