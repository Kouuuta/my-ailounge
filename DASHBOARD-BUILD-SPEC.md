# Developer Dashboard — Build Spec

> Feed this document to your AI coding agent (opencode, Claude, etc.) as the primary
> instruction set for building the **Mind You Developer Dashboard**. It follows the module
> order and acceptance criteria defined in [`docs/guides/developer-dashboard.md`](./docs/guides/developer-dashboard.md),
> and reflects the codebase that already exists in this repo.

---

## 0. Context — What Already Exists

Do not rebuild these. Extend them.

| Already in repo                                                         | Path                                     | Status                                                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Supabase PostgreSQL schema (9 tables — migrated from SQLite in June 2026. DDL at `docs/supabase-schema.sql`) | `docs/supabase-schema.sql` (run in Supabase SQL editor), `src/db/schema.ts` (seed only) | ✅ Done |
| DB client (`supabase` singleton via `@supabase/supabase-js`, was `getDb()` for `better-sqlite3`) | `src/db/client.ts` (re-exports `supabase`) | ✅ Done                                                                                                              |
| Migration entry point                                                   | `src/db/migrate.ts`                      | ✅ Done                                                                                                              |
| Manual feeds ingester (parses `docs/feeds/*.md`, standalone only)       | `src/ingesters/manual-feeds/index.ts`    | ✅ Done (not part of orchestrator — run via `npm run ingest:manual`)                                                 |
| Hacker News ingester (HN Algolia API, top 20 stories)                   | `src/ingesters/hacker-news/index.ts`     | ✅ Done                                                                                                              |
| GitHub Trending ingester (fetches RSS directly, 3 feeds: daily/weekly/monthly) | `src/ingesters/github-trending/index.ts` | ✅ Done (no longer reads `ideas/trending.md`)                                                                  |
| RSS ingester (20 feeds across 9 categories, regex parser)               | `src/ingesters/rss/index.ts`             | ✅ Done                                                                                                              |
| Orchestrator (runs 4 ingesters, kv_store tracking, exports `runAll()`)  | `src/ingesters/run-all.ts`               | ✅ Done                                                                                                              |
| GitHub Trending scraper (legacy, writes to Slack — `ideas/trending.md` removed) | `src/scraper.py`                 | Legacy — GitHub Trending ingester now fetches RSS directly, no longer reads `ideas/trending.md`                     |
| Feed format/tagging rules                                               | `docs/feeds/feeds-format-guide.md`       | ✅ Done                                                                                                              |
| Intern task seed data (13 tasks)                                        | `src/config/intern-tasks.ts`             | ✅ Done                                                                                                              |
| Shared utilities (DB writes, markdown append, analytics queries)        | `src/lib/`                               | ✅ Done                                                                                                              |
| Dashboard widgets (AutomationStatus, BreakdownCard, IngestButton, StatCard) | `components/engineering-intelligence/` | ✅ Done                                                                                                              |
| shadcn/ui primitives (11 components)                                    | `components/ui/`                         | ✅ Done                                                                                                              |
| Dark/light theme provider                                               | `components/theme-provider.tsx`          | ✅ Done                                                                                                              |
| Navbar with active route + theme toggle                                 | `components/ui/navbar.tsx`               | ✅ Done                                                                                                              |
| Page README docs (app/, src/, components/)                              | `*/README.md`                            | ✅ Done                                                                                                              |
| Agent steerer files (OpenCode + Claude)                                 | `AGENTS.md`, `CLAUDE.md`                 | ✅ Done                                                                                                              |
| Documentation hub                                                       | `docs/README.md`                         | ✅ Done                                                                                                              |
| Log Analysis Dashboard (upload + explore Zoho/Acuity CSV logs)          | `app/logs/page.tsx`                      | ✅ Done                                                                                                              |
| Log Analysis API (5 routes: upload, list, detail, errors, patterns, anomalies) | `app/api/logs/`                    | ✅ Done                                                                                                              |
| Log parser (column detection, error extraction, pattern grouping, anomaly detection) | `src/lib/log-parser.ts`          | ✅ Done                                                                                                              |
| Log analysis DB tables (4: `log_analyses`, `log_errors`, `log_patterns`, `log_anomalies`) | `src/db/schema.ts`            | ✅ Done                                                                                                              |
| Log dashboard components (CsvUpload, OverviewCards, ErrorTrendChart, SourceBreakdown) | `components/logs/`              | ✅ Done                                                                                                              |
| Nivo charting packages (`@nivo/bar`, `@nivo/pie`, `@nivo/core`)         | `package.json`                           | ✅ Done                                                                                                              |
| On-demand ingestion endpoint (`POST /api/ingest` calls `runAll()`)      | `app/api/ingest/route.ts`                | ✅ Done                                                                                                              |
| Ingest button with sonner toast notifications                           | `components/engineering-intelligence/ingest-button.tsx` | ✅ Done                                                                                              |
| Unified StatCard component (replaces LastIngestionStat + TimeWindowStat) | `components/engineering-intelligence/stat-card.tsx` | ✅ Done                                                                                                  |
| Repo Radar page (card grid, add/delete/refresh, notes, confirm dialog)   | `app/repo-radar/page.tsx`                | ✅ Done                                                                                                              |
| Repo Radar API (3 routes: GET/POST list+add, PATCH/DELETE by id, POST refresh) | `app/api/repo-radar/`             | ✅ Done                                                                                                              |
| Repo Radar GitHub API client & refresh logic                             | `src/lib/repo-radar.ts`                  | ✅ Done                                                                                                              |
| Repo Radar ingester (scheduled refresh via orchestrator)                 | `src/ingesters/repo-radar/index.ts`      | ✅ Done                                                                                                              |
| Repo Radar seed data (14 repos)                                          | `src/config/repo-radar-seed.ts`          | ✅ Done                                                                                                              |
| `repo_radar_items` table (27 columns) + Navbar "Radar" link              | `src/db/schema.ts`, `components/ui/navbar.tsx` | ✅ Done                                                                                                         |
| GitHub Actions daily ingestion workflow                                 | `.github/workflows/ingest.yml`           | Exists, unused for now — ingestion is manual via `npm run ingest` (Section 6); cron automation deferred (Appendix A) |

