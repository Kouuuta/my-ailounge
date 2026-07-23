# `/api/ingest` — On-Demand Ingestion API

Triggers all feed ingesters via the dashboard UI.

## Route

### `POST /api/ingest`

Calls `runAll({ closeDb: false })` from `src/ingesters/run-all.ts` and returns JSON results.

Called by the `IngestButton` component (`components/engineering-intelligence/ingest-button.tsx`).

**Response:**
```json
{
  "results": {
    "hn": { "ok": true, "inserted": 5, "elapsed": 1234 },
    "github_trending": { "ok": true, "inserted": 3, "elapsed": 567 },
    "rss": { "ok": true, "inserted": 12, "elapsed": 890 }
  },
  "allOk": true
}
```

**Error** `500`: ingestion failure with error message.
