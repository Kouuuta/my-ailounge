# `/components` — UI Components & Dashboard Widgets

Reusable React components used by the Developer Dashboard pages.

## Structure

| Directory | Contents |
|-----------|----------|
| `ui/` | shadcn/ui-style primitives — 10 components (Button, Card, Badge, Input, Select, Tabs, Toggle, Separator, Table, Skeleton) — Navbar removed, replaced by `sidebar/` |
| `engineering-intelligence/` | Dashboard-specific widgets — 4 components (AutomationStatus, BreakdownCard, IngestButton, StatCard). Still exists but homepage now imports from `briefing/` |
| `briefing/` | Engineering Briefing homepage components — 6 components (StatCard, FeedSection, FeaturedNews, FeedBreakdown, InternTasks, AutomationStatus) |
| `sidebar/` | Fixed left sidebar — 1 component (Sidebar) with inline Quick Stats panel |
| `logs/` | Log Analysis Dashboard — 4 components (CsvUpload, OverviewCards, ErrorTrendChart, SourceBreakdown) |
| `theme-provider.tsx` | Dark/light mode React Context (used by Sidebar theme toggle) |

## Shared Utility

All components import `cn()` from `@/lib/utils` — the shadcn pattern using `clsx` + `tailwind-merge`.

There is a second `cn()` at `src/lib/utils.ts` (simple string join) — that one is for ingesters, NOT UI components.

## Conventions

- `ui/` components are standard shadcn/ui — minimal customization from defaults
- `engineering-intelligence/` + `briefing/` + `sidebar/` are custom-built for this project
- `"use client"` where needed: Radix primitives, Sidebar (usePathname), ThemeProvider, FeedBreakdown (Nivo), BreakdownCard, IngestButton, CsvUpload, ErrorTrendChart, SourceBreakdown
- Server components call `getDb()` at request time — no `"use client"` needed

## Sub-READMEs

- [UI Primitives →](./ui/README.md)
- [Dashboard Widgets →](./engineering-intelligence/README.md)
- [Briefing Components →](./briefing/README.md)
- [Sidebar →](./sidebar/README.md)
- [Log Analysis Components →](./logs/README.md)
