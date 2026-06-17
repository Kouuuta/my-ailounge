# `src/ingesters/` — Feed Ingestion Pipeline

Fetches, parses, and stores feed items from multiple sources. Every ingester writes to **both** SQLite (via `lib/db.upsertEntry`) and markdown (via `lib/markdown.appendToFeed`).

## Architecture

```
                     ┌─────────────────────┐
                     │   run-all.ts         │
                     │  (orchestrator)      │
                     └──────┬──────────┬────┘
                            │          │
              ┌─────────────┤          ├─────────────┐
              ▼             ▼          ▼             ▼
         manual-feeds     rss/      hacker-news   github-trending
         (DONE)         (DONE)       (DONE)         (DONE)
           │              │            │              │
           └──────────────┴────────────┴──────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              lib/db.ts           lib/markdown.ts
           (SQLite upsert)      (append to .md)
```

## Ingesters

### `manual-feeds/` ✅ Done

Parses `docs/feeds/*.md` files and upserts entries into SQLite.

**Format parsed:** `- [Title](URL) | YYYY-MM-DD | tag1, tag2`

**Source:** `'manual'`

**File mapping:**
| File | Category |
|------|----------|
| `01-ai-news.md` | `ai` |
| `02-cloud-news.md` | `cloud` |
| `03-django-news.md` | `django` |
| `04-github-trending.md` | `github` |
| `05-hacker-news.md` | `hn` |
| `06-nextjs-news.md` | `nextjs` |
| `07-rumors.md` | `rumors` |
| `08-security-alerts.md` | `security` |

```bash
npm run ingest:manual
```

### `rss/` ✅ Done

Fetches 12 RSS/Atom feed URLs, parses with a regex-based parser (no external deps), writes to SQLite + markdown.

**Source:** `'rss'`

**Feed config:** `rss/feeds.ts` — 12 feeds mapped to categories and markdown files:
- AI News (OpenAI, Anthropic, Google AI)
- Next.js News (Next.js, Vercel)
- Django News (Django blog, Python blog)
- Security (GitHub Security Advisories)
- Cloud News (AWS, GCP)

**Date filter:** Only writes to markdown if `published_at >= 2026-01-01`. Always writes to SQLite.

```bash
npm run ingest:rss
```

### `hacker-news/` ✅ Done

Fetches top 20 stories from the [HN Algolia API](https://hn.algolia.com/api) (`search_by_date?tags=story`).

**Source:** `'hn'`

**How it works:**
- Calls `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=20`
- Strips `Ask HN:`, `Show HN:`, `Tell HN:` prefixes from titles
- Falls back to `https://news.ycombinator.com/item?id={objectID}` when no URL
- Writes both to `05-hacker-news.md` and SQLite with score (points)

```bash
npm run ingest:hn
```

### `github-trending/` ✅ Done

Reads the Python scraper output (`ideas/trending.md`) and syncs entries to SQLite + markdown.

**Source:** `'github_trending'`

**How it works:**
- Parses `ideas/trending.md` (format: `N. **[name](url)**: desc` under `### YYYY-MM-DD` headers)
- Writes both to `04-github-trending.md` and SQLite

**Note:** The Python scraper (`src/scraper.py`) generates `ideas/trending.md` via GitHub Actions. This ingester wraps that output — do not rebuild the fetcher.

```bash
npm run ingest:trending
```

## Orchestrator

### `run-all.ts`

Runs all 4 ingesters sequentially, tracks status in `kv_store`:

| Key | Value |
|-----|-------|
| `ingest:status:*` | `'ok'` or `'error'` |
| `ingest:last_run:*` | ISO 8601 timestamp |
| `ingest:count:*` | Number of new items inserted |
| `ingest:elapsed_ms:*` | Execution time in ms |
| `ingest:status:all` | `'ok'` or `'degraded'` |

Prints a summary table after execution.

```bash
npm run ingest
```

## Adding a New Feed Source

1. Add the URL to `rss/feeds.ts` with the correct `category` and `feedFile`
2. The RSS ingester will pick it up automatically on next run
