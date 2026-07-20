# `components/briefing/` — Engineering Briefing Components

8 components for the Engineering Briefing homepage (`app/page.tsx`). Designed with glassmorphism (`bg-card/50 backdrop-blur-xl`), animated entrance (`animate-slide-up`), and an accent color system mapped to content theme.

## Design System

Every component uses shared tokens from `globals.css`:

- **Glassmorphism** — `rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl`
- **Hover** — `hover:-translate-y-1 hover:shadow-lg` (StatCard) or `hover:shadow-lg` (containers)
- **Animation** — `animate-slide-up` with staggered `style={{ animationDelay }}`
- **Accent colors** — teal (ai), purple (trending), blue (framework), red (security)
- **Gradients** — `bg-gradient-to-br` icon containers matching each component's theme

## Component Reference

| Component | Type | Purpose | Props |
|-----------|------|---------|-------|
| **StatCard** | Server (presentational) | KPI with gradient icon, left accent bar, optional subtitle | `label`, `value`, `icon`, `accentColor`, `gradient`, `secondary?`, `delay?` |
| **FeedSection** | Server (presentational) | Categorized feed list with accent header, count badge, empty state | `title`, `icon`, `items`, `viewAllHref?`, `delay?`, `theme` (ai/trending/framework/security) |
| **FeaturedNews** | Server (presentational) | Hero section — large card + 3 secondary cards for pinned items | `items`, `delay?` |
| **FeedBreakdown** | Client (`"use client"`) | Tabbed Nivo bar chart (By Source / By Category) — desktop shows side-by-side, mobile uses tabs | `sources`, `categories`, `total`, `delay?` |
| **InternTasks** | Server (presentational) | Recommended tool + today/tomorrow intern task cards with category badges + "View all →" link | `recommendedItem`, `todayTask`, `tomorrowTask`, `delay?` |
| **StackSummary** | Client (`"use client"`) | Stack Watchlist summary card — fetches `/api/stats`, shows total + high/medium/low risk counts, links to `/watchlist` | none — fetches own data |
| **IngestHealth** | Server (reads db) | Per-ingester health with source icons, ping dots, elapsed times, total DB counts, error badge | none — reads `getIngestionStatus()` + `getGlobalIngestionStatus()` + per-source `COUNT(*)` |
| **FeaturedPrompt** | Server (presentational) | Daily rotating featured prompt card with content, copy button, link to /prompts | `item` (PromptItem \| null), `delay?` |

## Server vs Client

6 **Server Components** receive data via props or call `getDb()`:

- `StatCard` — pure presentational
- `FeedSection` — receives `items` array
- `FeaturedNews` — receives `items` array
- `InternTasks` — receives tasks from `src/config/intern-tasks.ts`
- `IngestHealth` — calls `getIngestionStatus()` + `getGlobalIngestionStatus()` + per-source `COUNT(*)` from DB (replaced `AutomationStatus` in `e331bf9`)
- `FeaturedPrompt` — receives `item` prop from homepage server component

2 **Client Components** (`"use client"`):

- `FeedBreakdown` — uses `Tabs` from Radix UI + `ResponsiveBar` from `@nivo/bar`
- `StackSummary` — fetches `/api/stats` on mount for stack risk counts

## Accent Color Map

| Theme | Border | Icon BG | Text |
|-------|--------|---------|------|
| `ai` | `border-l-teal-500` | `bg-teal-500/20` | `text-teal-600 dark:text-teal-400` |
| `trending` | `border-l-purple-500` | `bg-purple-500/20` | `text-purple-600 dark:text-purple-400` |
| `framework` | `border-l-blue-500` | `bg-blue-500/20` | `text-blue-600 dark:text-blue-400` |
| `security` | `border-l-red-500` | `bg-red-500/20` | `text-red-600 dark:text-red-400` |

## Source Badge Colors

Used by `FeaturedNews` for source labels on cards:

- `hn` — orange-500/10 background, orange text
- `github_trending` — purple-500/10 background, purple text
- `rss` — blue-500/10 background, blue text

