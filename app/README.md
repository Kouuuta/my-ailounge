# `/app` — Next.js App Router Pages & API Routes

The UI and API layer for the Developer Dashboard. Built with Next.js App Router (Pages + Route Handlers).

## Route Map

| Path | File | Type | Description |
|------|------|------|-------------|
| `/` | `page.tsx` | Server | Engineering Briefing homepage |
| `/login` | `login/page.tsx` | Client (Suspense) | Sign in — email/password + GitHub OAuth |
| `/signup` | `signup/page.tsx` | Client | Create account — email/password only |
| `/feed` | `feed/page.tsx` | Client (Suspense) | Full Developer Intelligence Feed |
| `/watchlist` | `watchlist/page.tsx` | Client | Stack Watchlist manager |
| `/logs` | `logs/page.tsx` | Client | Log Analysis Dashboard (upload + explore Zoho/Acuity CSV logs) |
| `/intern-tasks` | `intern-tasks/page.tsx` | Client | Intern Safe Task Board — read-only task catalog |
| `/repo-radar` | `repo-radar/page.tsx` | Client | Repo Radar — track GitHub repos (stars, releases, PRs, issues) |
| `/prompts` | `prompts/page.tsx` | Client | Prompt Library — browse, search, add, copy, expand prompts |
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
| `GET /auth/callback` | `auth/callback/route.ts` | Route Handler | OAuth callback — exchanges code for session |
| `POST /api/ingest` | `api/ingest/route.ts` | Route Handler | Trigger on-demand ingestion (calls `runAll()`) |
| `GET /api/repo-radar` | `api/repo-radar/route.ts` | Route Handler | List tracked repos |
| `POST /api/repo-radar` | `api/repo-radar/route.ts` | Route Handler | Add a repo to track (fetches GitHub API) |
| `PATCH /api/repo-radar/[id]` | `api/repo-radar/[id]/route.ts` | Route Handler | Update repo notes or is_active |
| `DELETE /api/repo-radar/[id]` | `api/repo-radar/[id]/route.ts` | Route Handler | Remove a tracked repo |
| `POST /api/repo-radar/refresh` | `api/repo-radar/refresh/route.ts` | Route Handler | Refresh all tracked repos from GitHub API |
| `GET /api/stats` | `api/stats/route.ts` | Route Handler | Aggregate counts + last ingest (consumed by sidebar Quick Stats) |
| `GET /api/prompts` | `api/prompts/route.ts` | Route Handler | List prompts (filters: category, source, search) |
| `POST /api/prompts` | `api/prompts/route.ts` | Route Handler | Create a prompt |
| `GET /api/prompts/featured` | `api/prompts/featured/route.ts` | Route Handler | Daily rotating featured prompt |
| `GET /api/prompts/[id]` | `api/prompts/[id]/route.ts` | Route Handler | Get single prompt |
| `PATCH /api/prompts/[id]` | `api/prompts/[id]/route.ts` | Route Handler | Update prompt fields |
| `DELETE /api/prompts/[id]` | `api/prompts/[id]/route.ts` | Route Handler | Delete a prompt |
| `POST /api/prompts/[id]/use` | `api/prompts/[id]/use/route.ts` | Route Handler | Increment usage_count |

## Root Layout — `layout.tsx`

Wraps all pages with:

- **Metadata** — title `Mind You Dashboard`, description `Developer Intelligence Dashboard`
- **Google Fonts** — Space Grotesk (display), Inter (sans), JetBrains Mono (mono) set as CSS variables
- **ThemeProvider** — dark/light mode toggle (from `components/theme-provider`)
- **AuthProvider** — Supabase Auth context (from `components/auth-provider`), provides `useUser()` with `{ user, loading, signOut }`
- **Shell** — layout wrapper (from `components/shell`) that hides `Sidebar` on `/login` and `/signup` routes
- **Sidebar** — fixed left sidebar (240px) with nav, theme toggle, quick stats, user avatar + logout (from `components/sidebar/sidebar`)
- **Toaster** — toast notifications via `sonner` (used by `IngestButton` and future components)
- **CommandPalette** — Cmd+K keyboard palette for quick navigation and search (from `components/command-palette`)

```tsx
<ThemeProvider>
  <AuthProvider>
    <Shell>
      {children}
      <CommandPalette />
      <Toaster position="top-right" richColors />
    </Shell>
  </AuthProvider>
</ThemeProvider>
```

## Global Styles — `globals.css`

Tailwind v4 with `@theme inline` custom tokens:

