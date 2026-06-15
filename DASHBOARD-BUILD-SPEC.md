# Developer Dashboard — Build Spec

> Feed this document to your AI coding agent (opencode, Claude, etc.) as the primary
> instruction set for building the **Mind You Developer Dashboard**. It follows the module
> order and acceptance criteria defined in [`docs/developer-dashboard.md`](./docs/developer-dashboard.md),
> and reflects the codebase that already exists in this repo.

---

## 0. Context — What Already Exists

Do not rebuild these. Extend them.

| Already in repo | Path | Status |
|---|---|---|
| SQLite schema (`feed_items` table) | `src/db/schema.ts` | Done |
| DB client (better-sqlite3 singleton) | `src/db/client.ts` | Done |
| Manual feeds ingester (parses `docs/feeds/*.md`) | `src/ingesters/manual-feeds/index.ts` | Done |
| Hacker News ingester | `src/ingesters/hacker-news/index.ts` | Stub (TODO) |
| GitHub Trending ingester | `src/ingesters/github-trending/index.ts` | Stub (TODO) |
| RSS ingester | `src/ingesters/rss/index.ts` | Stub (TODO) |
| GitHub Trending scraper (legacy, writes to `ideas/trending.md` + Slack) | `src/scraper.py` | Working, but writes to markdown not SQLite |
| Feed format/tagging rules | `docs/feeds/feeds-format-guide.md` | Done |
| GitHub Actions daily ingestion workflow | `.github/workflows/ingest.yml` | Exists, unused for now — ingestion is manual via `npm run ingest` (Section 6); cron automation deferred (Appendix A) |

**Stack:**

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Data: SQLite via `better-sqlite3` (file at `data/dashboard.db`)
- Ingestion: TypeScript ingesters (`src/ingesters/*`) + one legacy Python scraper (`src/scraper.py`)
- Backend "API": Next.js Route Handlers (`app/api/**/route.ts`) reading/writing SQLite directly —
  no separate server process required for MVP. Python is used for ingestion scripts only
  (scraping, RSS parsing, HN API calls), invoked via scheduled jobs, not as a running web server.

---

## 1. Build Order

Follow this order. Each module is shippable on its own — don't try to build everything before
shipping Module 1.

