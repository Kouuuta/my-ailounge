# AGENTS.md

## Project Overview

Developer Dashboard — engineering intelligence feed aggregator.
Tech: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Radix UI, SQLite
PM: npm | Path alias: @/\* → project root (NOT src/)

## Quick Start (in order)

npm install → npm run db:migrate → npm run ingest → npm run dev

## Commands

npm run dev / build / start — Dashboard
npm run ingest — Run all 4 ingesters
npm run ingest:hn / ingest:rss / ingest:trending / ingest:manual — Single ingesters
npm run db:migrate — Create/migrate SQLite DB

## Default Workflow

- Read the sub-README before editing a module
- Feature branches: feat/description
- Re-run `npm run db:migrate` after schema changes
- Re-run `npm run ingest` after ingester changes to verify
- No tests or linter configured yet

## ⚠️ Common Gotchas

| Trap                                  | Truth                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| @/ maps to src/                       | ❌ @/\* maps to project root — use @/src/db/client, NOT @/db/client                                   |
| One cn() utility                      | ❌ Two exist: lib/utils.ts (shadcn/clsx+twMerge) for UI, src/lib/utils.ts (string join) for ingesters |
| Tailwind config in tailwind.config.ts | ❌ TW v4 uses app/globals.css @theme — the .ts file is vestigial                                      |
| PostCSS uses tailwindcss              | ❌ Uses @tailwindcss/postcss only                                                                     |
| data/dashboard.db is committed        | ❌ Gitignored — create locally via npm run db:migrate                                                 |

## Architecture

app/ — 3 pages + 4 API routes → app/README.md
src/ — 4 ingesters + DB (3 tables) + analytics → src/README.md
components/ — shadcn/ui + dashboard widgets → components/README.md
scripts/ — Standalone utilities
data/ — SQLite (gitignored)
docs/ — Onboarding, plans, research → docs/README.md

## Reference Docs

docs/README.md — Documentation hub (reading order, audits)
src/README.md — Data pipeline overview
app/README.md — Pages and API routes
components/README.md — UI components and widgets
├── src/ingesters/README.md — Ingestion pipeline
├── src/db/README.md — SQLite schema
├── src/lib/README.md — Shared utilities
├── src/config/README.md — Seed config
├── app/api/feed/README.md — Feed API
├── app/api/watchlist/README.md — Watchlist API
├── components/ui/README.md — UI primitives
└── components/engineering-intelligence/README.md — Dashboard widgets

## Available Skills

ui-ux-pro-max, caveman