**Stack:**

- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Radix UI, Nivo (bar + pie charts), sonner (toast)
- Data: **Supabase PostgreSQL** via `@supabase/supabase-js` — 9 tables. Originally SQLite via `better-sqlite3` (file at `data/dashboard.db`); migrated June 2026.
- Ingestion: TypeScript ingesters (`src/ingesters/*`) + one legacy Python scraper (`src/scraper.py`)
- Backend "API": Next.js Route Handlers (`app/api/**/route.ts`) reading/writing Supabase directly via `supabase.from()` —
  no separate server process required for MVP. Python is used for ingestion scripts only
  (scraping, RSS parsing, HN API calls), invoked via scheduled jobs, not as a running web server.

---

## 1. Build Order

Follow this order. Each module is shippable on its own — don't try to build everything before
shipping Module 1.

> ✅ **Modules 1, 2, 3, 5, and 8 are already built.** See status badges below for what's
> implemented vs planned. The remaining work is Module 7.

| Module                                     | Status                                |
| ------------------------------------------ | ------------------------------------- |
| **Module 1 — Developer Intelligence Feed** | ✅ Built                              |
| **Module 5 — Engineering Briefing**        | ✅ Built                              |
| **Module 3 — Stack Watchlist**             | ✅ Built                              |
| **Module 8 — Intern Safe Task Board**      | ✅ Built (seed data + UI on homepage) |
| **Log Analysis Dashboard**                 | ✅ Built (upload + parse + chart Zoho/Acuity CSV logs) |
| **Module 2 — Repo Radar**                  | ✅ Built (card grid, GitHub API, release/PR/issue tracking, breaking/security detection) |
| **Module 7 — Prompt Library**              | ✅ Built (prompts table, page with search/filter/add/copy, 4 API routes, ingester with 3 sources, FeaturedPrompt widget) |

---

## 2. Module 1 — Developer Intelligence Feed (Primary Target)

> ✅ **Already built.** Full feed page at `/feed` with filter/search/pin/read/delete/add and
> pagination. See `app/feed/README.md` and `app/api/feed/README.md` for details.

### 2.1 What was built

A single page (`/feed`) showing all `feed_items`, filterable by source/category/tag,
with full-text search, manual curation (add/remove/pin), read tracking, and de-duplication.

### 2.2 Data layer

The schema is defined in `docs/supabase-schema.sql` (PostgreSQL DDL — run once in Supabase SQL editor). Seed data is inserted via `npm run db:migrate` (`src/db/migrate.ts`). The original SQLite DDL and `src/db/schema.ts` migration were replaced during the June 2026 Supabase migration.

Original SQLite schema for reference (now in PostgreSQL):

