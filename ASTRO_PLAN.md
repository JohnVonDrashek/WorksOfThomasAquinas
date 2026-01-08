# Works of Thomas Aquinas – Modernization Plan

## Problem statement
The current WorksOfThomasAquinas site is a legacy static collection of HTML files originally designed for simple hosting. It is now served via GitHub Pages and functions minimally, but:
- The structure and markup are dated.
- Navigation and discoverability are limited.
- It will be difficult to extend, restyle, or add modern features without a more structured architecture.

Goal: design a path to migrate this content into a modern, maintainable Astro-based site while preserving all existing texts and links as much as possible.

## Current state (high‑level)
- Repository: `WorksOfThomasAquinas` on GitHub.
- Hosting: GitHub Pages, branch `main`, root `/`.
- Entry points:
  - Root `index.html` redirects to `/thomas/`.
  - `thomas/index.html` is the main index page listing works of St. Thomas Aquinas.
- Content:
  - Numerous `.htm` and supporting files under `thomas/` and subdirectories like `thomas/english/`, `thomas/summa/`, etc.
  - Static HTML, table-based layout, inline formatting, and a mix of internal and external links.

## High-level goals
- Preserve: all content, URLs that may be used in the wild, and overall structure of the index page.
- Improve: navigation, readability, responsiveness, typography, and accessibility.
- Modernize: migrate to Astro for layout components, routing, and future extensibility.
- Simplify maintenance: content organized in a structured way (e.g., frontmatter metadata) with clear build and deploy steps.

## Phase 1 – Inventory and content mapping
1. Crawl existing site (or repo) to build an inventory of pages and assets:
   - List all `.htm` / `.html` files under `thomas/` (and subdirectories).
   - Identify special sections: Summa Theologiae, Summa Contra Gentiles, commentaries, Quaestiones Disputatae, Opuscula, hymns, etc.
2. Classify content types and relationships:
   - Work-level pages (e.g., Summa index, Contra Gentiles index).
   - Part/chapter/quaestio-level pages.
   - Standalone texts (letters, hymns, short treatises).
   - Non-textual assets (images, gifs used as icons or decoration).
3. Decide on a stable URL strategy:
   - Option A: preserve current URLs as primary, and later add new “pretty” URLs that redirect.
   - Option B: introduce new canonical routes while maintaining redirects from old paths.
   - Document mapping from old paths to new Astro routes.

## Phase 2 – Content extraction and normalization
1. Choose how to represent content in the new stack:
   - Short term: keep original HTML files as-is and wrap them in Astro pages/components.
   - Longer term: progressively convert important works to Markdown/MDX with frontmatter (title, work, section, language, source, etc.).
2. For each HTML file type, define a normalization strategy:
   - Strip only obviously obsolete or layout-only markup (e.g., nested tables for layout) where possible.
   - Preserve semantic structure and any hand-crafted formatting in the text itself.
   - Ensure character encoding issues are resolved (UTF‑8, special characters, diacritics).
3. Introduce a metadata layer:
   - For each major work, create a metadata record (JSON, YAML, or TypeScript data) describing:
     - Title, Latin title, abbreviations.
     - Category (Summa, commentary, quaestio, opusculum, hymn, etc.).
     - Language(s) available and corresponding file paths.
     - Source information/credits and external links (e.g., translation project notes).

## Phase 3 – Astro project scaffolding
1. Create a new Astro project in a separate directory (e.g., `astro-site/`) or a dedicated branch:
   - Use `npm create astro@latest` with a minimal starter (no heavy CSS frameworks initially).
2. Configure basic project structure:
   - `src/pages/` for routes.
   - `src/layouts/` for shared layouts (base layout, work/collection layouts).
   - `src/components/` for navigation, search (later), and UI pieces.
   - `public/` for static assets (images, legacy HTML if served directly).
3. Add baseline tooling:
   - TypeScript (optional but recommended).
   - ESLint/Prettier for consistency.
   - Simple npm scripts: `dev`, `build`, `preview`.

