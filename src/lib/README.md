# `src/lib/` — Shared Utilities

Shared helpers consumed by ingesters and the dashboard UI.

## Files

### `utils.ts`

CSS classname merger for Tailwind UI components.

```ts
cn("px-4", isActive && "bg-blue-500", className)
```

Uses `clsx` for conditional joining and `tailwind-merge` for conflict resolution.

---

### `db.ts`

Shared database write utility used by all ingesters.

**`IngestEntry` interface:**

```ts
interface IngestEntry {
  source: string;
  category: string;
  title: string;
  url: string;
  summary?: string;
  tags?: string;
  score?: number;
  published_at: string;
}
```

**`upsertEntry(entry)`** — Inserts a row into `feed_items`. Returns `'inserted'` or `'skipped'` (if `UNIQUE(source, url)` constraint fires).

**Relevance scoring integration:**

`upsertEntry()` calls `scoreRelevance()` from `relevance-scorer.ts` after a successful insert. If a match is found, it stores `ai_relevance_score`, `ai_relevance_label`, `ai_relevance_reason`, and `relevance_base` on the inserted row, then calls `recalcEngagementForItem()` from `engagement-scorer.ts` to apply engagement boosts.

Used by: `ingesters/manual-feeds`, `ingesters/rss`, `ingesters/hacker-news`, `ingesters/github-trending`.

---

### `relevance-scorer.ts`

Scores feed items against the user's stack watchlist to surface relevant content. Called automatically from `upsertEntry()` at ingestion time.

**`scoreRelevance(item)`** — accepts `{ title, summary?, tags?, category }`. Returns `{ score, label, reason }` or `null`.

**Scoring logic:**

| Match Type | Score | Condition |
|------------|-------|-----------|
| Exact keyword match | 80 | Watchlist item name appears in title/summary/tags |
| Partial word match | 60 | ≥50% of watchlist name words appear in text |
| Category match | 40 | Feed category matches watchlist item category |

**Caching:** Watchlist data is cached in-memory for 10 minutes (600,000ms) to avoid repeated DB queries during batch ingestion.

---

### `engagement-scorer.ts`

Boosts `ai_relevance_score` based on user engagement (pins/reads) to surface community-validated content.

**`recalcEngagementForItem(itemId)`** — recalculates score for a single item:
```
final = min(relevance_base + pins×5 + reads×1, 100)
```

Called from `upsertEntry()` (on insert) and from `retroactivelyScore()` (on retroactive update).

**`recalcAllEngagementScores()`** — recalculates for all items with non-null `relevance_base`. Called at the end of `runAll()` orchestrator.

---

### `retroactive-scorer.ts`

Re-scores existing feed items when the watchlist grows, so new watchlist entries immediately surface relevant historical content.

**`retroactivelyScore({ name, category })`** — finds feed items whose `title`, `summary`, `tags`, or `category` match the new watchlist item, runs them through `scoreRelevance()`, and updates `relevance_base`, `ai_relevance_score`, `ai_relevance_label`, `ai_relevance_reason`. Then calls `recalcEngagementForItem()` for each matched item.

Called from `POST /api/watchlist` after a successful insert.

---

### `markdown.ts`

Writes entries to `docs/feeds/*.md` files in the standard format.

**`appendToFeed(filename, title, url, publishedAt, tags)`**

- Creates the file if it doesn't exist (with header)
- Appends under the correct `## Month Year` header
- Detects and skips duplicates by checking for the exact line
- Auto-trims files at 500 lines (removes oldest entries from the bottom)

**`trimFeedFile(filePath)`** — Internal. Removes oldest entries when a markdown feed exceeds 500 lines.

Used by: `ingesters/rss` (and future auto-ingesters).

---

### `analytics.ts`

Dashboard analytics queries against **Supabase PostgreSQL** (migrated from SQLite in June 2026). All functions are now `async` and use `supabase.from().select()` instead of `db.prepare("SQL").all()`.

**Migration:** Originally synchronous SQLite queries via `getDb()`. Now each function returns a `Promise<number>` or `Promise<Row[]>` from Supabase.

