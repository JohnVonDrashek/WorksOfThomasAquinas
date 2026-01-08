# Astro Migration Design

## Overview

Migrate the Works of Thomas Aquinas static HTML site to Astro while preserving all existing URLs and content.

## Decisions

- **Location**: Replace in-place, legacy content moves to `public/legacy/`
- **TypeScript**: Yes
- **Approach**: Serve legacy HTML statically, wrap in new layouts progressively

## Project Structure

```
dhspriory.github.io/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home page
│   │   ├── works/index.astro        # Works listing
│   │   └── thomas/[...path].astro   # Legacy URL handler
│   ├── layouts/
│   │   ├── Base.astro               # Base HTML layout
│   │   └── LegacyContent.astro      # Legacy HTML wrapper
│   ├── components/
│   │   ├── Nav.astro                # Navigation
│   │   └── WorkCard.astro           # Work listing card
│   ├── content/
│   │   └── works/                   # Work metadata (YAML)
│   └── data/
│       └── inventory.json           # Generated file inventory
├── public/
│   └── legacy/
│       └── thomas/                  # Legacy .htm files
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Content Metadata Schema

```yaml
# src/content/works/<work-id>.yaml
title: string
latinTitle: string (optional)
abbreviation: string (optional)
category: major-theological | quaestiones-disputatae | opuscula | aristotle-commentary | biblical-commentary | other-commentary | popular
languages:
  latinEnglish: string (path)
  english: string (path, optional)
parts: array (optional, for hierarchical works)
source: string (optional)
translator: string (optional)
```

## URL Strategy

- `/` - New Astro home page
- `/works/` - New works index with categories and filtering
- `/thomas/*` - Handled by catch-all route, serves legacy content

## Phases Covered

1. **Inventory**: Generate `inventory.json` with all files
2. **Metadata**: Create YAML files for major works
3. **Scaffolding**: Astro project with layouts, components, pages