## Phase 4 – Routing and navigation design
1. Define main routes in Astro:
   - `/` – home page for “Works of Thomas Aquinas” (clean, modern intro).
   - `/works/` – index of all works with filtering and categories.
   - `/works/[slug]/` – detail page per work (description, metadata, links to text).
   - `/texts/[legacyPath]` or similar – legacy-compatible routes if serving raw HTML files.
2. Implement navigation structure:
   - Global navigation bar linking to Home, Major Works, Summa, Commentaries, Quaestiones, Opuscula, etc.
   - Footer with source credits and links to original project where appropriate.
3. Integrate legacy URLs:
   - Map key legacy URLs (e.g., `thomas/summa/index.html`) to Astro routes via:
     - Static redirect pages in `public/`.
     - Or redirect rules if/when deploying to a platform that supports them.

## Phase 5 – Rendering legacy content in Astro
1. Short-term strategy (minimum viable migration):
   - Serve legacy HTML files from `public/legacy/` or similar.
   - Create Astro pages that embed legacy HTML via `iframe` or raw HTML inclusion for critical works.
2. Medium-term strategy (structured rendering):
   - For each major work, wrap legacy HTML in a consistent layout:
     - Header with title and metadata.
     - Main content area where legacy HTML is rendered.
   - Ensure the typography and background of legacy content harmonize with the new site.
3. Long-term strategy (full reflow):
   - Gradually convert key works to Markdown/MDX:
     - Use frontmatter for metadata.
     - Convert structural HTML elements to semantic Markdown (headings, lists, blockquotes).
   - Replace embedded tables-based layout with semantic sections and CSS.

## Phase 6 – Theming, UX, and accessibility
1. Establish a visual theme:
   - Choose a simple, timeless typographic palette suitable for long-form theological texts.
   - Use CSS variables or a design token system for colors, spacing, and typography.
2. Layout improvements:
   - Responsive layout with readable line length and margins on desktop and mobile.
   - Consistent headings hierarchy across works.
   - Clear navigation and breadcrumbs for deeply nested texts.
3. Accessibility:
   - Ensure color contrast meets WCAG guidelines.
   - Add appropriate ARIA attributes where needed.
   - Verify keyboard navigation works everywhere.
   - Ensure headings and landmarks are logically structured.

## Phase 7 – Search and discoverability (optional but recommended)
1. Decide on search strategy:
   - Simple: client-side search over metadata (titles, categories, descriptions).
   - Advanced: integrate with a search service (e.g., Algolia) or static index for full-text search.
2. Implement search UI:
   - Search bar on key pages (home, works index).
   - Filter controls for work category, language, and text type.
3. Improve external discoverability:
   - Add `<meta>` tags (description, Open Graph, Twitter cards) for major routes.
   - Generate a sitemap and `robots.txt` via Astro integrations.

## Phase 8 – Deployment strategy
1. Decide on deployment target for Astro:
   - GitHub Pages (static export) or another host (Netlify, Vercel, etc.).
2. Configure CI/CD:
   - GitHub Actions workflow to build Astro site on pushes to main (or a dedicated `astro-main` branch).
   - Deploy built `dist/` directory to the chosen host.
3. Migration plan from legacy GitHub Pages:
   - Option 1: Serve Astro site at a new subpath or repository and keep the current site as an archive.
   - Option 2: Replace legacy GitHub Pages with Astro build, while preserving legacy URLs via redirects.
   - Communicate any changes in URLs clearly on the homepage.

## Phase 9 – Ongoing maintenance and enhancements
1. Documentation:
   - Write short contributor docs explaining the content model, how to add a new work, and how to update existing texts.
2. Quality checks:
   - Add link checking (e.g., a link checker in CI) to catch broken internal links.
   - Periodically run accessibility audits (Lighthouse, axe, etc.).
3. Future enhancements:
   - Provide parallel Latin/English reading experience with side-by-side layouts for supported works.
   - Add cross-references between works (e.g., from Summa to commentaries).
   - Consider annotation or note-taking integration if appropriate in the future.