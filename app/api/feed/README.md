# `app/api/feed/` — Feed API Routes

CRUD API for the Developer Intelligence Feed. Two route files.

## List & Create — `route.ts`

### `GET /api/feed`

List feed items with filtering and pagination.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | string | — | Filter by source (`manual`, `hn`, `rss`, `github_trending`) |
| `category` | string | — | Filter by category |
| `tag` | string | — | Filter by tag substring (LIKE) |
| `q` | string | — | Search title substring (LIKE) |
| `is_read` | `"0"` / `"1"` | — | Filter read/unread |
| `is_pinned` | `"0"` / `"1"` | — | Filter pinned/unpinned |
| `limit` | number | 50 | Max items (capped at 200) |
| `offset` | number | 0 | Pagination offset |

**Response:**

```json
{
  "items": [{ "id": 1, "source": "hn", "title": "...", ... }],
  "total": 142,
  "limit": 50,
  "offset": 0
}
```

Items are ordered by `is_pinned DESC, published_at DESC, fetched_at DESC`.

### `POST /api/feed`

Insert a new feed item.

**Request body:**

```json
{
  "title": "string (required)",
  "url": "string (required)",
  "category": "string (default: 'general')",
  "source": "string (default: 'manual')",
  "summary": "string | null",
  "tags": "string | null",
  "score": "number | null"
}
```

**Responses:**

| Status | Body |
|--------|------|
| 201 | `{ "ok": true, "id": 5 }` |
| 400 | `{ "error": "title and url are required" }` |
| 409 | `{ "error": "Duplicate entry (source + url already exists)" }` |

UNIQUE constraint on `(source, url)` prevents duplicates. `published_at` defaults to `datetime('now')`.

---

## Update & Delete — `[id]/route.ts`

### `PATCH /api/feed/[id]`

Update specific fields on a feed item.

**Request body** (any of):

```json
{
  "title": "string",
  "summary": "string",
  "tags": "string",
  "category": "string",
  "score": "number",
  "is_read": true,
  "is_pinned": false
}
```

`is_read` and `is_pinned` are coerced to 0/1 integers.

**Responses:**

| Status | Body |
|--------|------|
| 200 | `{ "ok": true, "item": { ...updated item... } }` |
| 400 | `{ "error": "No fields to update" }` |
| 404 | `{ "error": "Item not found" }` |

### `DELETE /api/feed/[id]`

Remove a feed item.

**Responses:**

| Status | Body |
|--------|------|
| 200 | `{ "ok": true }` |
| 404 | `{ "error": "Item not found" }` |
