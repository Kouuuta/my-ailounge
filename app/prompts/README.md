# `app/prompts/` — Prompt Library Page

A **client component** (`"use client"`) for browsing, searching, and managing engineering prompts. Uses a 3-column card grid with live search, category/source filtering, and inline add form.

## Route

| Path | File | Type | Description |
|------|------|------|-------------|
| `/prompts` | `page.tsx` | Client | Prompt Library — browse, search, add, copy, expand prompts |

## Page Features

### Filtering (3 dimensions)

| Filter | UI | Behavior |
|--------|----|----------|
| **Search** | Text input + Search button | Matches `title LIKE %search%` or `description LIKE %search%` |
| **Category** | Pill buttons (9 categories + "All") | Each with accent color; click to filter |
| **Source** | Pill buttons (All / Curated / Community / UI Design) | Dark foreground when active |

Clear filters button appears when any filter is active.

### Card Grid

3-column responsive grid (2-col tablet, 1-col mobile) with staggered `animate-slide-up` entrance. Each `PromptCard` shows:

- **Source badge** — top-right, links to source URL if available
- **Category label** — uppercase pill
- **Title** — bold, linked to expanded content
- **Copy button** — clipboard icon, copies prompt content, also fires `POST /api/prompts/{id}/use`
- **Description** — 2-line clamped
- **Model recommendation** — badge if present
- **Usage count** — bottom-left
- **Expand/Collapse** — toggles full content, input fields, output description

### Add Prompt Form

Inline form toggled by "Add Prompt" button. Fields:

- **Title** * (required)
- **Category** * (required, dropdown of 9 categories)
- **Content** * (required, textarea)
- **Description**, **Input Fields**, **Output Description**, **Model Recommendation** (optional)

Client-side validation with inline error messages. On submit: `POST /api/prompts`, toast on success, resets form.

### States

| State | UI |
|-------|----|
| **Loading** | 6 skeleton cards with pulse animation |
| **Empty (no filters)** | "The prompt library is empty" message |
| **Empty (with filters)** | "Try a different filter" + Clear filters button |
| **Populated** | 3-col card grid with count footer |

### URL Params

All filter state is local (no URL sync). Filters reset on page reload.

## Data Flow

```
PromptsPage (client)
  ├─ useEffect → fetch("/api/prompts?category=&source=&search=")
  ├─ AddPromptForm → POST /api/prompts → refetch
  └─ PromptCard.onCopy → POST /api/prompts/{id}/use (fire-and-forget)
```

## Component Tree

```
PromptsPage
├── AddPromptForm
│   └── inline form (title, category, content, description, input_fields, output_description, model_recommendation)
├── Search bar (input + button + clear)
├── SourceFilter (All / Curated / Community / UI Design)
├── CategoryFilter (9 category pills with accent colors)
├── PromptCard × N
│   ├── source badge (top-right)
│   ├── category pill
│   ├── title + copy button
│   ├── description (clamped)
│   ├── model recommendation badge
│   ├── usage count + expand/collapse
│   └── expanded: content (pre), input fields, output description
└── count footer
```

## API Dependencies

All data interaction is through `/api/prompts`:

| Endpoint | Trigger |
|----------|---------|
| `GET /api/prompts` | On mount, filter change, after add |
| `POST /api/prompts` | Add form submit |
| `POST /api/prompts/{id}/use` | Copy click |
