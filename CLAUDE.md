# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository hosts the **Works of Thomas Aquinas** website, a static collection of theological texts by St. Thomas Aquinas in Latin and English. Originally compiled by Fr. Joseph Kenny, O.P. (1936-2013), deployed to GitHub Pages via GitHub Actions.

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:4321)
npm run build        # Build for production (output to dist/)
npm run preview      # Preview production build
```

## Project Structure

```
src/
├── pages/
│   ├── index.astro           # Home page
│   ├── works/
│   │   ├── index.astro       # Works listing with search/filter
│   │   └── [id].astro        # Individual work detail pages
│   └── thomas/
│       └── index.astro       # Legacy index wrapper
├── layouts/
│   ├── Base.astro            # Base HTML layout with nav/footer
│   └── LegacyContent.astro   # Wrapper for legacy HTML content
├── components/
│   ├── Nav.astro             # Navigation component
│   ├── WorkCard.astro        # Work listing card
│   └── WorksFilter.astro     # Search and category filter
├── content/
│   └── works/*.yaml          # Metadata for each major work
├── data/
│   └── inventory.json        # Generated inventory of all HTML files
└── content.config.ts         # Astro content collections schema

public/
├── thomas/                   # Legacy HTML files (served at /thomas/*)
└── robots.txt               # Search engine directives

.github/workflows/
└── deploy.yml               # GitHub Actions deployment workflow
```

## Content Collections

Work metadata is defined in `src/content/works/*.yaml` with this schema:
- `title`, `latinTitle`, `abbreviation`
- `category`: major-theological | quaestiones-disputatae | opuscula | aristotle-commentary | biblical-commentary | other-commentary | popular
- `languages.latinEnglish`, `languages.english`: paths to content
- `parts`: optional array for hierarchical works (Summa)

## Legacy Content

~1,700 HTML files in `public/thomas/` are served statically at their original URLs:
- `/thomas/*.htm` - Latin & English bilingual versions
- `/thomas/english/` - English-only versions
- `/thomas/summa/` - Summa Theologica structure

## Deployment

Push to `main` triggers GitHub Actions workflow that:
1. Builds the Astro site
2. Deploys to GitHub Pages

Requires GitHub Pages to be configured for "GitHub Actions" deployment source.

## Key Files

- `docs/plans/2026-01-07-astro-migration-design.md` - Migration design document
- `ASTRO_PLAN.md` - Original modernization roadmap