1. **Module 1 — Developer Intelligence Feed** (the data layer + first UI — build this first)
2. **Module 5 — Engineering Briefing homepage** (a generated view on top of Module 1's data)
3. **Module 3 — Stack Watchlist**
4. **Module 2 — Repo Radar**
5. **Module 7 — Prompt Library**
6. **Module 8 — Intern Safe Task Board**

> Note: `developer-dashboard.md` lists the Engineering Briefing (Module 5) first in its "Build
> order" section, but Module 5 is *generated from* Module 1's data — so Module 1 must exist
> first even though it's numbered higher. Build Module 1's data layer and at least a basic feed
> list view before starting Module 5.

---

## 2. Module 1 — Developer Intelligence Feed (Primary Target)

### 2.1 What to build

A single page (`/feed` or dashboard home) showing all `feed_items`, filterable by source/category/tag,
with full-text search, manual curation (add/remove/pin), read tracking, and de-duplication.

### 2.2 Data layer

The schema already exists (`src/db/schema.ts`). Confirm it matches:

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

Run `npx ts-node src/db/migrate.ts` to apply.

### 2.3 API routes to build (`app/api/feed/`)

| Route | Method | Purpose |
|---|---|---|
| `app/api/feed/route.ts` | `GET` | List feed items. Query params: `source`, `category`, `tag`, `q` (full-text search on `title`), `is_read`, `is_pinned`, `limit`, `offset` |
| `app/api/feed/route.ts` | `POST` | Manually add a custom entry (`source: 'manual'`) |
| `app/api/feed/[id]/route.ts` | `PATCH` | Toggle `is_read` / `is_pinned`, or edit title/tags |
| `app/api/feed/[id]/route.ts` | `DELETE` | Remove an entry |

For full-text search, start with `WHERE title LIKE '%' || ? || '%'` — acceptance criteria
requires <200ms which plain `LIKE` over a few thousand rows will satisfy. Only reach for
SQLite FTS5 virtual tables if the dataset grows large enough that `LIKE` becomes slow.

### 2.4 UI components (shadcn/ui)

- **Filter bar**: source/category/tag pills (use `Badge` + `Toggle`), search input (`Input`),
  read/unread toggle.
- **Feed list**: `Card` per item — title (links out), source badge, tags, published date,
  pin/read controls (`Button` with `lucide-react` icons: `Pin`, `Check`, `Trash2`).
- **"New since last visit"** banner — compare `fetched_at` against a `last_visited_at` value
  stored in `localStorage` (client-only, single-user MVP) or a `dashboard_meta` key-value table
  (multi-user-ready). Recommend the table approach now since Module 6 (per-user state) is
  planned later — adding a generic `kv_store(key TEXT PRIMARY KEY, value TEXT)` table now
  avoids a migration later.

### 2.5 Acceptance criteria (from developer-dashboard.md — keep these as your Definition of Done)

- [ ] All sources (manual, HN, GitHub Trending, RSS) visible in one filterable view
- [ ] Manual add / remove / pin persists across reloads
- [ ] Ingestion runs on demand via `npm run ingest` (see Section 6)
- [ ] No duplicate rows per `(source, url)` — enforced by the existing `UNIQUE` constraint
- [ ] Full-text title search returns matches under 200ms on a typical day's volume

---

## 3. Module 5 — Engineering Briefing (Homepage)

A generated daily summary, built as a query/aggregation over `feed_items` — not a separate data source.

### 3.1 Sections (in order)

1. **Important AI changes** — top N items where `category = 'ai'`, ordered by `score` desc / most recent
2. **Relevant framework updates** — `category IN ('nextjs', 'django')`
3. **Trending repos worth checking** — `source = 'github_trending'`, most recent batch
4. **Security items** — `category = 'security'` or `tags LIKE '%cve%'`
5. **One recommended tool/repo** — highest-scoring unread item from Repo Radar / AI Tooling Tracker (Module 4) — if Module 4 isn't built yet, pull from `feed_items` tagged `ai` + `tools`
6. **One intern learning task** — pulled from Module 8's task list once it exists; until then, hardcode a small rotating list of 3–5 starter tasks in a config file (`src/config/intern-tasks.ts`)

### 3.2 Implementation notes

- Build as a Server Component (`app/page.tsx`) that queries SQLite directly at request time —
  no need for a separate "generation" job. "Daily generated" just means the data refreshes
  whenever the ingesters run (Section 6); the page itself can render live on each request.
- If page load becomes slow as `feed_items` grows, add a `dashboard_summary` cache table
  refreshed by the ingestion job — but don't pre-build this; only add it if you measure a
  real slowdown.

---

## 4. Module 3 — Stack Watchlist

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

Seed with the team's real stack (from `docs/developer-dashboard.md` Module 3): Next.js, Django,
DRF, PostgreSQL, Docker, AWS, Celery, Redis, GitHub Actions, Sentry, OpenAI/Anthropic/DeepSeek SDKs.

### 4.3 UI

A `DataTable` (shadcn/ui) with columns: Name, Installed, Latest, Risk (colored badge), Notes,
Last Updated. Risk badge color: green=low, yellow=medium, red=high.

### 4.4 "Latest version" lookups

Manual entry for MVP. Future automation: npm registry API (`https://registry.npmjs.org/<pkg>/latest`),
PyPI JSON API (`https://pypi.org/pypi/<pkg>/json`) — both are simple unauthenticated GETs and
fit naturally as a scheduled job (see Section 6).

---

## 5. Module 2 — Repo Radar

### 5.1 Data model

```sql
CREATE TABLE IF NOT EXISTS watched_repos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  owner           TEXT NOT NULL,
  repo            TEXT NOT NULL,
  latest_release  TEXT,
  stars           INTEGER,
  open_issues     INTEGER,
  last_checked_at TEXT,
  UNIQUE (owner, repo)
);
```

Seed list from `developer-dashboard.md`: Next.js, Django, DRF, Celery, PostgreSQL, LangChain,
OpenAI SDK, Anthropic SDK, shadcn/ui, Vercel AI SDK, Cal.com, Sentry, Supabase, OpenCode.

### 5.2 Data source

GitHub REST API (`GET /repos/{owner}/{repo}` and `/releases/latest`) — unauthenticated rate
limit is 60 req/hour, which is enough for ~14 repos checked once or twice daily. If you add an
auth token (`GITHUB_TOKEN`), the limit jumps to 5,000 req/hour.

### 5.3 UI

Card grid or table: repo name (linked), stars, latest release tag + date, open issue count,
last-checked timestamp. Highlight repos with a release newer than 7 days.

---

## 6. Ingestion — Manual for Now (`npm run ingest`)

> Cron/scheduled automation is **deferred** — see [Appendix A](#appendix-a-deferred-cron-automation-options)
> for the options that were explored (Render, Vercel Cron, etc.). For now, ingestion runs
> **on-demand** via a single npm script. You run it whenever you want fresh data; the dashboard
> just reads whatever is currently in `data/dashboard.db`.

### 6.1 What to build

A single entry point that runs all ingesters sequentially, wired up as an npm script:

```ts
// src/ingesters/run-all.ts
import { ingestHackerNews } from "./hacker-news";
import { ingestGithubTrending } from "./github-trending";
import { ingestRss } from "./rss";
import { ingestManualFeeds } from "./manual-feeds";

async function runAll() {
  console.log("Starting ingestion run...\n");

  const results = await Promise.allSettled([
    ingestManualFeeds(),
    ingestHackerNews(),
    ingestGithubTrending(),
    ingestRss([/* feed configs — see 6.3 */]),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Ingester ${i} failed:`, result.reason);
    }
  });

  console.log("\nIngestion run complete.");
}

