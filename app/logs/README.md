# `/logs` — Log Analysis Dashboard

Client-side page (`"use client"`) for uploading, analyzing, and exploring Zoho / Acuity log CSV files.

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
- **ErrorTrendChart** — Nivo bar chart of errors per day
- **SourceBreakdown** — Nivo donut chart of Acuity vs Zoho errors
- **Patterns table** — grouped error patterns sorted by frequency, with severity badges (high/medium/low)
- **Anomalies table** — statistical spikes (deviation > 2σ) with severity badges
- **Executive Summary** — generated text summary of the analysis

### 4. Loading / Empty / Error States

- **Loading**: `Skeleton` placeholders for overview cards, chart areas, and tables
- **Empty analysis list**: "No analyses yet" message with upload prompt
- **Empty detail**: message when no analysis matches the ID
- **API failure**: toast-style error via `catch` blocks

## Data Flow

```
User drops CSV → CsvUpload → POST /api/logs → log-parser.ts → SQLite (4 tables)
                            → returns { id, total_rows, error_count, ... }
                            → onAnalyzed() → refetch GET /api/logs → UI re-render

User clicks row → GET /api/logs/[id] → detail + GET /api/logs/[id]/errors → charts + tables
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
| `GET /api/logs/[id]/anomalies` | Detected anomaly spikes |
