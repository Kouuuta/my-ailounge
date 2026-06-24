# `app/api/stats/` — Sidebar Quick Stats API

Single `GET` endpoint consumed by the Sidebar's Quick Stats panel. Returns aggregated counts and ingestion timing.

## Route

| Method | Path | File | Description |
|--------|------|------|-------------|
| `GET` | `/api/stats` | `route.ts` | Aggregate counts + last ingest timestamp |

## Response Shape

```json
{
  "totalItems": 42,
  "lastIngest": "2026-06-24T12:00:00.000Z",
  "itemsToday": 7,
  "itemsThisWeek": 23,
  "errors": 0
}
```

| Field | Type | Source |
|-------|------|--------|
| `totalItems` | `number` | `SELECT COUNT(*) FROM feed_items WHERE source != 'manual'` |
| `lastIngest` | `string\|null` | `getLastGlobalIngestion()` — reads `ingest:last_run:all` from `kv_store` |
| `itemsToday` | `number` | `getItemsToday()` — filtered by `date(fetched_at) = date('now')` |
| `itemsThisWeek` | `number` | `getItemsThisWeek()` — filtered by `fetched_at >= datetime('now', '-7 days')` |
| `errors` | `number` | `getIngestionStatus()` count where `status === 'error'` |

## Data Flow

```
Sidebar (client)
  └─ useEffect → fetch("/api/stats")
                    └─ GET /api/stats
                         ├─ getDb().prepare("SELECT COUNT(*) ...").get()
                         ├─ getLastGlobalIngestion()
                         ├─ getItemsToday()
                         ├─ getItemsThisWeek()
                         └─ getIngestionStatus().filter(s => s.status === "error")
```

## Re-exported Analytics Functions

All queries delegate to `src/lib/analytics.ts`:
- `getLastGlobalIngestion()` — key `ingest:last_run:all`
- `getItemsToday()` — date filter
- `getItemsThisWeek()` — 7-day window
- `getIngestionStatus()` — per-source status from `kv_store`