runAll().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
```

Add to `package.json`:

```json
{
  "scripts": {
    "ingest": "ts-node src/ingesters/run-all.ts"
  }
}
```

Run it with:

```bash
npm run ingest
```

This fetches everything, writes/upserts into `feed_items` (the existing `UNIQUE (source, url)`
constraint prevents duplicates on repeated runs), and the dashboard picks up the new rows on
next page load/refresh — no restart needed since it's reading SQLite directly.

### 6.2 Workflow while developing

1. Make changes to an ingester (e.g. implement `src/ingesters/hacker-news/index.ts`).
2. Run `npm run ingest` to populate/update `data/dashboard.db`.
3. Refresh the dashboard (`/feed`, `/`) to see the new data.
4. Re-run `npm run ingest` any time you want to pull fresh data — safe to run repeatedly,
   duplicates are skipped via the `UNIQUE (source, url)` constraint.

### 6.3 RSS feed config

`ingestRss` takes a list of `{ url, category }`. Hardcode a starter list in
`src/config/rss-feeds.ts` for now (e.g. a couple of Next.js/Django/AI blogs) — this can be
moved to a DB table or admin UI later, but isn't needed for the manual-trigger MVP.

### 6.4 Acceptance criteria (revised — no scheduling requirement for now)

- [ ] `npm run ingest` runs all four ingesters (manual feeds, HN, GitHub Trending, RSS) and exits cleanly
- [ ] Each ingester logs an inserted/skipped summary (the manual-feeds ingester already does this)
- [ ] Re-running `npm run ingest` does not create duplicate rows (`UNIQUE (source, url)` enforced)
- [ ] All sources visible in one filterable `/feed` view after running the script
- [ ] Full-text title search returns matches under 200ms on a typical day's volume

> Note: the original `developer-dashboard.md` acceptance criterion "Scheduled ingestion runs
> without manual steps" is intentionally **not** in scope right now. Revisit once an automation
> option from Appendix A is chosen.

### 6.5 Migrating `src/scraper.py`

The existing Python scraper writes GitHub Trending results to `ideas/trending.md` + Slack —
keep this working as-is for now (it's a separate concern: a Slack notification, not the
dashboard's data source). The new `src/ingesters/github-trending/index.ts` (TypeScript) should
write to SQLite independently, and gets called by `npm run ingest`. Don't try to merge these
into one script; let them run as two separate steps with different outputs (Slack notification
vs. dashboard data).

---

## 7. Suggested File Structure (additions only)

```
app/
├── page.tsx                      # Module 5: Engineering Briefing homepage
├── feed/
│   └── page.tsx                  # Module 1: Developer Intelligence Feed
├── watchlist/
│   └── page.tsx                  # Module 3: Stack Watchlist
├── repos/
│   └── page.tsx                  # Module 2: Repo Radar
├── prompts/
│   └── page.tsx                  # Module 7: Prompt Library
├── tasks/
│   └── page.tsx                  # Module 8: Intern Task Board
└── api/
    ├── feed/
    │   ├── route.ts
    │   └── [id]/route.ts
    ├── watchlist/route.ts
    └── repos/route.ts

