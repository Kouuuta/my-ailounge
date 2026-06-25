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

Defines and migrates 8 tables + indexes. Also seeds initial data.

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

---

**`log_analyses`** — Per-upload metadata for the Log Analysis Dashboard.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `filename` | TEXT | Uploaded CSV filename |
| `source` | TEXT | `'acuity'` or `'zoho'` |
| `uploaded_at` | TEXT | ISO 8601, defaults to `datetime('now')` |
| `total_rows` | INTEGER | Total parsed CSV rows |
| `error_count` | INTEGER | Rows classified as errors |
| `unique_errors` | INTEGER | Distinct error patterns |
| `time_range_start` | TEXT | Earliest timestamp in CSV |
| `time_range_end` | TEXT | Latest timestamp in CSV |
| `methods` | TEXT | JSON array of `{ method, count }` |
| `executive_summary` | TEXT | Human-readable analysis summary |

---

**`log_errors`** — Individual parsed rows from uploaded CSV.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `analysis_id` | INTEGER | FK → `log_analyses(id) ON DELETE CASCADE` |
| `source` | TEXT | `'acuity'` or `'zoho'` |
| `method` | TEXT | Detected method/endpoint column |
| `action` | TEXT | Detected action/type column |
| `content` | TEXT | Detected content/message column |
| `pattern_key` | TEXT | Normalized error pattern (variables replaced with `{var}`) — populated by parser, used for drill-down matching |
| `error_type` | TEXT | Extracted error type/summary (max 500 chars) |
| `error_code` | TEXT | Detected status/error code column |
| `raw_message` | TEXT | Full raw error message (max 1000 chars) |
| `timestamp` | TEXT | Detected timestamp column |
| `is_error` | INTEGER | `1` for error rows, `0` for success rows |

**Index:** `analysis_id`

---

**`log_patterns`** — Grouped error patterns aggregated at parse time.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `analysis_id` | INTEGER | FK → `log_analyses(id) ON DELETE CASCADE` |
| `source` | TEXT | `'acuity'` or `'zoho'` |
| `pattern_key` | TEXT | Normalized error type (variables replaced with `{var}`) |
| `sample_message` | TEXT | First example message (max 500 chars) |
| `count` | INTEGER | How many times this pattern appeared |
| `first_seen` | TEXT | Earliest occurrence |
| `last_seen` | TEXT | Latest occurrence |
| `severity` | TEXT | `'high'`, `'medium'`, or `'low'` |

**Index:** `analysis_id`

---

**`log_anomalies`** — Statistical anomaly spikes detected at parse time.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `analysis_id` | INTEGER | FK → `log_analyses(id) ON DELETE CASCADE` |
| `source` | TEXT | `'acuity'` or `'zoho'` |
| `description` | TEXT | Human-readable spike description |
| `severity` | TEXT | `'high'` (>3σ) or `'medium'` (>2σ) |
| `detected_at` | TEXT | Date of the spike |
| `error_count` | INTEGER | Actual error count on that day |
| `expected_count` | REAL | Mean daily error count for baseline |
| `deviation` | REAL | Number of standard deviations above mean |

**Index:** `analysis_id`

---

**`repo_radar_items`** — Repo Radar (Module 2): tracked GitHub repositories.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `owner` | TEXT | GitHub owner/org |
| `repo` | TEXT | Repository name |
| `full_name` | TEXT | `owner/repo`, unique |
| `description` | TEXT | GitHub repo description |
| `url` | TEXT | `https://github.com/{full_name}` |
| `language` | TEXT | Primary language (e.g. TypeScript, Python) |
| `stars` | INTEGER | Current star count |
| `stars_gained` | INTEGER | Stars since last refresh |
| `latest_release` | TEXT | Latest release tag name |
| `latest_release_url` | TEXT | URL to the release on GitHub |
| `latest_release_date` | TEXT | ISO 8601 release date |
| `latest_release_body` | TEXT | Full release body text |
| `breaking_changes` | TEXT | Detected breaking change description |
| `security_advisory` | TEXT | Detected security advisory description |
| `open_issues` | INTEGER | Total open issues |
| `open_prs` | INTEGER | Total open PRs |
| `prs_opened_7d` | INTEGER | PRs opened in last 7 days |
| `prs_merged_7d` | INTEGER | PRs merged in last 7 days |
| `issues_opened_7d` | INTEGER | Issues opened in last 7 days |
| `issue_spike` | INTEGER | `1` if issues >1.5x previous count |
| `last_activity_at` | TEXT | GitHub `pushed_at` timestamp |
| `notes` | TEXT | User notes |
| `is_active` | INTEGER | `1` active, `0` archived (default 1) |
| `last_refreshed_at` | TEXT | Last GitHub API refresh |
| `created_at` | TEXT | Defaults to `datetime('now')` |
| `updated_at` | TEXT | Defaults to `datetime('now')` |

**Seed data:** 14 repos on first migration (Next.js, Django, DRF, Celery, PostgreSQL, LangChain, OpenAI Python SDK, Anthropic SDK, shadcn/ui, Vercel AI SDK, Cal.com, Sentry, Supabase, OpenCode).

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