```sql
feed_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source       TEXT NOT NULL,     -- 'github_trending' | 'hn' | 'rss' | 'arxiv' | 'manual'
  category     TEXT NOT NULL DEFAULT 'general',
  external_id  TEXT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  summary      TEXT,
  tags         TEXT,
  score        INTEGER,
  published_at TEXT,
  fetched_at   TEXT DEFAULT (datetime('now')),
  is_pinned    INTEGER DEFAULT 0,
  is_read      INTEGER DEFAULT 0,
  UNIQUE (source, url)
)
```

### 2.3 API routes (`app/api/feed/`) — ✅ All built

| Route                        | Method   | Status  | Purpose                                                                                                                                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/feed/route.ts`      | `GET`    | ✅ Done | List feed items. Query params: `source`, `category`, `tag`, `q`, `is_read`, `is_pinned`, `limit`, `offset` — ordered by `is_pinned DESC, published_at DESC, fetched_at DESC` |
| `app/api/feed/route.ts`      | `POST`   | ✅ Done | Manually add a custom entry (`source: 'manual'`)                                                                                                                             |
| `app/api/feed/[id]/route.ts` | `PATCH`  | ✅ Done | Update fields: `title`, `summary`, `tags`, `category`, `score`, `is_read`, `is_pinned`                                                                                       |
| `app/api/feed/[id]/route.ts` | `DELETE` | ✅ Done | Remove an entry                                                                                                                                                              |
| `app/api/ingest/route.ts`    | `POST`   | ✅ Done | Trigger on-demand ingestion, calls `runAll({ closeDb: false })`, returns `{ results, allOk }` JSON                                                                           |

Full-text search uses `WHERE title LIKE @q` with `%` wildcards — meets <200ms on current data volume.

### 2.4 UI components (shadcn/ui) — ✅ All built

- **Filter bar**: source/category/status/pinned selects, search input, clear + refresh buttons.
- **Feed list**: `Card` per item — source badge (color-coded), category badge, published date,
  score, tags, title (links out), pin/read/delete action buttons (lucide-react icons).
- **"New since last visit"** banner — compares `fetched_at` against `localStorage` timestamp,
  shows count of new items.
- **Add Item form** — toggle-able form with title/URL/category/tags, posts to `POST /api/feed`.
- **Pagination** — "Load more" button (50 items at a time).
- **Loading states** — `CardSkeleton` placeholders during fetch.
- **Empty/error states** — messages for no results, filter mismatch, or fetch failure.

### 2.5 Acceptance criteria (from developer-dashboard.md) — ✅ All met

- [x] All sources (manual, HN, GitHub Trending, RSS) visible in one filterable view
- [x] Manual add / remove / pin persists across reloads
- [x] Ingestion runs on demand via `npm run ingest` (see Section 6)
- [x] No duplicate rows per `(source, url)` — enforced by the existing `UNIQUE` constraint
- [x] Full-text title search returns matches under 200ms on a typical day's volume

---

## 3. Module 5 — Engineering Briefing (Homepage)

> ✅ **Already built.** Server Component at `app/page.tsx` with 5 feed sections, stat cards,
> breakdown chart, intern tasks, and automation status. See `app/README.md` for details.

A generated daily summary, built as a query/aggregation over `feed_items` — not a separate data source.

### 3.1 Sections (in order)

1. **Important AI changes** — top N items where `category = 'ai'`, ordered by `score` desc / most recent
2. **Relevant framework updates** — `category IN ('nextjs', 'django')`
3. **Trending repos worth checking** — `source = 'github_trending'`, most recent batch
4. **Security items** — `category = 'security'` or `tags LIKE '%cve%'`
5. **One recommended tool/repo** — highest-scoring unread item from Repo Radar / AI Tooling Tracker (Module 4) — if Module 4 isn't built yet, pull from `feed_items` tagged `ai` + `tools`
6. **One intern learning task** — pulled from Module 8's task list once it exists; until then, hardcode a small rotating list of 3–5 starter tasks in a config file (`src/config/intern-tasks.ts`)

### 3.2 Implementation notes

- Build as a Server Component (`app/page.tsx`) that queries Supabase PostgreSQL directly at request time
  (migrated from SQLite in June 2026) — no need for a separate "generation" job. "Daily generated" just means
  the data refreshes whenever the ingesters run (Section 6); the page itself can render live on each request.
- If page load becomes slow as `feed_items` grows, add a `dashboard_summary` cache table
  refreshed by the ingestion job — but don't pre-build this; only add it if you measure a
  real slowdown.

---

## 4. Module 3 — Stack Watchlist

> ✅ **Already built.** Full page at `/watchlist` with sortable table, inline editing, risk
> levels, and CRUD API. See `app/watchlist/README.md` for details.

### 4.1 Data model

New table, `watchlist_items`:

```sql
CREATE TABLE IF NOT EXISTS watchlist_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL UNIQUE,   -- 'Next.js', 'Django', 'PostgreSQL', etc.
  category          TEXT,                    -- 'framework' | 'database' | 'infra' | 'ai-sdk'
  installed_version TEXT,
  latest_version    TEXT,
  risk_level        TEXT DEFAULT 'low',      -- 'low' | 'medium' | 'high'
  upgrade_notes     TEXT,
  known_vulns       TEXT,                    -- JSON array of CVE ids/links
  migration_link    TEXT,
  updated_at        TEXT DEFAULT (datetime('now'))
);
```

### 4.2 Seed data

Seed with the team's real stack (from `docs/guides/developer-dashboard.md` Module 3): Next.js, Django,
DRF, PostgreSQL, Docker, AWS, Celery, Redis, GitHub Actions, Sentry, OpenAI/Anthropic/DeepSeek SDKs.

### 4.3 UI

A `DataTable` (shadcn/ui) with columns: Name, Installed, Latest, Risk (colored badge), Notes,
Last Updated. Risk badge color: green=low, yellow=medium, red=high.

### 4.4 "Latest version" lookups

Manual entry for MVP. Future automation: npm registry API (`https://registry.npmjs.org/<pkg>/latest`),
PyPI JSON API (`https://pypi.org/pypi/<pkg>/json`) — both are simple unauthenticated GETs and
fit naturally as a scheduled job (see Section 6).

