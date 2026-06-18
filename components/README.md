# `/components` — UI Components & Dashboard Widgets

Reusable React components used by the Developer Dashboard pages.

## Structure

| Directory | Contents |
|-----------|----------|
| `ui/` | shadcn/ui-style primitives — 11 components (Button, Card, Badge, Input, Select, Tabs, Toggle, Separator, Table, Skeleton, Navbar) |
| `engineering-intelligence/` | Dashboard-specific widgets — 4 components (AutomationStatus, BreakdownCard, LastIngestionStat, TimeWindowStat) |
| `theme-provider.tsx` | Dark/light mode React Context (used by Navbar and layout) |

## Shared Utility

All components import `cn()` from `@/lib/utils` — the shadcn pattern using `clsx` + `tailwind-merge`.

There is a second `cn()` at `src/lib/utils.ts` (simple string join) — that one is for ingesters, NOT UI components.

## Conventions

- `ui/` components are standard shadcn/ui — minimal customization from defaults
- `engineering-intelligence/` are custom-built for this project
- `"use client"` is used where needed: Radix primitives, Navbar, ThemeProvider, BreakdownCard
- Server components (AutomationStatus, LastIngestionStat, TimeWindowStat) call `getDb()` at request time — no `"use client"` needed

## Sub-READMEs

- [UI Primitives →](./ui/README.md)
- [Dashboard Widgets →](./engineering-intelligence/README.md)
