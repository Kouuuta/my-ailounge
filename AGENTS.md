# AGENTS.md

## Project Context

Primary reference for AI coding agents (OpenCode, Claude Code, Gemini CLI).
Mind You AI Council and AI Factory — engineering intelligence dashboard, data pipelines, and automation infrastructure.
Tech: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Radix UI, SQLite
Path alias: @/\* → project root, NOT src/

## Quick Start

npm install → npm run db:migrate → npm run ingest → npm run dev

## Commands

npm run dev — Start development server
npm run build — Production build
npm run start — Start production server
npm run ingest — Run all 4 ingesters
npm run ingest:hn — Hacker News only
npm run ingest:rss — RSS feeds only
npm run ingest:trending — GitHub Trending only
npm run ingest:manual — Manual feed markdown only
npm run db:migrate — Create/migrate SQLite DB

## ⚠️ Critical Constraints

| Trap                            | Truth                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| @/ maps to src/                 | ❌ @/\* maps to project root — use @/src/db/client, NOT @/db/client                                 |
| One cn() utility                | ❌ Two exist: @/lib/utils (shadcn/clsx+twMerge) for UI, @/src/lib/utils (string join) for ingesters |
| TW config in tailwind.config.ts | ❌ TW v4 uses app/globals.css @theme — the .ts file is vestigial                                    |
| PostCSS uses tailwindcss        | ❌ Uses @tailwindcss/postcss only                                                                   |
| data/dashboard.db is committed  | ❌ Gitignored — create locally via npm run db:migrate                                               |
| 'use client' on every component | ❌ Server-first. Only add 'use client' for Radix primitives, event handlers, state, ThemeProvider   |
| Server components use fetch()   | ❌ Server: getDb() directly. Client: fetch(/api/...)                                                |

## Navigation Map

| Task                            | Go to                                          |
| ------------------------------- | ---------------------------------------------- |
| Add a page                      | app/<name>/page.tsx                            |
| Add an API route                | app/api/<name>/route.ts                        |
| Add/change a DB column or table | src/db/schema.ts                               |
| Add an RSS feed source          | src/ingesters/rss/feeds.ts                     |
| Add a new ingester              | src/ingesters/<name>/index.ts                  |
| Add a dashboard widget          | components/engineering-intelligence/<Name>.tsx |
| Add a UI primitive              | components/ui/<Name>.tsx                       |
| Add an intern task              | src/config/intern-tasks.ts                     |
| Modify an analytics query       | src/lib/analytics.ts                           |
| Add a diagram                   | diagrams/<name>.md                             |
| Find the documentation index    | docs/README.md                                 |

## Coding Rules

- **Imports**: @/\* maps to root. DB → @/src/db/client. UI cn() → @/lib/utils. Ingester cn() → @/src/lib/utils.
- **Components**: Server-first. 'use client' only for Radix primitives, event handlers, state, ThemeProvider.
- **CSS**: Tailwind v4 only. No CSS/SCSS modules. Custom tokens in globals.css @theme block.
- **Files**: page.tsx / route.ts / layout.tsx for Next.js conventions. PascalCase for component file names.
- **Data fetching**: Server components call getDb() at request time. Client components use fetch() to API routes.

## Workflow

- Branch: feat/description or fix/description
- Read the sub-README before editing any module
- For documentation discovery, start with docs/README.md
- After schema changes: run npm run db:migrate, then npm run build
- After ingester changes: run npm run ingest, then npm run build
- Before commit: npm run build must pass
- After changing app/, app/api/, src/, components/, or docs/: update the corresponding README.md — documentation is part of the implementation
- No tests or linter configured yet

## Available Skills

caveman — Ultra-compressed output (75% fewer tokens)
github-deep-research — Multi-round repo analysis, timeline reconstruction
planning-and-task-breakdown — Break specifications into ordered tasks
ui-ux-pro-max — UI/UX design, shadcn, Tailwind, color systems, component architecture
