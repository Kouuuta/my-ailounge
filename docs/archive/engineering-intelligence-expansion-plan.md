# Engineering Intelligence Expansion Plan

## Background

The current my-ailounge dashboard ingests 4 categories of data (AI news, Cloud news, HN, GitHub Trending, etc.) via 4 ingesters. Sir Bo (COO) requested expanding the intelligence surface to cover DevOps/Security/AI infrastructure more deeply, plus adding Docker support for reproducible environments, and new intern tasks to onboard contributors.

This plan covers the "what" and "how" for each expansion area. Implementation is broken into phases with clear dependencies.

## Current Architecture (Reference)

| Layer | Technology |
|-------|-----------|
| Ingesters | 4 modules: `rss/`, `hacker-news/`, `github-trending/`, `manual-feeds/` |
| RSS config | `src/ingesters/rss/feeds.ts` — `RSS_FEEDS` array of `RSSFeedConfig { url, category, feedFile }` |
| Feed files | `docs/feeds/*.md` — one file per category, parsed by manual-feeds ingester |
| Run-all | `src/ingesters/run-all.ts` — orchestrates hn, github_trending, rss (NOT manual-feeds) |
| DB schema | `src/db/schema.ts` — `feed_items` + `kv_store` tables |
| UI widgets | `components/engineering-intelligence/*.tsx` |

## Phase 1: New RSS Sources

Adding a new RSS source is low-risk: add one entry to `RSS_FEEDS` in `feeds.ts`, optionally add a new `feedFile` to `docs/feeds/` and update `FILE_CATEGORY_MAP` in `manual-feeds/index.ts`.

### Source-by-Source Analysis

| Source | RSS URL | Feasibility | Feed File | Category | Complexity |
|--------|---------|-------------|-----------|----------|------------|
| **WordPress (company blog)** | `https://wordpress.com/blog/feed/` | ✅ Confirmed working | `09-devops-news.md` | devops | Trivial |
| **WordPress (Storefront theme)** | `https://woocommerce.com/blog/feed/` | ✅ WooCommerce blog (Storefront is a WP theme, no standalone feed) | `09-devops-news.md` | devops | Trivial |
| **WordPress (org news)** | `https://wordpress.org/news/feed/` | ✅ Confirmed working | `09-devops-news.md` | devops | Trivial |
| **CVE.org (latest CVEs)** | `https://cvefeed.io/rss/` | ✅ Third-party RSS; NVD JSON feeds also available for structured data | `08-security-alerts.md` | security | Trivial |
| **Y Combinator** | `https://www.ycombinator.com/blog/feed` | ✅ Confirmed working | `10-startup-news.md` | startup | Trivial |
| **GitHub Blog** | `https://github.blog/feed/` | ✅ Confirmed working | `11-github-news.md` | github | Trivial |
| **GitHub (release notes)** | `https://github.com/{owner}/{repo}/releases.atom` | ✅ Atom feed per repo; need to decide which repos to track | `11-github-news.md` | github | Low |
| **GitHub (weekly/daily trends)** | No RSS | ⚠️ Already covered by `github-trending` ingester from `ideas/trending.md` | `04-github-trending.md` | github | Already done |
| **Docker Blog** | `https://www.docker.com/blog/feed/` | ✅ Confirmed working | `09-devops-news.md` | devops | Trivial |
| **DevOps (general)** | `https://devops.com/feed/` | ✅ Confirmed working | `09-devops-news.md` | devops | Trivial |

### Recommended Additions

Add these entries to `RSS_FEEDS` in `src/ingesters/rss/feeds.ts`:

