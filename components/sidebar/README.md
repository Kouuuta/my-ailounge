# `components/sidebar/` — Fixed Left Sidebar

Replaces the old top `Navbar` component. Renders a fixed 240px sidebar with branding, navigation, theme toggle, and quick stats.

## Layout

```
┌─────────────────────────────┐
│  Logo + Brand (my-ailounge) │  px-6 py-5, border-b
│  Developer Intelligence     │
├─────────────────────────────┤
│  Nav Items (5)              │  px-3 py-4, space-y-1
│  ● Briefing  (/)            │
│  ● Feed      (/feed)        │
│  ● Stack     (/watchlist)   │
│  ● Logs      (/logs)        │
│  ● Radar     (/repo-radar)  │
├─────────────────────────────┤
│  Theme Toggle (Light/Dark)  │  px-3 mb-2
├─────────────────────────────┤
│  Quick Stats (from /api)    │  px-4 py-4, border-t
│  Total Items    42          │
│  Last Ingest    3h ago      │
│  Today          7 items     │
│  This Week      23 items    │
└─────────────────────────────┘
```

## Component: `Sidebar`

**Type:** Client (`"use client"`) — uses `usePathname()` for active nav detection and `useTheme()` for dark/light toggle.

### Nav Items

5 items defined in `NAV_ITEMS` constant:

| Label | Icon | Path |
|-------|------|------|
| Briefing | `LayoutDashboard` | `/` |
| Feed | `Rss` | `/feed` |
| Stack | `Layers` | `/watchlist` |
| Logs | `ScrollText` | `/logs` |
| Radar | `Radio` | `/repo-radar` |

- Active item highlighted with `bg-accent border border-border shadow-sm`
- Inactive items show `text-muted-foreground`, hover to `text-foreground`

### Sub-component: `SidebarStats`

Fetches `GET /api/stats` on mount and displays 4 rows:

- **Total Items** — count from feed_items
- **Last Ingest** — timestamp displayed as relative time (e.g. "3h ago")
- **Today** — items fetched today
- **This Week** — items fetched this week

Uses a `timeAgo()` helper: `just now` → `Xm ago` → `Xh ago` → `Xd ago` → formatted date.

### Sub-component: `ThemeToggle`

Button inside the sidebar footer that calls `useTheme().toggle()` to cycle dark/light mode. Icon switches between `Sun` and `Moon`.

## State

No React state or URL params — all data is fetched via `fetch("/api/stats")` in a `useEffect`. No loading skeleton (API responds from SQLite — sub-10ms).