src/
├── db/
│   ├── client.ts                 # existing
│   ├── schema.ts                 # existing — add watchlist_items, watched_repos, kv_store
│   └── migrate.ts                # existing
├── ingesters/
│   ├── manual-feeds/index.ts     # existing
│   ├── hacker-news/index.ts      # implement
│   ├── github-trending/index.ts  # implement
│   ├── rss/index.ts               # implement
│   └── run-all.ts                # new — entry point for `npm run ingest`, see Section 6
└── config/
    ├── intern-tasks.ts            # new — Module 5 fallback content
    └── rss-feeds.ts               # new — Section 6.3, RSS source list
```

---

## 8. Suggested Build Sequence for Your AI Agent

When handing this to opencode/Claude, work in this order to keep each step independently testable:

1. Confirm/extend `src/db/schema.ts` with `watchlist_items`, `watched_repos`, `kv_store`. Run migration.
2. Implement `app/api/feed/route.ts` (GET + POST) and `[id]/route.ts` (PATCH + DELETE).
3. Build `/feed` page with filter bar + list, wired to the API.
4. Implement the three stub ingesters (`hacker-news`, `github-trending`, `rss`).
5. Create `src/ingesters/run-all.ts` and add the `npm run ingest` script (Section 6).
6. Run `npm run ingest` and confirm `/feed` shows data from all sources.
7. Build `/` (Engineering Briefing) as a Server Component querying `feed_items`.
8. Build `/watchlist` and `/repos` (Modules 3 & 2) — seed data, simple tables.
9. Modules 7 & 8 (Prompt Library, Intern Task Board) — lower priority, build last.

Ship after step 6 — that's a working Module 1 with manual ingestion via `npm run ingest`, which
is the MVP. Automation (Appendix A) can be layered on later without changing this.

---

## Appendix A — Deferred: Cron Automation Options

> **Status: deferred.** The dashboard currently uses manual ingestion (`npm run ingest`, see
> Section 6). The notes below were explored for automating ingestion on a schedule, but are
> parked until a clearly free/low-friction option is settled on. Kept here for reference when
> automation is picked back up — none of this needs to be built right now.

### A.1 Option A — Next.js API route + external cron pinger (lowest effort)

Build one route that runs all ingesters:

```ts
// app/api/cron/ingest/route.ts
import { ingestHackerNews } from "@/src/ingesters/hacker-news";
import { ingestGithubTrending } from "@/src/ingesters/github-trending";
import { ingestRss } from "@/src/ingesters/rss";
import { ingestManualFeeds } from "@/src/ingesters/manual-feeds";