| Function | Returns | SQL (Supabase pattern) | Was (SQLite) |
|----------|---------|------------------------|--------------|
| `getTotalItems()` | `Promise<number>` | `supabase.from("feed_items").select("*", { count: "exact", head: true })` | `COUNT(*) FROM feed_items` |
| `getItemsToday()` | `Promise<number>` | `.gte("fetched_at", todayISO)` with `.lte(...)` date filter | `WHERE date(fetched_at) = date('now')` |
| `getItemsThisWeek()` | `Promise<number>` | `.gte("fetched_at", weekAgoISO)` | `WHERE fetched_at >= datetime('now', '-7 days')` |
| `getItemsBySource()` | `Promise<SourceBreakdown[]>` | `supabase.from("feed_items").select("source, count:source.count()")` | `GROUP BY source ORDER BY count DESC` |
| `getItemsByCategory()` | `Promise<CategoryBreakdown[]>` | `supabase.from("feed_items").select("category, count:category.count()")` | `GROUP BY category ORDER BY count DESC` |
| `getIngestionStatus()` | `Promise<IngestionStatus[]>` | Reads all `ingest:*` keys from `kv_store` via `.in()` filter | Same logic, sync SQLite |
| `getLastGlobalIngestion()` | `Promise<string \| null>` | `.select("value").eq("key", "ingest:last_run:all").single()` | Same logic, sync SQLite |
| `getGlobalIngestionStatus()` | `Promise<string \| null>` | `.select("value").eq("key", "ingest:status:all").single()` | Same logic, sync SQLite (added in `e331bf9`) |

**IngestionStatus fields:** `source`, `lastRun`, `status`, `count`, `elapsedMs`

Consumed by API routes at `app/api/stats/route.ts` (which return JSON for the sidebar and homepage).

Used by:
- `app/api/stats/route.ts` — wraps analytics calls for client consumption
- `components/engineering-intelligence/` — dashboard widgets

---

### `repo-radar.ts`

GitHub REST API client and repo refresh logic for the Repo Radar dashboard. Uses `supabase.from()` for all DB operations (migrated from SQLite `db.prepare()` in June 2026).

**`fetchRepoInfo(owner, repo)`** — Fetches repo metadata from `GET /repos/{owner}/{repo}`. Returns description, language, stars, open issues, pushed_at.

**`fetchLatestRelease(owner, repo)`** — Fetches latest release from `GET /repos/{owner}/{repo}/releases/latest`. Returns tag name, url, body, published_at. Returns `null` if no release exists.

**`fetchRecentPRs(owner, repo, days=7)`** — Fetches recent PRs from `GET /repos/{owner}/{repo}/pulls`. Returns `{ opened, merged }` counts within the time window.

**`fetchRecentIssues(owner, repo, days=7)`** — Fetches recent issues from `GET /repos/{owner}/{repo}/issues`. Returns count of non-PR issues created within the time window.

**`detectBreakingChanges(body)`** — Scans release body for breaking change keywords (`"BREAKING CHANGE"`, `"migration required"`, `"deprecated"`, etc.). Returns the first matching sentence or `null`.

**`detectSecurityAdvisory(body)`** — Scans release body for security keywords (`"CVE"`, `"vulnerability"`, `"security advisory"`, etc.). Returns the first matching sentence or `null`.

**`refreshSingleRepo(item)`** — Full refresh pipeline for one repo: fetches info + release + PRs + issues, detects breaking/security, updates Supabase row via `supabase.from("repo_radar_items").update()`.

**`refreshAll()`** — Iterates all active repos, calls `refreshSingleRepo()` on each, records summary in `kv_store` (via Supabase upsert). Returns `{ updated, errors, results }`.

**Error handling:** All GitHub API calls share `githubFetch()` which throws on 403 (rate limit) and non-ok statuses.

Used by:
- `app/api/repo-radar/` — add and refresh endpoints
- `src/ingesters/repo-radar/` — scheduled refresh via orchestrator

---

### `log-parser.ts`

CSV log parser for the Log Analysis Dashboard. Parses Acuity and Zoho CSV exports, classifies rows as errors or successes, groups errors into patterns by normalized message, and detects statistical anomaly spikes.

**Entry point:**

```ts
parseLogCsv(csvText: string, filename: string): AnalysisResult
```

