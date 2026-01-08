import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://johnvondrashek.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
