# `/app` — Next.js App Router Pages & API Routes

The UI and API layer for the Developer Dashboard. Built with Next.js App Router (Pages + Route Handlers).

## Route Map

| Path | File | Type | Description |
|------|------|------|-------------|
| `/` | `page.tsx` | Server | Engineering Briefing homepage |
| `/feed` | `feed/page.tsx` | Client (Suspense) | Full Developer Intelligence Feed |
| `/watchlist` | `watchlist/page.tsx` | Client | Stack Watchlist manager |
| `GET /api/feed` | `api/feed/route.ts` | Route Handler | List feed items with filters |
| `POST /api/feed` | `api/feed/route.ts` | Route Handler | Create a feed item |
| `PATCH /api/feed/[id]` | `api/feed/[id]/route.ts` | Route Handler | Update a feed item |
| `DELETE /api/feed/[id]` | `api/feed/[id]/route.ts` | Route Handler | Delete a feed item |
| `GET /api/watchlist` | `api/watchlist/route.ts` | Route Handler | List watchlist items |
| `POST /api/watchlist` | `api/watchlist/route.ts` | Route Handler | Add a watchlist item |
| `PATCH /api/watchlist/[id]` | `api/watchlist/[id]/route.ts` | Route Handler | Update a watchlist item |
| `DELETE /api/watchlist/[id]` | `api/watchlist/[id]/route.ts` | Route Handler | Remove a watchlist item |

## Root Layout — `layout.tsx`

Wraps all pages with:

- **Metadata** — title `Mind You Dashboard`, description `Developer Intelligence Dashboard`
- **ThemeProvider** — dark/light mode toggle (from `components/theme-provider`)
- **Navbar** — top navigation (from `components/ui/navbar`)

```tsx
<ThemeProvider>
  <Navbar />
  {children}
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
| AI Changes | `category = 'ai' ORDER BY score DESC, published_at DESC LIMIT 5` | `feed_items` |
| Framework Updates | `category IN ('nextjs', 'django') ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Trending Repos | `source = 'github_trending' ORDER BY fetched_at DESC LIMIT 5` | `feed_items` |
| Security | `category = 'security' OR tags LIKE '%cve%' ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Recommended Tool | `is_read = 0 AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC LIMIT 1` | `feed_items` |

### Stat Cards

4 top-level stats:

1. **Total Items** — `COUNT(*)` from `feed_items`
2. **Last Ingestion** — via `LastIngestionStat` component (from `components/engineering-intelligence/`)
3. **Today** — via `TimeWindowStat` with `window="today"`
4. **This Week** — via `TimeWindowStat` with `window="week"`

### Intern Tasks

Day-based rotation from `src/config/intern-tasks.ts` (13 tasks). Shows today's task + tomorrow's preview with difficulty badges.

### Component Tree

```
HomePage
├── StatCard × 4 (total items, last ingestion, today, week)
├── SectionCard × 4 (AI, Trending, Frameworks, Security)
│   └── ItemCard × 5 per section
├── BreakdownCard (sources + categories pie/donut)
├── Recommended Tool card
├── Intern Tasks card (today + tomorrow)
└── AutomationStatus
```

## Sub-READMEs

- [Feed Page →](./feed/README.md)
- [Watchlist Page →](./watchlist/README.md)
- [Feed API →](./api/feed/README.md)
- [Watchlist API →](./api/watchlist/README.md)
