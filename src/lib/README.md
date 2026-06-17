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

Used by: `ingesters/manual-feeds`, `ingesters/rss`, and future `ingesters/hacker-news` and `ingesters/github-trending`.

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

Dashboard analytics queries against SQLite. Each function opens its own connection via `getDb()`.

| Function | Returns | SQL |
|----------|---------|-----|
| `getTotalItems()` | `number` | `COUNT(*) FROM feed_items` |
| `getItemsToday()` | `number` | `COUNT(*) WHERE date(fetched_at) = date('now')` |
| `getItemsThisWeek()` | `number` | `COUNT(*) WHERE fetched_at >= datetime('now', '-7 days')` |
| `getItemsBySource()` | `SourceBreakdown[]` | `GROUP BY source ORDER BY count DESC` |
| `getItemsByCategory()` | `CategoryBreakdown[]` | `GROUP BY category ORDER BY count DESC` |
| `getIngestionStatus()` | `IngestionStatus[]` | Reads from `kv_store` for each source |
| `getLastGlobalIngestion()` | `string \| null` | `ingest:last_run:all` from `kv_store` |
| `getGlobalIngestionStatus()` | `string \| null` | `ingest:status:all` from `kv_store` |

**IngestionStatus fields:** `source`, `lastRun`, `status`, `count`, `elapsedMs`

Used by:
- `app/page.tsx` — stat cards, breakdown sections, automation status
- `components/engineering-intelligence/` — dashboard widgets
