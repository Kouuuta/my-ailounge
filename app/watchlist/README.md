# `app/watchlist/` — Stack Watchlist

Client-side page for tracking versions, risks, and resources across your tech stack. Rendered at `/watchlist`.

## Page — `page.tsx`

A **client component** with expandable rows, inline editing, and a sortable/searchable table.

### Search

A search input at the top filters items by `name`, `category`, or `upgrade_notes` (case-insensitive substring). Shows `N of M` count when search is active.

### Table Columns (sortable by clicking header)

| Column | Content | Editable? |
|--------|---------|-----------|
| (chevron) | Expand/collapse row | — |
| Name | Text | No |
| Category | Badge | No |
| Version Health | `installed → latest` with Drift badge (patch behind / minor behind / major update / up to date) | No (editable in expanded panel) |
| Vulns | Text count (rose when nonzero) | No (editable in expanded panel) |
| Risk | Badge with icon + tooltip (ShieldCheck emerald / ShieldAlert amber / ShieldX rose) | No (editable in expanded panel) |
| Last Checked | Relative time (e.g., "2h ago") | No |
| Links | npm / GitHub / Docs icons (auto-detected from name, opens new tab) | No |
| Delete | Trash icon (with confirm dialog) | — |

### Version Health

Semver comparison between `installed_version` and `latest_version`:

| Status | Badge | Color |
|--------|-------|-------|
| Up to date | "Up to date" | Emerald |
| Patch behind | "N patch(es) behind" | Amber |
| Minor behind | "N minor behind" | Orange |
| Major update | "Major update" | Rose |
| Unknown | `—` | Muted |

Version strings are parsed by stripping leading `v` and splitting on `.`. Missing or unparseable versions show `—`.

### Expanded Panel

Click the chevron on any row to reveal an inline editing panel with 6 editable fields:

| Field | Label | Placeholder |
|-------|-------|-------------|
| `installed_version` | Installed | `—` |
| `latest_version` | Latest | `—` |
| `known_vulns` | Known Vulns | `—` |
| `risk_reason` | Risk Reason | "Add reason..." |
| `upgrade_notes` | Upgrade Notes | "Add note..." |
| `migration_link` | Migration Link | "URL..." (shows ExternalLink icon when filled) |

Each field uses the `EditableField` component: click to enter edit mode (auto-focus), Enter/Blur to save, Escape to cancel.

### CRUD Operations

| Action | API Call |
|--------|----------|
| List items | `GET /api/watchlist` |
| Add item | `POST /api/watchlist` (name, category, risk_level, risk_reason) — also triggers `retroactivelyScore()` |
| Update field | `PATCH /api/watchlist/[id]` (whitelisted fields: name, category, installed_version, latest_version, risk_level, risk_reason, upgrade_notes, known_vulns, migration_link) |
| Delete item | `DELETE /api/watchlist/[id]` (with confirmation dialog, animated fade-out) |

### Add Item Form

Toggle-able form with: Name (required), Category (select from 6), Risk Level (select: low/medium/high), Risk Reason (optional). Calls `POST /api/watchlist`.

### Resource Links

Auto-detected based on item name. Common packages have hardcoded URLs (Next.js, React, Tailwind CSS, TypeScript, Supabase, PostgreSQL, Vite, Python, Django, Docker, Redis, Nginx, AWS, Node.js). Unrecognized names generate generic `npm`/`GitHub` URLs by slugifying the name.

### Risk Summary Footer

When items exist, shows total count + per-level counts with colored dots:
- High count with red dot
- Medium count with amber dot
- Low count with green dot

### Empty & Error States

- **Empty**: Icon + "No items tracked yet" + "Add your first item" button
- **Empty with search**: "No items match your search."
- **Error**: Red banner with error message
- **Loading**: Animated pulse placeholders (6 rows)
- **Deleting**: Fade-out animation on deleted row
