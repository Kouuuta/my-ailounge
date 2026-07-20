# `components/prompts/` — Prompt Library Components

2 components used by the Prompt Library page (`app/prompts/page.tsx`).

## Component Reference

| Component | Type | Purpose |
|-----------|------|---------|
| **PromptCard** | Client (`"use client"`) | Expandable card with copy, source badge, category, model rec, usage count |
| **CategoryFilter** | Server (presentational) | Pill-button filter for 9 categories with accent colors |
| **SourceFilter** | Server (presentational) | Pill-button filter for 4 sources (All/Curated/Community/UI Design) |

## PromptCard

A single prompt card in the 3-column grid. Props:

| Prop | Type | Description |
|------|------|-------------|
| `item` | `PromptItem` | Prompt data object |
| `index` | `number` | Grid position for staggered animation delay |
| `expanded` | `boolean` | Whether content is expanded |
| `onToggle` | `() => void` | Expand/collapse handler |
| `onCopy` | `(id: number, content: string) => void` | Copy handler (fires usage_count increment) |

### Card Layout

```
┌──────────────────────────────────────┐
│                          [source badge] │
│  CATEGORY                             │
│  Title                       [📋]    │
│  Description (line-clamp 2)           │
│  [model recommendation]               │
│  ─────────────────────────────────── │
│  Used N times            [▼ More]    │
├──────────────────────────────────────┤
│  (expanded)                           │
│  ┌─ content (pre) ─────────────────┐ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│  Inputs: [field1] [field2]           │
│  Output: description                 │
└──────────────────────────────────────┘
```

### States

- **Default** — collapsed, shows header + description (clamped) + usage count
- **Expanded** — slides down to show full content in `<pre>`, input fields as pills, output description
- **Copy** — copies `item.content` to clipboard, shows toast via `sonner`

### Source Badge

- If `item.source_url` exists: clickable link pointing to the source
- If not: static text badge
- Both use `SOURCE_LABELS` to map source codes to display labels

## CategoryFilter & SourceFilter

### CategoryFilter

9 category buttons with unique accent colors:

| Value | Label | Color |
|-------|-------|-------|
| `code_review` | Code Review | teal |
| `debugging` | Debugging | orange |
| `architecture` | Architecture | purple |
| `incident_analysis` | Incident Analysis | red |
| `refactoring` | Refactoring | blue |
| `security_audit` | Security Audit | rose |
| `documentation` | Documentation | yellow |
| `intern_mentoring` | Intern Mentoring | emerald |
| `stakeholder_emails` | Stakeholder Emails | indigo |

Active state: applies the category's color classes. Inactive: muted with hover.

### SourceFilter

4 source buttons:

| Value | Label |
|-------|-------|
| `""` (empty) | All Sources |
| `curated` | Curated |
| `community` | Community |
| `ui_design` | UI Design |

Active state: dark foreground + light background (inverted). Inactive: card background with hover.

### Exported Constants

| Constant | Type | Description |
|----------|------|-------------|
| `CATEGORIES` | `{ value, label, color }[]` | All 9 categories (includes `""` for "All Categories") |
| `SOURCES` | `{ value, label }[]` | All 4 sources |
| `SOURCE_LABELS` | `Record<string, string>` | Source code → display label mapping |
| `CATEGORY_MAP` | `Record<string, string>` | Category code → display label mapping |

## Data Flow

```
PromptsPage
  ├── CategoryFilter selected → fetchItems with ?category=
  ├── SourceFilter selected → fetchItems with ?source=
  └── PromptCard × N
        ├── onCopy → POST /api/prompts/{id}/use (fire-and-forget)
        └── onToggle → local state expandedId
```
