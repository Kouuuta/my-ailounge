# `components/briefing/` — Engineering Briefing Components

6 components for the Engineering Briefing homepage (`app/page.tsx`). Designed with glassmorphism (`bg-card/50 backdrop-blur-xl`), animated entrance (`animate-slide-up`), and an accent color system mapped to content theme.

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
| **FeedBreakdown** | Client (`"use client"`) | Tabbed Nivo bar chart (By Source / By Category) | `sources`, `categories`, `total`, `delay?` |
| **InternTasks** | Server (presentational) | Recommended tool + today/tomorrow intern task cards | `recommendedItem`, `todayTask`, `tomorrowTask`, `delay?` |
| **AutomationStatus** | Server (reads db) | Per-ingester health with animated ping dots | none — reads `getIngestionStatus()` + `getGlobalIngestionStatus()` |

## Server vs Client

5 **Server Components** receive data via props or call `getDb()`:

- `StatCard` — pure presentational
- `FeedSection` — receives `items` array
- `FeaturedNews` — receives `items` array
- `InternTasks` — receives tasks from `src/config/intern-tasks.ts`
- `AutomationStatus` — calls `getIngestionStatus()` which reads from `kv_store`

1 **Client Component** (`"use client"`):

- `FeedBreakdown` — uses `Tabs` from Radix UI + `ResponsiveBar` from `@nivo/bar`

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

### InternTasks

| Prop | Type | Description |
|------|------|-------------|
| `recommendedItem` | `FeedItem \| null` | Top recommended tool/news item |
| `todayTask` | `InternTaskData` | `{ title, description, difficulty }` |
| `tomorrowTask` | `InternTaskData` | `{ title, description, difficulty }` |
| `delay` | `number?` | Animation delay |

- Difficulty badges: `beginner` (emerald), `intermediate` (yellow), `advanced` (red)
- Tasks rotate daily from `src/config/intern-tasks.ts`
