# CodePath DSA

CodePath is a written Data Structures & Algorithms (DSA) preparation platform for engineers who prefer reading over watching videos.

Built with:
- **Next.js 15** (App Router)
- **MDX** (Markdown with React components)
- **Supabase** (Authentication & eventual progress tracking)

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the site.

## Adding New Problems

All problems are written in MDX (Markdown) and stored in the `content/problems/` directory.

> **See [ADDING_PROBLEMS.md](ADDING_PROBLEMS.md) for the complete guide on the MDX syntax, components, and how to add a problem to the roadmap.**

## Technology Choices

- **Content**: `next-mdx-remote` and `gray-matter` are used to parse Markdown files with YAML frontmatter at build time. Code blocks are automatically syntax-highlighted using `rehype-highlight` and `highlight.js`.
- **Styling**: `globals.css` using custom properties (CSS variables).
- **Authentication**: `supabase/ssr` to handle Google/GitHub OAuth and email logins.
