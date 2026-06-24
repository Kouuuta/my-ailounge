# `/app` — Next.js App Router Pages & API Routes

The UI and API layer for the Developer Dashboard. Built with Next.js App Router (Pages + Route Handlers).

## Route Map

| Path | File | Type | Description |
|------|------|------|-------------|
| `/` | `page.tsx` | Server | Engineering Briefing homepage |
| `/feed` | `feed/page.tsx` | Client (Suspense) | Full Developer Intelligence Feed |
| `/watchlist` | `watchlist/page.tsx` | Client | Stack Watchlist manager |
| `/logs` | `logs/page.tsx` | Client | Log Analysis Dashboard (upload + explore Zoho/Acuity CSV logs) |
| `/repo-radar` | `repo-radar/page.tsx` | Client | Repo Radar — track GitHub repos (stars, releases, PRs, issues) |
| `GET /api/feed` | `api/feed/route.ts` | Route Handler | List feed items with filters |
| `POST /api/feed` | `api/feed/route.ts` | Route Handler | Create a feed item |
| `PATCH /api/feed/[id]` | `api/feed/[id]/route.ts` | Route Handler | Update a feed item |
| `DELETE /api/feed/[id]` | `api/feed/[id]/route.ts` | Route Handler | Delete a feed item |
| `GET /api/watchlist` | `api/watchlist/route.ts` | Route Handler | List watchlist items |
| `POST /api/watchlist` | `api/watchlist/route.ts` | Route Handler | Add a watchlist item |
| `PATCH /api/watchlist/[id]` | `api/watchlist/[id]/route.ts` | Route Handler | Update a watchlist item |
| `DELETE /api/watchlist/[id]` | `api/watchlist/[id]/route.ts` | Route Handler | Remove a watchlist item |
| `POST /api/logs` | `api/logs/route.ts` | Route Handler | Upload & parse a Zoho/Acuity log CSV |
| `GET /api/logs` | `api/logs/route.ts` | Route Handler | List all log analyses |
| `GET /api/logs/[id]` | `api/logs/[id]/route.ts` | Route Handler | Single analysis with counts |
| `DELETE /api/logs/[id]` | `api/logs/[id]/route.ts` | Route Handler | Remove an analysis (cascade) |
| `GET /api/logs/[id]/errors` | `api/logs/[id]/errors/route.ts` | Route Handler | Paginated error rows for an analysis |
| `GET /api/logs/[id]/patterns` | `api/logs/[id]/patterns/route.ts` | Route Handler | Grouped error patterns |
| `GET /api/logs/[id]/anomalies` | `api/logs/[id]/anomalies/route.ts` | Route Handler | Statistical anomaly spikes |
| `POST /api/ingest` | `api/ingest/route.ts` | Route Handler | Trigger on-demand ingestion (calls `runAll()`) |
| `GET /api/repo-radar` | `api/repo-radar/route.ts` | Route Handler | List tracked repos |
| `POST /api/repo-radar` | `api/repo-radar/route.ts` | Route Handler | Add a repo to track (fetches GitHub API) |
| `PATCH /api/repo-radar/[id]` | `api/repo-radar/[id]/route.ts` | Route Handler | Update repo notes or is_active |
| `DELETE /api/repo-radar/[id]` | `api/repo-radar/[id]/route.ts` | Route Handler | Remove a tracked repo |
| `POST /api/repo-radar/refresh` | `api/repo-radar/refresh/route.ts` | Route Handler | Refresh all tracked repos from GitHub API |

## Root Layout — `layout.tsx`

Wraps all pages with:

- **Metadata** — title `Mind You Dashboard`, description `Developer Intelligence Dashboard`
- **ThemeProvider** — dark/light mode toggle (from `components/theme-provider`)
- **Navbar** — top navigation (from `components/ui/navbar`)
- **Toaster** — toast notifications via `sonner` (used by `IngestButton` and future components)

```tsx
<ThemeProvider>
  <Navbar />
  {children}
  <Toaster position="top-right" richColors />
</ThemeProvider>
```

## Global Styles — `globals.css`

Tailwind v4 with `@theme inline` custom tokens:

- **Color system** — oklch-based CSS variables for `--background`, `--foreground`, `--card`, `--primary`, `--accent-vibrant`, etc. with `.dark` overrides
- **Animations** — `fade-in`, `slide-up`, `slide-down`, `scale-in`, `shimmer`, `pulse-glow`
- **Animation easings** — `spring` (cubic-bezier), `out-expo`
- **Reduced motion** — all animations disabled via `prefers-reduced-motion`

## Homepage — `page.tsx` (Engineering Briefing)

A **server component** (`force-dynamic`) that queries SQLite directly and renders:

### Data Queries (5 sections)

| Section | SQL | Source |
|---------|-----|--------|
| AI Changes | `category = 'ai' AND source != 'manual' ORDER BY score DESC, published_at DESC LIMIT 5` | `feed_items` |
| Framework Updates | `category IN ('nextjs', 'django') AND source != 'manual' ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Trending Repos | `source = 'github_trending' ORDER BY fetched_at DESC LIMIT 5` | `feed_items` |
| Security | `(category = 'security' OR tags LIKE '%cve%') AND source != 'manual' ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Recommended Tool | `is_read = 0 AND source != 'manual' AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC LIMIT 1` | `feed_items` |

### Stat Cards

4 `StatCard` components (unified, replaces the old `LastIngestionStat` and `TimeWindowStat`):

1. **Total Items** — `COUNT(*)` from `feed_items` (with unread count subtitle)
2. **Last Ingestion** — reads `ingest:last_run:all` from `kv_store`, displays as time ago
3. **Items Today** — `COUNT(*) WHERE date(fetched_at) = date('now')`
4. **Items This Week** — `COUNT(*) WHERE fetched_at >= datetime('now', '-7 days')`

### Ingest Button

An `IngestButton` in the page header triggers `POST /api/ingest` on click, showing a spinner during execution and a `sonner` toast on completion.

### Data Filtering

All homepage queries filter `source != 'manual'` to exclude manually added items from the automated briefing view.

### Intern Tasks

Day-based rotation from `src/config/intern-tasks.ts` (13 tasks). Shows today's task + tomorrow's preview with difficulty badges.

### Component Tree

```
HomePage
├── IngestButton (header — triggers POST /api/ingest)
├── StatCard × 4 (total items, last ingestion, today, week)
├── SectionCard × 4 (AI, Trending, Frameworks, Security)
│   ├── accent bar per section (teal/purple/blue/red)
│   ├── icon bg + count badge per theme
│   └── ItemCard × 5 per section
│       └── left accent bar colored by source (orange/blue/purple)
├── BreakdownCard (sources + categories Nivo bar chart, tabbed)
├── Recommended Tool card
├── Intern Tasks card (today + tomorrow)
└── AutomationStatus
```

## Sub-READMEs

- [Feed Page →](./feed/README.md)
- [Watchlist Page →](./watchlist/README.md)
- [Log Analysis Dashboard →](./logs/README.md)
- [Feed API →](./api/feed/README.md)
- [Watchlist API →](./api/watchlist/README.md)
- [Log Analysis API →](./api/logs/README.md)
- [Ingestion API →](./api/ingest/README.md)
- [Repo Radar →](./repo-radar/README.md)
- [Repo Radar API →](./api/repo-radar/README.md)
