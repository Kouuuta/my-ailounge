# `components/logs/` — Log Analysis Dashboard Components

6 components used by the Log Analysis Dashboard at `app/logs/page.tsx`.

All are `"use client"` — they interact with the `/api/logs` endpoints.

## Components

### `CsvUpload`

Drag-and-drop CSV uploader for Zoho and Acuity log files.

- Accepts `.csv` files only, validates filename (Acuity- vs Zoho-prefixed determines source)
- Posts via `FormData` to `POST /api/logs`
- Shows loading spinner during parse, check/cross on result
- Calls `onAnalyzed` callback on success to refresh the analysis list

### `OverviewCards`

Server-friendly stat cards showing 3 metrics from an analysis:

| Card | Data |
|------|------|
| Total Rows | `totalRows` with date range subtitle |
| Errors | `errorCount` with `uniqueErrors` subtitle |
| Error Rate | `(errorCount / totalRows)` percentage |

No `"use client"` directive — pure presentational component.

### `ErrorTrendChart`

Bar chart of daily error counts using `@nivo/bar`.

- Aggregates errors by day from the analysis data
- Empty state: "No error trend data" placeholder
- Nivo theme variables reference CSS custom properties (`--color-muted-foreground`, `--color-border`) for dark/light compatibility

### `SourceBreakdown`

Donut chart splitting error counts between Acuity and Zoho sources using `@nivo/pie`.

- Inner radius 0.55 (donut style), amber/blue color scheme
- Arc labels show percentage, tooltip shows raw counts and exact percentage
- Empty state: "No source data" placeholder

### `SeverityLegend`

Compact color legend for error pattern severity levels.

- Renders 3 colored dots with labels: High (red), Medium (amber), Low (green)
- Uses the same color tokens as `severityBadge()` in `page.tsx` (`bg-red-500`, `bg-amber-500`, `bg-emerald-500`)
- No `"use client"` directive — pure presentational component
- **Props**: `className?: string` — for margin/spacing control
- Placed inside the Top Error Patterns card, above the pattern list

### `PatternDrillDown`

Slide-in panel that shows detailed information about a specific error pattern.

- Activated by clicking a pattern card in the analysis detail view
- Slide-in panel from the right side with overlay
- **Props**: `analysisId: number`, no `open`/`onClose` — uses URL search params (`?pattern=`)
- **Tabs**: Overview (timeline bar chart + methods), Error Rows (paginated with pagination controls)
- **Overview tab**: Timeline bar chart (inline divs), method call breakdown (colored bars), sample error message
- **Error Rows tab**: Table with timestamp, method, action, content, error code, severity badge, source badge
- **Loading state**: Skeleton placeholders during API fetch
- **Empty state**: Fallback when no detail data
- **Dependencies**: `lucide-react` (X, ChevronLeft, ChevronRight), `@/lib/utils` (cn)

### Imports / Dependencies

| Component | Imports |
|-----------|---------|
| `CsvUpload` | `@/lib/utils` (cn), `lucide-react`, `react` |
| `OverviewCards` | `@/components/ui/card` |
| `ErrorTrendChart` | `@nivo/bar` |
| `SourceBreakdown` | `@nivo/pie` |
| `PatternDrillDown` | `@/lib/utils` (cn), `lucide-react` |
| `SeverityLegend` | `@/lib/utils` (cn) |
