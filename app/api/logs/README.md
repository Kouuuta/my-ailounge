# `/api/logs` — Log Analysis API

REST API for uploading CSV log files and retrieving parsed analysis results. Supports Zoho and Acuity error log formats.

## Routes

### `POST /api/logs` — Upload & analyze a CSV

- **Content-Type**: `multipart/form-data`
- **Body**: `file` field, `.csv` only
- **Source detection**: `acuity_*.csv` → `"acuity"`, otherwise `"zoho"`
- **Pipeline**: CSV → `csv-parse/sync` → `parseLogCsv()` → column detection → error extraction → pattern grouping → anomaly detection → SQLite inserts (4 tables)
- **Response** `201`: `{ id, source, total_rows, error_count, ... }`
- **Errors** `400`: "No file provided", "Only CSV files are accepted", or parse failure message

### `GET /api/logs` — List all analyses

- Returns all `log_analyses` rows ordered by `uploaded_at DESC`
- **Response**: `{ analyses: [...] }`

### `GET /api/logs/[id]` — Single analysis detail

- Returns analysis metadata plus counts of related errors, patterns, and anomalies
- **Response**: `{ id, filename, source, ..., errorCount, patternCount, anomalyCount }`
- **Error** `404`: analysis not found

### `DELETE /api/logs/[id]` — Remove analysis

- Cascading delete — removes the analysis row plus all related `log_errors`, `log_patterns`, `log_anomalies` rows
- **Response**: `{ ok: true }`
- **Error** `404`: analysis not found

### `GET /api/logs/[id]/errors` — Error rows (paginated)

- **Query params**: `limit` (default 50, max 200), `offset` (default 0), `is_error` (optional filter: `"0"` or `"1"`)
- Ordered by `timestamp DESC, id DESC`
- **Response**: `{ items: [...], total, limit, offset }`

### `GET /api/logs/[id]/patterns` — Grouped error patterns

- Returns patterns ordered by count descending
- Each pattern: `pattern_key`, `sample_message`, `count`, `first_seen`, `last_seen`, `severity`
- **Response**: `{ patterns: [...] }`

### `GET /api/logs/[id]/anomalies` — Statistical spikes

- Returns anomalies ordered by deviation descending
- Each anomaly: `description`, `severity`, `detected_at`, `error_count`, `expected_count`, `deviation`
- Detection method: daily error counts > 2σ above mean
- **Response**: `{ anomalies: [...] }`

## Schema Notes

All routes use `getDb()` singleton (`@/src/db/client`). Related tables cascade on delete:

- `log_errors` → `analysis_id` references `log_analyses(id) ON DELETE CASCADE`
- `log_patterns` → `analysis_id` references `log_analyses(id) ON DELETE CASCADE`
- `log_anomalies` → `analysis_id` references `log_analyses(id) ON DELETE CASCADE`
