# Contributing to Works of Thomas Aquinas

First off, **thank you** for considering contributing! I truly believe in open source and the power of community collaboration. Unlike many repositories, I actively welcome contributions of all kinds - from bug fixes to new features.

## My Promise to Contributors

- **I will respond to every PR and issue** - I guarantee feedback on all contributions
- **Bug fixes are obvious accepts** - If it fixes a bug, it's getting merged
- **New features are welcome** - I'm genuinely open to new ideas and enhancements
- **Direct line of communication** - If I'm not responding to a PR or issue, email me directly at johnvondrashek@gmail.com

## About This Project

This repository hosts a digitized collection of theological texts by St. Thomas Aquinas, originally compiled by Fr. Joseph Kenny, O.P. (1936-2013). The site is built with Astro and deployed to GitHub Pages, serving approximately 1,700 HTML files containing Latin and English translations of works including:

- **Summa Theologica** - The masterwork of systematic theology
- **Summa Contra Gentiles** - Apologetic treatise
- **Quaestiones Disputatae** - Disputed questions on topics like truth, power, and the soul
- **Commentaries** - On Aristotle, Scripture, and other works
- **Opuscula** - Shorter treatises, hymns, and prayers

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Open a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Browser/device information if relevant
   - Screenshots if helpful

### Suggesting Features

I'm open to new features! Some areas where contributions would be particularly valuable:

- **Navigation improvements** - Better ways to browse the texts
- **Search functionality** - Full-text search across all works
- **Reading experience** - Typography, layout, accessibility
- **Cross-references** - Links between related passages
- **Parallel text views** - Side-by-side Latin/English reading

When suggesting a feature, please explain:
- The problem it solves
- Your proposed solution
- How it fits with the project's goal of making Aquinas accessible

### Submitting Pull Requests

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/your-feature-name`)
3. **Make your changes**
4. **Test locally** (see Development Setup below)
5. **Commit** with clear messages
6. **Push** and open a Pull Request

## Development Setup

### Prerequisites

- Node.js 20+
- npm

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dhspriory.github.io.git
cd dhspriory.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:4321`

### Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (output to dist/)
npm run preview  # Preview production build
```

### Project Structure

```
src/
├── pages/           # Astro page routes
├── layouts/         # Shared layouts (Base, LegacyContent)
├── components/      # Reusable components (Nav, WorkCard, etc.)
├── content/works/   # Work metadata (YAML files)
└── data/            # Generated inventory data

public/
└── thomas/          # ~1,700 legacy HTML files
```

### Content Collections

Work metadata is defined in `src/content/works/*.yaml` with fields for:
- Title, Latin title, abbreviation
- Category (major-theological, quaestiones-disputatae, opuscula, etc.)
- Language paths and source/translator information

## Your First Contribution

Look for issues labeled `good first issue` or `help wanted`. Some beginner-friendly tasks:

- Fixing typos or broken links in the texts
- Improving accessibility (alt text, ARIA labels, color contrast)
- Adding metadata for works
- Documentation improvements

Resources for first-time contributors:
- http://makeapullrequest.com/
- https://www.firsttimersonly.com/

## Content Guidelines

When working with the theological texts:

- **Preserve accuracy** - These are scholarly translations; don't alter the text content
- **Maintain structure** - Keep existing hierarchies (Parts, Questions, Articles)
- **Respect the sources** - Credit translators and original sources appropriately

## Code Style

- Use TypeScript where applicable
- Follow existing code formatting (the project uses Prettier)
- Write semantic HTML with accessibility in mind
- Keep components simple and focused

## Code of Conduct

This project follows the [Rule of St. Benedict](CODE_OF_CONDUCT.md) as its code of conduct - a 1,500-year-old guide to community life that emphasizes charity, humility, and mutual respect.

## Questions?

- **Open an issue** - Best for questions that might help others
- **Email directly** - johnvondrashek@gmail.com

Thank you for helping preserve and share the works of St. Thomas Aquinas!
