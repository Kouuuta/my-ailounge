# `components/engineering-intelligence/` — Dashboard Widgets

4 custom widgets for the Engineering Briefing homepage (`app/page.tsx`).

## Widget Reference

| Widget | Type | Data Source | Purpose |
|--------|------|-------------|---------|
| **AutomationStatus** | Server | `getIngestionStatus()`, `getGlobalIngestionStatus()` | Per-source status dots (green/red/gray), error count badge, "X ago" timestamps, item count |
| **BreakdownCard** | Client | `getItemsBySource()`, `getItemsByCategory()` | Tabbed panel (By Source / By Category) with percentage bar chart |
| **LastIngestionStat** | Server | `getLastGlobalIngestion()` | Stat card showing "X ago" or "Never" |
| **TimeWindowStat** | Server | `getItemsToday()`, `getItemsThisWeek()` | Stat card for Today (amber/Clock) or This Week (blue/Calendar) |

## Server vs Client

3 widgets are **Server Components** — they query SQLite directly at request time:

- `AutomationStatus` — calls `getIngestionStatus()` which reads from `kv_store`
- `LastIngestionStat` — calls `getLastGlobalIngestion()` which reads from `kv_store`
- `TimeWindowStat` — calls `getItemsToday()` / `getItemsThisWeek()` which use `COUNT(*)` queries

1 widget is a **Client Component** (`"use client"`):

- `BreakdownCard` — uses `Tabs` from Radix UI, which requires browser interactivity

## Props

### BreakdownCard
```ts
interface BreakdownCardProps {
  sources: BreakdownItem[];    // [{ name: string, count: number }]
  categories: BreakdownItem[]; // [{ name: string, count: number }]
  total: number;
  delay?: number;              // animation delay in ms
}
```

### LastIngestionStat
```ts
interface LastIngestionStatProps {
  delay?: number;
}
```

### TimeWindowStat
```ts
interface TimeWindowStatProps {
  window: "today" | "week";
  delay?: number;
}
```

### AutomationStatus
No props — reads all data from `kv_store` internally.