export async function GET(req: Request) {
  // Simple shared-secret check so this isn't a public "run my scraper" endpoint
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await Promise.allSettled([
    ingestHackerNews(),
    ingestGithubTrending(),
    ingestRss([/* feed configs */]),
    ingestManualFeeds(),
  ]);

  return Response.json({ ok: true, ranAt: new Date().toISOString() });
}
```

Then have *something* call this URL once a day with the `Authorization` header. Pick one:

- **cron-job.org** (free, no account needed for basic use) — schedule an HTTP GET to your
  deployed URL.
- **Vercel Cron Jobs** — if deploying to Vercel, add a `vercel.json`:
  ```json
  {
    "crons": [{ "path": "/api/cron/ingest", "schedule": "0 0 * * *" }]
  }
  ```
  Vercel calls this automatically; no external service needed. Add the `CRON_SECRET` check
  above regardless, since Vercel cron requests aren't otherwise authenticated by default.
- **Uptime monitoring tools repurposed as cron** (e.g. UptimeRobot, Healthchecks.io "pinger")
  — many free uptime checkers let you set the check interval to 24h and will hit your URL on
  schedule. Slightly hacky but works and gives you uptime monitoring for free too.

### A.2 Render Cron Job

**Note: not free** — Render's Cron Job service type is billed per execution (no permanent
free tier for this service type, unlike GitHub Actions on a public repo). Useful as a future
option but doesn't fit "deferred until we find something free" right now.

Render has a dedicated **Cron Job** service type — separate from "Web Service" — built
specifically for scheduled tasks, which makes it a good sandbox for testing whether your
ingestion automation works end-to-end before picking a permanent platform.

**Why it's a good test environment:**

- Render's Cron Job service runs your command on a schedule using standard cron syntax (e.g.
  `0 0 * * *`) and only bills for the actual execution time — it doesn't need to stay "awake"
  like a free web service does (free web services on Render sleep after ~15 minutes of
  inactivity and need a keep-alive ping; the Cron Job service type doesn't have this problem
  since it's not a persistent server).
- It deploys directly from your GitHub repo, same as the GitHub Actions workflow you already
  have — so migrating the *trigger* without rewriting the *ingestion code* is straightforward.
- You get real logs and execution history per run, which is useful for debugging "did it
  actually run, and did it error?" while testing.

**Setup steps:**

1. Push this repo to GitHub (already done) and connect it to Render.
2. In the Render dashboard, create a new **Cron Job** (not a Web Service).
3. **Build command:**
   ```bash
   npm ci
   ```
4. **Command** (what runs on schedule):
   ```bash
   npx ts-node src/ingesters/run-all.ts
   ```
5. **Schedule:** standard cron syntax, e.g. `0 0 * * *` for daily at midnight UTC.
6. **Environment variables:** add any keys your ingesters need (e.g. `GITHUB_TOKEN` for higher
   rate limits, RSS feed URLs if not hardcoded).
7. **Persistence caveat:** Render Cron Jobs run in an ephemeral container — the filesystem does
   **not** persist between runs. Since `data/dashboard.db` (SQLite) needs to persist across
   runs *and* be readable by your deployed dashboard, you have two options:
   - **For testing the automation logic only** (i.e. "does the ingester run successfully on a
     schedule, fetch data, and not crash?") — this is fine as-is. Point `DB_PATH` at a
     throwaway location, check the logs/output to confirm each ingester ran and returned
     expected counts, and treat the SQLite writes as disposable during this test phase.
   - **For a working end-to-end deployment** — switch to **Render's managed PostgreSQL**
     (free for 90 days, then ~$7/mo) so both the Cron Job and the Next.js Web Service connect
     to the same persistent database over Render's private network. This means changing
     `src/db/client.ts` from `better-sqlite3` to a Postgres client (e.g. `pg` or `postgres.js`)
     — a bigger change, so don't do this until you've confirmed the scheduling itself works.

**Recommended test sequence:**

1. Deploy `run-all.ts` as a Render Cron Job with a *short* interval first (e.g. `*/15 * * * *`,
   every 15 minutes) so you don't wait a full day to see results.
2. Confirm in Render's logs that each ingester runs and logs its "inserted/skipped" summary
   (the manual-feeds ingester already logs this — see `src/ingesters/manual-feeds/index.ts`).
3. Once confirmed working, switch the schedule to your real cadence (`0 0 * * *` for daily)
   and decide whether to keep SQLite (single-service, no Cron Job — see Option C below) or move to
   Postgres for a true multi-service setup.

### A.3 Option B — Self-hosted: system cron + a small Python/Node script

If the dashboard runs on a VPS or your own machine/server (not a serverless platform), skip
HTTP entirely and run the ingesters as a scheduled OS process:

```bash
# crontab -e
0 0 * * * cd /path/to/dashboard && npx ts-node src/ingesters/run-all.ts >> /var/log/ingest.log 2>&1
```

Create `src/ingesters/run-all.ts` that imports and calls all four ingesters sequentially (this
is also the module the Option A route should import). This keeps "run everything" logic in one
place regardless of how it's triggered.

### A.4 Option C — Database-triggered / on-demand (no schedule at all)

For low-traffic internal tools, "daily" freshness is often good enough achieved lazily:

- Store `last_ingested_at` in the `kv_store` table (see Section 2.4).
- On each dashboard page load (Server Component), check if `last_ingested_at` is >24h old.
- If so, kick off ingestion in the background (`after()` in Next.js 15, or a fire-and-forget
  `fetch` to the cron route) and update `last_ingested_at` immediately to avoid duplicate
  triggers from concurrent requests.

Trade-off: the *first* visitor of the day gets slightly stale data (and triggers the refresh
for everyone after). Fine for an internal tool with a handful of users; not fine if you need
guaranteed freshness regardless of traffic.

### A.5 Recommendation (when revisiting this)

The free options are: GitHub Actions on a public repo (already set up, see
`.github/workflows/ingest.yml`), Vercel Cron on a free Hobby deployment (A.1), or cron-job.org
pinging a free-tier endpoint (A.1). Render's Cron Job (A.2) is a paid service type — keep it in
mind if budget isn't a constraint later, but it's not the first thing to try given the "find a
free way" goal.

Likely best next step: keep `.github/workflows/ingest.yml` as-is (it already exists and is
free), and simply point it at `npm run ingest` instead of the per-ingester steps it currently
has. That gets scheduling back without inventing a new platform — revisit this once the manual
workflow (Section 6) is solid and the ingesters are fully implemented.
