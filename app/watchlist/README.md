# `app/watchlist/` — Stack Watchlist

Client-side page for tracking versions and risks across your tech stack. Rendered at `/watchlist`.

## Page — `page.tsx`

A **client component** with a sortable, inline-editable table.

### Table Columns (sortable)

| Column | Type | Editable |
|--------|------|----------|
| Name | Text | No |
| Category | Badge | No |
| Installed | Text | Yes (inline) |
| Latest | Text | Yes (inline) |
| Risk | Select | Yes (dropdown) |
| Notes | Text | Yes (inline) |
| Updated | Date | No |
| Delete | Button | — |

Click any column header to sort ascending/descending. Sort icon indicates active sort.

### Inline Editing — `EditableCell`

Custom component for inline text editing:

- Click to enter edit mode (auto-focuses input)
- Enter to save, Escape to cancel
- Blur to save
- Shows placeholder text (`—` or custom) when empty

### Risk Level

3-tier risk system with visual indicators:

| Level | Icon | Color |
|-------|------|-------|
| Low | `ShieldCheck` | Emerald |
| Medium | `ShieldAlert` | Amber |
| High | `ShieldX` | Rose |

Inline dropdown to change risk level on any item.

### CRUD Operations

| Action | API Call |
|--------|----------|
| List items | `GET /api/watchlist` |
| Add item | `POST /api/watchlist` (name, category, risk_level) |
| Update field | `PATCH /api/watchlist/[id]` (whitelisted fields) |
| Delete item | `DELETE /api/watchlist/[id]` (with confirmation dialog) |

### Add Item Form

Toggle-able form with: Name, Category (select from 6), Risk Level (select). Calls `POST /api/watchlist`.

### Risk Summary Footer

When items exist, shows:
- Total count
- High count with red dot
- Medium count with amber dot
- Low count with green dot

### Empty & Error States

- **Empty**: Icon + "No items tracked yet" + "Add your first item" button
- **Error**: Red banner with error message
- **Loading**: Animated pulse placeholders