## Props Detail

### StatCard

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Display label below the value |
| `value` | `string \| number` | Large bold value |
| `icon` | `React.ElementType` | Lucide icon component |
| `accentColor` | `string` | Tailwind border color e.g. `"bg-emerald-500"` |
| `gradient` | `string` | Tailwind gradient e.g. `"from-emerald-500 to-teal-500"` |
| `secondary` | `string?` | Optional subtitle below label |
| `delay` | `number?` | Animation delay in ms |

### FeedSection

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Section heading |
| `icon` | `React.ElementType` | Lucide icon in header |
| `items` | `FeedItem[]` | Items to render as cards |
| `viewAllHref` | `string?` | Link to filtered feed page |
| `delay` | `number?` | Animation delay in ms |
| `theme` | `"ai" \| "trending" \| "framework" \| "security"` | Accent color theme |

### FeedBreakdown

| Prop | Type | Description |
|------|------|-------------|
| `sources` | `BreakdownItem[]` | `[{ name: string, count: number }]` |
| `categories` | `BreakdownItem[]` | `[{ name: string, count: number }]` |
| `total` | `number` | Total for percentage calculation |
| `delay` | `number?` | Animation delay |

- Uses Nivo `ResponsiveBar` with horizontal layout, per-name color hash
- Source colors: hn=orange, github_trending=purple, rss=blue
- **Layout:** Desktop (≥1024px) shows sources and categories side-by-side; mobile uses tabs

### InternTasks

| Prop | Type | Description |
|------|------|-------------|
| `recommendedItem` | `FeedItem \| null` | Top recommended tool/news item |
| `todayTask` | `InternTaskData` | `{ title, description, difficulty, category }` |
| `tomorrowTask` | `InternTaskData` | `{ title, description, difficulty, category }` |
| `delay` | `number?` | Animation delay |

- Difficulty badges: `beginner` (emerald), `intermediate` (amber), `advanced` (red)
- Category badges: synthetic-data (purple), mock-apis (blue), local-db (emerald), code-review (orange), docs-research (pink), git-workflow (cyan)
- Tasks rotate daily from `src/config/intern-tasks.ts`
- Includes "View all →" link at bottom that routes to `/intern-tasks`

### StackSummary

**Type:** Client (`"use client"`) — fetches data via `useEffect`.

| Prop | Type | Description |
|------|------|-------------|
| (none) | — | Fetches `/api/stats` on mount, reads `stackTotal`, `stackHigh`, `stackMedium`, `stackLow` |

- Renders as a clickable card linking to `/watchlist`
- Shows total item count plus per-risk-level breakdown with colored icons
- **Hidden** when `total === 0` (no items tracked yet)
- Icons: `ShieldX` (rose) for high, `ShieldAlert` (amber) for medium, `ShieldCheck` (emerald) for low

### IngestHealth

**Type:** Server — reads DB directly (no `"use client"`).

| Prop | Type | Description |
|------|------|-------------|
| (none) | — | Reads `getIngestionStatus()` + `getGlobalIngestionStatus()` + per-source `COUNT(*)` via `supabase` |

- Source config: hn → Radio (orange), github_trending → TrendingUp (purple), rss → Rss (blue), repo_radar → Radar (teal)
- Status dot: green with `animate-ping` when ok, red when error, gray when no data
- Empty state: "No data. Run `npm run ingest`"
- Header badge: "Healthy" (emerald) for 0 errors, "N error(s)" (red) otherwise
- Replaced `AutomationStatus` in commit `e331bf9`

### FeaturedPrompt

**Type:** Server (presentational).

| Prop | Type | Description |
|------|------|-------------|
| `item` | `PromptItem \| null` | Featured prompt object with `title`, `content`, `category`, `usage_count` |
| `delay` | `number?` | Animation delay in ms |

- Renders a glassmorphism card with the featured prompt title, category badge, content preview, and a "View in Library" link to `/prompts`
- Includes a copy button for the prompt content
- When `item` is null, renders nothing (hidden)