```ts
// DevOps / Infrastructure
{ url: "https://wordpress.com/blog/feed/",          category: "devops",    feedFile: "09-devops-news.md" },
{ url: "https://woocommerce.com/blog/feed/",        category: "devops",    feedFile: "09-devops-news.md" },
{ url: "https://wordpress.org/news/feed/",          category: "devops",    feedFile: "09-devops-news.md" },
{ url: "https://www.docker.com/blog/feed/",         category: "devops",    feedFile: "09-devops-news.md" },
{ url: "https://devops.com/feed/",                  category: "devops",    feedFile: "09-devops-news.md" },

// Security
{ url: "https://cvefeed.io/rss/",                   category: "security",  feedFile: "08-security-alerts.md" },

// Startup / Business
{ url: "https://www.ycombinator.com/blog/feed",     category: "startup",   feedFile: "10-startup-news.md" },

// GitHub Platform
{ url: "https://github.blog/feed/",                 category: "github",    feedFile: "11-github-news.md" },
```

Also needs:
- New feed files `09-devops-news.md`, `10-startup-news.md`, `11-github-news.md` in `docs/feeds/` with a header comment
- Add entries to `FILE_CATEGORY_MAP` in `manual-feeds/index.ts`:

```ts
"09-devops-news.md":   "devops",
"10-startup-news.md":  "startup",
"11-github-news.md":   "github",
```

- Add to `run-all.ts` summary table (or not — it auto-reads `RSS_FEEDS` and reports per-feed stats already)

### Category Discussion

Should WordPress, Docker, and DevOps be under the same `devops` category or separate? Options:

1. **Bundled `devops`** — simpler, fewer feed files, one category for filtering
2. **Split** — `devops` (CI/CD tools), `wordpress` (CMS), `docker` (container) — more granular filtering

**Recommendation**: Bundle as `devops` for now. If filtering granularity is needed later, split is a zero-cost refactor (just change the `category` field and feed file assignment).

## Phase 2: Dockerfile + docker-compose

No Docker infrastructure exists. Adding it enables reproducible development, CI standardization, and simplifies onboarding.

### Requirements

| Feature | Notes |
|---------|-------|
| Node.js 22 (matching `.nvmrc`) | Use `node:22-alpine` for small image size |
| SQLite support | SQLite runs in-process; no external DB service needed |
| Volume for SQLite DB | Persist `data/dashboard.db` across restarts |
| Volume for docs/feeds | If we want to edit feeds from host and have them available |
| `npm run dev` startup | Container should run dev by default |
| docker-compose with single service | No external deps (DB, cache, queue) needed — just the app |
| `.dockerignore` | Exclude `node_modules`, `data/`, `.git`, etc. |

### Proposed Structure

```
Dockerfile              — Multi-stage build (dev deps → prod deps → app)
docker-compose.yml      — Single service with volumes
.dockerignore           — Standard ignores
```

### Dockerfile Design

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### docker-compose.yml Design

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./docs/feeds:/app/docs/feeds
    environment:
      - NODE_ENV=development
```

### Risks

- **SQLite concurrency**: If multiple containers write to the same SQLite file, concurrency issues arise. For a single dev container this is fine. For production, consider moving to PostgreSQL.
- **Windows path handling**: Volume mounts on Windows may need `//c/Users/...` paths or `.env` config.
- **Hot reload**: `next dev` inside a container works but is slower than native. Acceptable for dev.

## Phase 3: New Intern Tasks

Current tasks are 13 entries across beginner/intermediate/advanced. We need tasks covering:

1. **Docker onboarding** — "Run the app in Docker"
2. **New RSS source integration** — "Pick one new RSS source and add it to the config"
3. **Security alert triage** — "Review CVE alerts and tag them"
4. **API testing** — "Write a test for `/api/feed` endpoint"
5. **Dashboard widget** — "Build a widget showing RSS source health"
6. **Feed file audit** — "Check all `docs/feeds/*.md` for stale entries > 30 days"
7. **Docker optimization** — "Reduce the Docker image size"
8. **Compose multi-service** — "Add a Redis or Postgres service to compose"

### Proposed New Tasks

