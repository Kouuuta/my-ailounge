# `src/db/` — SQLite Database Layer

Local SQLite store for the Developer Dashboard. Uses `better-sqlite3` with WAL mode. Database file lives at `data/dashboard.db` (gitignored).

## Files

### `client.ts`

Singleton database client. Creates and reuses a single `better-sqlite3` connection with WAL journal mode and foreign keys enabled.

```ts
import { getDb } from "@/src/db/client";
const db = getDb(); // Returns the singleton instance
```

### `schema.ts`

Defines and migrates 3 tables + indexes. Also seeds initial data.

#### Tables

**`feed_items`** — Core ingestion store for the Developer Intelligence Feed.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `source` | TEXT | `'manual'`, `'hn'`, `'rss'`, `'github_trending'` |
| `category` | TEXT | `'ai'`, `'nextjs'`, `'django'`, `'security'`, etc. |
| `external_id` | TEXT | Source's own ID for idempotent upserts |
| `title` | TEXT | Article/repo title |
| `url` | TEXT | Full URL |
| `summary` | TEXT | Short description |
| `tags` | TEXT | Comma-separated tags |
| `score` | INTEGER | HN points, stars, relevance rank |
| `published_at` | TEXT | ISO 8601 |
| `fetched_at` | TEXT | ISO 8601, defaults to `datetime('now')` |
| `is_pinned` | INTEGER | 0/1 |
| `is_read` | INTEGER | 0/1 |

**Indexes:** `category`, `source`, `published_at`

**Unique constraint:** `(source, url)` prevents duplicates.

---

**`kv_store`** — Simple key-value storage for ingestion status tracking.

| Column | Type |
|--------|------|
| `key` | TEXT | Primary key |
| `value` | TEXT | Stored value |

Used by `run-all.ts` and `analytics.ts` to track per-source ingestion status (`ingest:last_run:*`, `ingest:status:*`, `ingest:count:*`, `ingest:elapsed_ms:*`).

---

**`watchlist_items`** — Stack Watchlist (Module 3).

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `name` | TEXT | Unique, e.g. `'Next.js'` |
| `category` | TEXT | `'framework'`, `'database'`, `'infra'`, `'cloud'`, `'ai-sdk'` |
| `installed_version` | TEXT | Currently deployed version |
| `latest_version` | TEXT | Latest available version |
| `risk_level` | TEXT | `'low'`, `'medium'`, `'high'` (default `'low'`) |
| `upgrade_notes` | TEXT | Migration notes |
| `known_vulns` | TEXT | Known CVEs |
| `migration_link` | TEXT | Link to upgrade guide |
| `updated_at` | TEXT | ISO 8601, defaults to `datetime('now')` |

**Seed data:** 14 items on first migration (Next.js, React, Django, DRF, PostgreSQL, Redis, Docker, AWS, Celery, GitHub Actions, Sentry, OpenAI SDK, Anthropic SDK, DeepSeek SDK).

### `migrate.ts`

Entry point. Runs `schema.ts` migration.

```bash
npm run db:migrate
# or
npx tsx src/db/migrate.ts
```

## Usage

```ts
import { getDb } from "@/src/db/client";

const db = getDb();
const items = db.prepare("SELECT * FROM feed_items LIMIT 10").all();
```
