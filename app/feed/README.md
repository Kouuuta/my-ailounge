# `app/feed/` — Full Developer Intelligence Feed

Client-side page for browsing, searching, and managing ingested feed items. Rendered at `/feed`.

## Page — `page.tsx`

A **client component** wrapped in `<Suspense>` (needed for `useSearchParams`).

### Filter Bar

6 filter controls synced to URL query params:

| Filter | Type | URL Param | Values |
|--------|------|-----------|--------|
| Search title | `Input` | `q` | Free text |
| Source | `Select` | `source` | `hn`, `rss`, `github_trending` |
| Category | `Select` | `category` | `ai`, `cloud`, `devops`, `django`, `nextjs`, `hn`, `github`, `security`, `rumors`, `general` |
| Status | `Select` | `is_read` | `0` (unread), `1` (read) |
| Pinned | `Select` | `is_pinned` | `1` (pinned), `0` (unpinned) |
| Clear button | Button | — | Resets all filters |

Includes a **Refresh** button and an item count summary.

### Feed Items

Each item card shows:

- Source badge (color-coded: orange=HN, blue=RSS, purple=GitHub, green=manual)
- Category badge
- Published date
- Score
- Title (clickable, opens in new tab)
- Tags (clickable hover effect)
- Summary (2-line clamp)

### Actions (per item)

| Action | Button | API Call |
|--------|--------|----------|
| Pin/Unpin | Pin icon | `PATCH /api/feed/[id]` with `is_pinned` |
| Read/Unread | Check icon | `PATCH /api/feed/[id]` with `is_read` |
| Delete | Trash icon | `DELETE /api/feed/[id]` (with animated fade-out) |

### Add Item Form

Toggle-able form to manually insert a feed item. Fields: Title, URL, Category (select), Tags (comma-separated). Calls `POST /api/feed`.

### "New Since Last Visit" Badge

Tracks `localStorage` timestamp (`feed_last_visited_at`). Shows count of items fetched after last visit.

### Pagination

"Load more" button appends 50 items. Disabled during loading. Shows `(N of M)` progress.

### Empty & Error States

- **Empty**: "No items found matching your filters"
- **Error**: Red banner with error message
- **Loading**: Skeleton cards via `CardSkeleton`

### Data Flow

```
FeedContent → fetch(`/api/feed?source=&category=&q=&is_read=&is_pinned=&limit=50&offset=N`)
           → receives FeedResponse { items, total, limit, offset }
           → appends or replaces items state
```