- **Color system** — CSS variables for `--background`, `--foreground`, `--card`, `--primary`, `--accent-vibrant`, etc. with `.dark` overrides
- **Font variables** — `--font-display` (Space Grotesk), `--font-sans` (Inter), `--font-mono` (JetBrains Mono)
- **Accent palette** — 6 semantic accent colors: teal, purple, blue, orange, red, yellow + surface-2
- **Dark mode** — pure dark base (`#08080f`), teal-green primary (`#00d4aa`), rgba borders with opacity
- **Background** — dot grid pattern via `radial-gradient` on body
- **Animations** — `fade-in`, `slide-up`, `slide-down`, `scale-in`, `shimmer`, `pulse-glow`
- **Animation easings** — `spring` (cubic-bezier), `out-expo`
- **Reduced motion** — all animations disabled via `prefers-reduced-motion`

## Homepage — `page.tsx` (Engineering Briefing)

A **server component** (`force-dynamic`) that queries Supabase PostgreSQL (migrated from SQLite in June 2026) and renders:

### Data Queries (5 feed sections + featured)

| Section | SQL | Source |
|---------|-----|--------|
| AI Changes | `category = 'ai' AND source != 'manual' ORDER BY score DESC, published_at DESC LIMIT 5` | `feed_items` |
| Framework Updates | `category IN ('nextjs', 'django') AND source != 'manual' ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Trending Repos | `source = 'github_trending' ORDER BY fetched_at DESC LIMIT 5` | `feed_items` |
| Security | `(category = 'security' OR tags LIKE '%cve%') AND source != 'manual' ORDER BY published_at DESC LIMIT 5` | `feed_items` |
| Recommended Tool | `is_read = 0 AND source != 'manual' AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC LIMIT 1` | `feed_items` |
| Featured (pinned) | `is_pinned = 1 AND source != 'manual' ORDER BY published_at DESC, fetched_at DESC LIMIT 4` | `feed_items` |
| Featured Prompt | `is_featured = 1 AND source = 'curated' ORDER BY id LIMIT 1` | `prompts` |

### Stack Summary

A `StackSummary` component from `components/briefing/stack-summary.tsx` renders between the stat cards and featured news. Fetches `/api/stats` for `stackTotal`, `stackHigh`, `stackMedium`, `stackLow` and displays a clickable card linking to `/watchlist`.

### Stat Cards

4 `StatCard` components from `components/briefing/stat-card.tsx`:

1. **Total Items** — `supabase.from("feed_items").select("*", { count: "exact", head: true })` (with unread count subtitle)
2. **Last Ingestion** — reads `ingest:last_run:all` from `kv_store`, displays as time ago
3. **Items Today** — `.gte("fetched_at", todayISO).lt("fetched_at", tomorrowISO)` date range filter
4. **Items This Week** — `.gte("fetched_at", weekAgoISO)` date comparison

> **Migration note:** These were originally raw SQLite queries (`COUNT(*)`, `date('now')`, `datetime('now', '-7 days')`). Now all use Supabase async filters.

### Ingest Button

An `IngestButton` in the page header (from `components/engineering-intelligence/ingest-button.tsx`) triggers `POST /api/ingest` on click, showing a spinner during execution and a `sonner` toast on completion.

### Data Filtering

All homepage queries filter `source != 'manual'` to exclude manually added items from the automated briefing view.

### Intern Tasks

Day-based rotation from `src/config/intern-tasks.ts` (13 tasks). Shows today's task + tomorrow's preview with difficulty badges. Rendered via `components/briefing/intern-tasks.tsx`.

### Component Tree

```
HomePage
├── IngestButton (header — triggers POST /api/ingest)
├── StatCard × 4 (total items, last ingestion, today, week)
├── StackSummary (clickable card with stack risk counts)
├── FeaturedNews (hero section — top pinned item + 3-grid)
├── FeedSection × 4 (AI, Trending, Frameworks, Security)
│   ├── accent bar per section (teal/purple/blue/red)
│   ├── icon bg + count badge per theme
│   └── ItemCard × 5 per section
├── FeedBreakdown (sources + categories Nivo bar chart — desktop side-by-side, mobile tabs)
├── InternTasks (recommended tool + today/tomorrow)
├── FeaturedPrompt (daily rotating prompt card, links to /prompts)
└── AutomationStatus (per-ingester health with ping dots)
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
- [Stats API →](./api/stats/README.md)
- [Prompt Library →](./prompts/README.md)
- [Prompt Library API →](./api/prompts/README.md)
- [Intern Tasks →](./intern-tasks/README.md)
- [Login →](./login/README.md)
- [Signup →](./signup/README.md)
- [Auth Callback →](./auth/README.md)