```ts
{
  title: "Run the app in Docker",
  description: "Build the Docker image and run `docker compose up`. Confirm the dashboard loads at localhost:3000.",
  difficulty: "beginner",
},
{
  title: "Add a new RSS source to the ingester",
  description: "Research a relevant blog with an RSS feed, add it to src/ingesters/rss/feeds.ts, create the feed file, run `npm run ingest` and verify it appears on the dashboard.",
  difficulty: "intermediate",
},
{
  title: "Audit feed files for stale entries",
  description: "Check all files in docs/feeds/ for entries older than 30 days. Remove or archive them to keep the feed clean.",
  difficulty: "beginner",
},
{
  title: "Build an ingester health widget",
  description: "Create a dashboard widget showing last run time, item count, and status for each ingester source.",
  difficulty: "intermediate",
},
{
  title: "Write an API endpoint test",
  description: "Add a test for GET /api/feed that verifies the response shape and status code.",
  difficulty: "intermediate",
},
{
  title: "Optimize the Docker image size",
  description: "Analyze the Docker image with `docker image history`, identify unnecessary layers, and reduce the image by at least 40%.",
  difficulty: "advanced",
},
{
  title: "Add a startup news category",
  description: "Create a new `startup` category in the dashboard filter, wire it through the API and UI, and verify filtering works.",
  difficulty: "intermediate",
},
{
  title: "Write a data integrity query",
  description: "Write a SQL query to find feed_items with NULL urls or malformed dates and report them.",
  difficulty: "beginner",
},
```

## Phase 4: Feed File Refresh Mechanism

Current problem: `docs/feeds/*.md` files accumulate entries indefinitely with no rotation. Two approaches:

### Option A: Archive by Date
- Rename `{file}.md` → `{file}-{YYYY-MM}.md` at the start of each month
- Create a fresh file with just the header
- Update `FILE_CATEGORY_MAP` to include both old and new files
- Pros: Historical data preserved, easy to reason about
- Cons: Manual action needed (or cron job), map grows over time

### Option B: Time-Bounded Ingestion
- Already partly implemented: RSS ingester respects `MIN_DATE = "2026-01-01"`
- Add a MAX_ENTRIES per feed file config
- When the file exceeds N entries, auto-remove the oldest entries
- Pros: Automatic, no config changes
- Cons: Destructive (data still in SQLite DB, just removed from markdown)

### Recommendation
Do nothing now. The SQLite DB is the source of truth; `docs/feeds/*.md` is a human-readable cache. When files exceed ~500 lines, implement Option B with a cron-like check in `manual-feeds/index.ts`.

## Implementation Order

```
Phase 1a (Trivial RSS)        —— WordPress x3, YC, Docker, DevOps.com       [~15 min]
Phase 1b (CVE.org RSS)        —— cvefeed.io into security-alerts            [~10 min]
Phase 1c (GitHub Blog RSS)    —— github.blog into github-news               [~10 min]
Phase 2  (Docker)             —— Dockerfile + compose + .dockerignore       [~30 min]
Phase 3  (Intern Tasks)       —— Add 8 new tasks to intern-tasks.ts         [~15 min]
Phase 4  (Feed Rotation)      —— Deferred until files exceed 500 lines      [future]
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RSS feed goes down | Medium | Low | Ingester skips on HTTP error; dashboard shows stale data |
| CVE feed too noisy | Medium | Medium | Tag CVEs with severity; add filter in widget |
| Docker volume permissions on Windows | Medium | Medium | Add `.env` for path override; document in setup |
| Feed files grow unbounded | High | Low | Defer Phase 4; DB has dedup so no functional damage |
| New category not filterable in UI | Low | Medium | Add `startup` to the category enum + filter component |

## Open Questions

1. Should WordPress feeds go under `devops` or a new `cms` category?
2. Should we track specific GitHub repos for release notes (e.g., `vercel/next.js`, `nodejs/node`)?
3. Is Docker production deployment in scope, or just local dev?
4. Should `run-all.ts` be updated to track manual-feeds ingester, or keep it separate?
5. Are there compliance concerns with pulling CVE data into our DB?