---

---

## 6. Ingestion — Manual for Now (`npm run ingest`)

> Cron/scheduled automation is **deferred** — see [Appendix A](#appendix-a-deferred-cron-automation-options)
> for the options that were explored (Render, Vercel Cron, etc.). For now, ingestion runs
> **on-demand** via a single npm script. You run it whenever you want fresh data; the dashboard
> reads from Supabase PostgreSQL (migrated from local SQLite `data/dashboard.db` in June 2026).

### 6.1 What was built

A single entry point that runs all 3 ingesters sequentially (hn, github_trending, rss), with status tracking in `kv_store`:

- **File:** `src/ingesters/run-all.ts`
- **Script:** `npm run ingest` (maps to `npx tsx src/ingesters/run-all.ts`)
- **API:** `POST /api/ingest` calls `runAll()` remotely

**Exports `runAll()`** — accepts `{ closeDb?: boolean }` option. Used by both the CLI and `POST /api/ingest`.

**How it works:**

The orchestrator runs each ingester one at a time and records:

| kv_store key namespace       | Example                | Purpose                           |
| ---------------------------- | ---------------------- | --------------------------------- |
| `ingest:last_run:<source>`   | `ingest:last_run:hn`   | ISO 8601 timestamp of last run    |
| `ingest:status:<source>`     | `ingest:status:hn`     | `'ok'` or `'error'`               |
| `ingest:count:<source>`      | `ingest:count:hn`      | Number of new items from last run |
| `ingest:elapsed_ms:<source>` | `ingest:elapsed_ms:hn` | Execution time in ms              |
| `ingest:status:all`          | `ingest:status:all`    | `'ok'` or `'degraded'`            |

After all ingesters finish, it prints a summary table showing each source's status, count, and duration. This `kv_store` data is consumed by the `AutomationStatus` and `StatCard` dashboard widgets.

Each ingester writes data to **both** SQLite (via `lib/db.upsertEntry`) and markdown (via `lib/markdown.appendToFeed`). The `UNIQUE (source, url)` constraint prevents duplicates on repeated runs.

> Note: `manual-feeds/` ingester is no longer part of the orchestrator. Run it standalone via `npm run ingest:manual`.

### 6.2 Workflow while developing

1. Make changes to an ingester (e.g. tweak `src/ingesters/hacker-news/index.ts`).
2. Run `npm run ingest` to populate/update Supabase PostgreSQL (was `data/dashboard.db` before the June 2026 migration).
3. Refresh the dashboard (`/feed`, `/`) to see the new data.
4. Re-run `npm run ingest` any time you want to pull fresh data — safe to run repeatedly,
   duplicates are skipped via the `UNIQUE (source, url)` constraint.

### 6.3 RSS feed config

RSS feed URLs are defined in `src/ingesters/rss/feeds.ts` — 20 feeds across 9 categories
(AI, Next.js, Django, Security, Cloud, WordPress, Docker, DevOps, GitHub). Each entry specifies `url`, `category`, and
the markdown feed file to append to. To add a new feed, add an entry to this array.

### 6.4 Acceptance criteria (all ✅ met)

- [x] `npm run ingest` runs all three ingesters (HN, GitHub Trending, RSS) and exits cleanly
- [x] Each ingester logs an inserted/skipped summary
- [x] Re-running `npm run ingest` does not create duplicate rows (`UNIQUE (source, url)` enforced)
- [x] All sources visible in one filterable `/feed` view after running the script
- [x] Full-text title search returns matches under 200ms on a typical day's volume

> Note: the original `developer-dashboard.md` acceptance criterion "Scheduled ingestion runs
> without manual steps" is intentionally **not** in scope right now. Revisit once an automation
> option from Appendix A is chosen.

### 6.5 Legacy `src/scraper.py`

The Python scraper (`src/scraper.py`) previously wrote GitHub Trending results to `ideas/trending.md` + Slack.
The `ideas/trending.md` file has been removed — the TypeScript GitHub Trending ingester now fetches
RSS directly (3 feeds: daily, weekly, monthly) and no longer depends on the scraper output.
The scraper still exists for Slack notifications but is separate from the dashboard data pipeline.

---

## 7. Current File Structure (actual)

```
app/          → app/README.md        # 6 pages (/, /feed, /watchlist, /logs, /repo-radar, /prompts) + 10 API route groups (feed, watchlist, logs, ingest, repo-radar, stats, prompts)
components/   → components/README.md # 10 shadcn/ui primitives + 7 briefing components + 2 prompt components + 4 dashboard widgets + 4 log components + sidebar + theme
src/          → src/README.md        # 6 ingesters (4 in orchestrator + 1 standalone repo-radar + 1 standalone prompts) + DB (9 tables) + analytics + log-parser + repo-radar
  ├── db/     → src/db/README.md
  ├── ingesters/ → src/ingesters/README.md
  ├── lib/    → src/lib/README.md
  └── config/ → src/config/README.md
lib/          → cn() utility (clsx + twMerge) — for UI only
scripts/      → clean-feed-files.ts, _check-db.ts
data/         → dashboard.db (gitignored — legacy SQLite file, no longer used)
docs/         → docs/README.md       # Onboarding, plans, research, feeds, audits
```

---

## 8. What's Left to Build

> Steps 1–18 below are **already complete**. The remaining work is Module 7 (Prompt Library).

### ✅ Already Built (MVP complete)

| Step | What                                                      | Status |
| ---- | --------------------------------------------------------- | ------ |
| 1    | Schema: `feed_items`, `kv_store`, `watchlist_items`       | ✅     |
| 2    | Feed API: GET (filters + pagination), POST, PATCH, DELETE | ✅     |
| 3    | `/feed` page with filter bar, search, pin/read/delete/add | ✅     |
| 4    | All 3 ingesters: HN, GitHub Trending, RSS (manual standalone) | ✅     |
| 5    | `run-all.ts` orchestrator (exports `runAll()`) + `npm run ingest` | ✅     |
| 6    | Confirmed `/feed` shows data from all sources             | ✅     |
| 7    | Engineering Briefing homepage (5 sections + stats)        | ✅     |
| 8    | Stack Watchlist (/watchlist) with inline editing          | ✅     |
| 9    | Page READMEs for app/, src/, components/                  | ✅     |
| 10   | AGENTS.md + CLAUDE.md steerer files                       | ✅     |
| 11   | Log Analysis Dashboard: upload, parse, chart CSV logs     | ✅     |
| 12   | Log Analysis API: 5 routes (upload, list, detail, errors, patterns, anomalies) | ✅     |
| 13   | Log parser: column detection, pattern grouping, anomaly detection | ✅     |
| 14   | Log DB tables: `log_analyses`, `log_errors`, `log_patterns`, `log_anomalies` | ✅     |
| 15   | Log dashboard components: CsvUpload, OverviewCards, ErrorTrendChart, SourceBreakdown | ✅     |
| 16   | Logs README docs: app/logs/, app/api/logs/, components/logs/ | ✅     |
| 17   | On-demand ingestion button + API (`POST /api/ingest`)    | ✅     |
| 18   | Repo Radar: page + API + GitHub client + ingester + seed data | ✅     |
| 19   | Repo Radar README docs: app/repo-radar/, app/api/repo-radar/ | ✅     |
| 20   | Sidebar with branding, nav, quick stats, theme toggle    | ✅     |
| 21   | Briefing components (6): StatCard, FeedSection, FeaturedNews, FeedBreakdown, InternTasks, AutomationStatus | ✅     |
| 22   | Stats API (`GET /api/stats`) consumed by sidebar         | ✅     |
| 23   | Theme revamp: dark palette, accent colors, dot grid bg, 3 font variables | ✅     |
| 24   | Briefing/Sidebar/Stats README docs                       | ✅     |
| 25   | Prompt Library: prompts table + seed data (13 prompts)   | ✅     |
| 26   | Prompt Library page: search, filter, add, expand, copy   | ✅     |
| 27   | Prompt Library API: 4 route groups (list+create, featured, CRUD, use count) | ✅     |
| 28   | Prompt Library components: PromptCard + CategoryFilter (9 categories) | ✅     |
| 29   | Prompt ingester: curated extras (14) + UI design (40) + community (up to 200) | ✅     |
| 30   | FeaturedPrompt widget on homepage + sidebar "Prompts" nav link | ✅     |
| 31   | Prompt Library README docs: page, API, components        | ✅     |

### ✅ All Modules Complete

**Modules 1, 2, 3, 5, 7, and 8 are all built.** The MVP is complete.

### Bonus — Scheduled Ingestion (not yet implemented)

> **Status: deferred.** The dashboard currently uses manual ingestion (`npm run ingest`, see
> Section 6). The notes below were explored for automating ingestion on a schedule, but are
> parked until a clearly free/low-friction option is settled on. Kept here for reference when
> automation is picked back up — none of this needs to be built right now.

### A.1 Option A — Next.js API route + external cron pinger (lowest effort)

Create `app/api/cron/ingest/route.ts` that runs all ingesters via `Promise.allSettled(...)`,
protected by a `Bearer ${process.env.CRON_SECRET}` auth check. Then have something call it
daily. Free/cheap options:

- **cron-job.org** — schedule an HTTP GET to your deployed URL (free, no account needed)
- **Vercel Cron Jobs** — add `vercel.json` with `"crons": [{ "path": "/api/cron/ingest", "schedule": "0 0 * * *" }]`
- **Uptime monitoring** — UptimeRobot / Healthchecks.io repurposed as daily pingers

### A.3 Option B — Self-hosted: system cron + a small Python/Node script

If the dashboard runs on a VPS or your own machine/server (not a serverless platform), skip
HTTP entirely and run the ingesters as a scheduled OS process:

```bash
# crontab -e
0 0 * * * cd /path/to/dashboard && npx tsx src/ingesters/run-all.ts >> /var/log/ingest.log 2>&1
```

(`src/ingesters/run-all.ts` already exists and does this — see Section 6.1). This keeps "run
everything" logic in one place regardless of how it's triggered.

### A.4 Option C — Database-triggered / on-demand (no schedule at all)

For low-traffic internal tools, "daily" freshness is often good enough achieved lazily:

- Store `last_ingested_at` in the `kv_store` table (see Section 2.4).
- On each dashboard page load (Server Component), check if `last_ingested_at` is >24h old.
- If so, kick off ingestion in the background (`after()` in Next.js, or a fire-and-forget
  `fetch` to the cron route) and update `last_ingested_at` immediately to avoid duplicate
  triggers from concurrent requests.

Trade-off: the _first_ visitor of the day gets slightly stale data (and triggers the refresh
for everyone after). Fine for an internal tool with a handful of users; not fine if you need
guaranteed freshness regardless of traffic.

### A.5 Recommendation (when revisiting this)

The free options are: GitHub Actions on a public repo (already set up, see
`.github/workflows/ingest.yml`), Vercel Cron on a free Hobby deployment (A.1), or cron-job.org
pinging a free-tier endpoint (A.1). Render's Cron Job (A.2) is a paid service type — keep it in
mind if budget isn't a constraint later, but it's not the first thing to try given the "find a
free way" goal.

All 4 ingesters are implemented. Next step: keep `.github/workflows/ingest.yml` as-is and
simply point it at `npm run ingest` instead of the per-ingester steps it currently has.
That gets scheduling back without inventing a new platform.
