# `/src` — Data Pipeline & Core Logic

The data ingestion and storage layer for the Developer Dashboard.

## Pipeline

```
config/        — Seed data (intern tasks)
  ↓
ingesters/    — Fetch/parse feed sources → SQLite + markdown
  ↓
lib/          — Shared utilities (DB write, markdown write, analytics queries)
  ↓
db/           — SQLite client, schema, migration
```

## Relationship to Other Directories

| Directory | Role |
|-----------|------|
| `app/` | Next.js UI pages + API routes (consumes `src/db/` + `src/lib/` directly) |
| `components/` | Dashboard widgets (consume `src/lib/analytics.ts`) |
| `scripts/` | Standalone utilities (`clean-feed-files.ts`, `_check-db.ts`) |
| `docs/feeds/` | Markdown feed files consumed by `ingesters/manual-feeds/` and written to by all ingesters |

## Quickstart

```bash
# Run DB migration (creates tables + seeds data)
npm run db:migrate

# Run all ingesters
npm run ingest

# Run a single ingester
npm run ingest:manual     # docs/feeds/*.md → SQLite
npm run ingest:rss        # RSS/Atom feeds
npm run ingest:hn         # Hacker News (HN Algolia API)
npm run ingest:trending   # GitHub Trending (ideas/trending.md → SQLite)
```

## Status

| Module | Status |
|--------|--------|
| `db/` | ✅ Done — 3 tables, migration, seed data |
| `ingesters/manual-feeds/` | ✅ Done — parses markdown → SQLite |
| `ingesters/rss/` | ✅ Done — 12 RSS feeds, regex parser |
| `ingesters/hacker-news/` | ✅ Done — HN Algolia API, 20 stories |
| `ingesters/github-trending/` | ✅ Done — parses ideas/trending.md → SQLite |
| `ingesters/run-all` | ✅ Done — orchestrator with kv_store tracking |
| `lib/` | ✅ Done — DB, markdown, analytics utilities |
| `config/` | ✅ Done — intern task seed data |
