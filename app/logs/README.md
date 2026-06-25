# `/logs` — Log Analysis Dashboard

Client-side page (`"use client"`) for uploading, analyzing, and exploring Zoho / Acuity log CSV files.

## Supported Log Sources

| Source | Detection | Format |
|--------|-----------|--------|
| **Acuity** | Filename starts with `acuity_` (e.g. `acuity_logs_2024-01.csv`) | CSV with timestamp, content, action, method, error_code, response columns |
| **Zoho** | Any other `.csv` filename | Same column family — auto-detected by header name regex |

Column detection is regex-based: `timestamp`, `content`/`message`, `action`/`type`, `method`/`endpoint`, `error_code`/`status_code`, `response`/`result`. Sources not matching these column patterns will fail parsing with a clear error.

## Route

| Path | File | Type |
|------|------|------|
| `/logs` | `page.tsx` | Client |

## Features

### 1. Analysis List (default view)

- Table of previous analyses: filename, source badge (Acuity/Zoho), upload date, total rows, error count, error rate, actions
- **Delete** button removes analysis and all related errors/patterns/anomalies (cascade)
- Click any row to open its detail view

### 2. CSV Upload

- Drag-and-drop or click-to-browse
- Filename-based source detection: `acuity_*.csv` → Acuity, otherwise Zoho
- Uploads to `POST /api/logs`, shows inline result (success/failure)
- On success, refreshes the analysis list

### 3. Analysis Detail (`?id=N`)

- **Back button** returns to list
- **OverviewCards** — Total Rows, Errors, Error Rate
- **ErrorTrendChart** — Nivo bar chart of errors per day, with empty state when no trend data exists
- **SourceBreakdown** — Nivo donut chart splitting error counts between Acuity and Zoho, with tooltip showing raw counts and percentages
- **Patterns table** — grouped error patterns sorted by frequency, with severity badges (high/medium/low) and a **SeverityLegend** component explaining the color thresholds (red=high, amber=medium, green=low)
- **Anomalies table** — statistical spikes where daily error count exceeds 2σ above the mean, with severity badges (medium for 2-3σ, high for >3σ)
- **Executive Summary** — generated plain-English text summary of findings, including primary issue categories, error volume trends, anomaly days, and recommended investigation
- **Pattern drill-down** — click any pattern row to open a slide-in panel (`?pattern=`) showing:
  - Timeline bar chart of when that pattern occurred
  - Method call breakdown (bars)
  - Sample error message
  - Paginated error rows table with timestamp, method, action, content, error code, severity badge, source badge
- **Export** — dropdown menu in the header with 3 formats:
  - **JSON** — full analysis payload (metadata, patterns, anomalies) as a `.json` file (client-side)
  - **CSV** — flattened patterns + anomalies as a `.csv` file (client-side)
  - **PDF** — professional report with header, executive summary, metrics grid, top findings table, anomaly spikes table, methods table, and supporting statistics — generated server-side via `GET /api/logs/[id]/export/pdf`

### 4. Pattern Drill-Down (`?pattern=<key>`)

The Pattern DrillDown component overlays from the right edge when a pattern row is clicked:

- **Overview tab**: inline timeline bar chart showing error frequency per day, method call breakdown with colored bars, and a sample error message
- **Error Rows tab**: paginated table of individual error rows matching this pattern, with timestamp, method, action, content, error code, severity badge, and source badge
- **Navigation**: URL search param (`?pattern=`) enables deep-linking and browser back/forward
- **Loading state**: skeleton placeholders during API fetch
- **Empty state**: fallback message when no detail data is available

### 5. Export Formats

| Format | Generation | Content |
|--------|-----------|---------|
| **JSON** | Client-side (constructs payload in browser) | Full analysis metadata, patterns array, anomalies array |
| **CSV** | Client-side (constructs CSV from patterns+anomalies) | Flattened rows: type, severity, count, first_seen, last_seen, description |
| **PDF** | Server-side via `GET /api/logs/[id]/export/pdf` | Professional multi-page report: file info, executive summary, key metrics grid (6 metrics), top findings table, anomaly spikes table, methods table, supporting statistics, end marker —~3 pages per analysis |

### 6. Loading / Empty / Error States

- **Loading**: `Skeleton` placeholders for overview cards, chart areas, and tables
- **Empty analysis list**: "No analyses yet" message with upload prompt
- **Empty detail**: message when no analysis matches the ID
- **API failure**: toast-style error via `catch` blocks

## Data Flow

```
Upload:
  User drops CSV → CsvUpload → POST /api/logs (multipart FormData)
    → parseLogCsv() → column detection → error extraction → pattern grouping → anomaly detection
    → INSERT log_analyses + log_errors + log_patterns + log_anomalies
    → returns { id, source, total_rows, error_count, ... }
    → onAnalyzed() → refetch GET /api/logs → UI re-render

Detail view:
  User clicks row → GET /api/logs/[id] → analysis metadata + counts
                  → GET /api/logs/[id]/patterns → grouped patterns table + SeverityLegend
                  → GET /api/logs/[id]/anomalies → statistical spike table
                  → executive summary (computed client-side from analysis data)

Pattern drill-down:
  Click pattern row → ?pattern=<pattern_key> in URL
    → GET /api/logs/[id]/patterns/[pid] → timeline + methods + sample error
    → GET /api/logs/[id]/patterns/[pid]/errors (paginated) → error rows table

Export:
  JSON/CSV → constructed client-side, triggers file download
  PDF     → GET /api/logs/[id]/export/pdf → server-side report → binary download
```

## API Dependencies

| Endpoint | Purpose |
|----------|---------|
| `GET /api/logs` | List all analyses |
| `POST /api/logs` | Upload and parse a CSV |
| `GET /api/logs/[id]` | Single analysis with error/pattern/anomaly counts |
| `DELETE /api/logs/[id]` | Remove an analysis |
| `GET /api/logs/[id]/errors` | Paginated error rows for an analysis |
| `GET /api/logs/[id]/patterns` | Grouped error patterns |
| `GET /api/logs/[id]/patterns/[pid]` | Pattern drill-down detail (timeline, methods, sample) |
| `GET /api/logs/[id]/patterns/[pid]/errors` | Pattern-specific paginated error rows |
| `GET /api/logs/[id]/anomalies` | Detected anomaly spikes |
| `GET /api/logs/[id]/export/pdf` | Downloadable PDF report |