Uses `csv-parse/sync` to parse the CSV. Source detection: `filename.startsWith("acuity")` → Acuity, otherwise Zoho.

**Column detection** — maps CSV header names by regex, picks first match:

| Column Role   | Matches (case-insensitive)                              |
|---------------|--------------------------------------------------------|
| `timestamp`   | `created_at`, `timestamp`, `date`, `datetime`, `time`   |
| `content`     | `content`, `message`, `description`, `status`, `result` |
| `action`      | `action`, `type`, `operation`, `event`                  |
| `method`      | `method`, `function`, `endpoint`, `api`                 |
| `error_code`  | `error_code`, `status_code`, `code`, `error`, `http_status` |
| `response`    | `response`, `result`, `output`, `body`                   |

**Error classification** — a row is an error unless:
- `content` or `error_code` column contains a success indicator (`"success"`, `"ok"`, `"true"`, `"200"`, `"201"`, `"204"`)

**Response parsing** — the `response` column is parsed for error details through a priority chain:
1. `JSON.parse` — extracts `code`, `message`, `error` fields from standard JSON responses (Zoho style)
2. Python dict Format A — `{'status_code': N, 'message': '...', 'error': '...'}` with escaped single quotes
3. Python dict Format B — `{'error': '...'}` single-key dict (sync_session style) with `\n`-embedded content

**Pattern normalization** — error messages are normalized to a `pattern_key` by replacing variable content with `{var}`:

| Pattern | Example |
|---------|---------|
| UUIDs | `a1b2c3d4-...` → `{var}` |
| ISO timestamps | `2024-01-15T10:30:00Z` → `{var}` |
| Emails | `user@example.com` → `{var}` |
| Phone numbers | `+1234567890` → `{var}` |
| Long numbers (6+ digits) | `1234567` → `{var}` |
| Single-quoted strings | `'some value'` → `{var}` |
| Double-quoted strings | `"some value"` → `{var}` |

**Pattern grouping** — normalized error messages are grouped by `pattern_key`. Each group yields:

```ts
{ pattern_key: string;    // normalized key with {var} placeholders
  sample_message: string; // first raw message seen
  count: number;          // occurrence count
  first_seen: string;     // earliest timestamp
  last_seen: string;      // latest timestamp
  severity: string; }     // "high" (>5% of errors), "medium" (>1%), "low"
```

**Anomaly detection** — daily error counts are bucketed by date. Mean and standard deviation are computed. Days where `count > mean + 2σ` are flagged:

- `deviation`: number of σ above mean
- `severity`: `"high"` (>3σ) or `"medium"` (2-3σ)

**Executive summary** — a plain-English summary is generated by categorizing patterns into semantic buckets:

| Category | Example trigger in pattern_key |
|----------|-------------------------------|
| `scheduling conflicts` | `"not an available time slot"` |
| `doctor-calendar mismatches` | `"doctor"` + `"appointment type"` |
| `user lookup failures` | `"email"` + `"not found"` |
| `conflicting appointment states` | `"both completed and cancelled"` |
| `access permission errors` | `"api access is only available on"` |
| `session conflicts` | `"existing session cancelled"` |
| `other errors` | default |

The summary describes the top category (with percentage), secondary category (if ≥5%), anomaly spike days, most affected method, and a recommended investigation direction. If no errors are found, it returns a clean bill of health.

**Interfaces:**

```ts
interface ParsedRow {
  is_error: boolean;
  method: string;
  action: string;
  content: string;
  error_type: string;
  pattern_key: string;
  error_code: string;
  raw_message: string;
  timestamp: string;
}

interface AnalysisResult {
  analysis: {
    total_rows: number;
    error_count: number;
    unique_errors: number;
    time_range_start: string;
    time_range_end: string;
    methods: string;           // JSON string of { method, count }[]
    executive_summary: string;
  };
  errors: ParsedRow[];
  patterns: { pattern_key: string; sample_message: string; count: number;
              first_seen: string; last_seen: string; severity: string }[];
  anomalies: { description: string; severity: string; detected_at: string;
               error_count: number; expected_count: number; deviation: number }[];
}
```

Used by:
- `app/api/logs/route.ts` — `POST /api/logs` upload + parse pipeline
