# `app/api/watchlist/` — Watchlist API Routes

CRUD API for Stack Watchlist version/risk tracking. Two route files.

## List & Create — `route.ts`

### `GET /api/watchlist`

List all watchlist items ordered by `category ASC, name ASC`.

**Response:**

```json
{
  "items": [
    { "id": 1, "name": "Next.js", "category": "framework", "risk_level": "low", ... }
  ]
}
```

### `POST /api/watchlist`

Add a new watchlist item.

**Request body:**

```json
{
  "name": "string (required, unique)",
  "category": "string (default: null)",
  "installed_version": "string | null",
  "latest_version": "string | null",
  "risk_level": "'low' | 'medium' | 'high' (default: 'low')",
  "upgrade_notes": "string | null",
  "known_vulns": "string | null",
  "migration_link": "string | null"
}
```

**Responses:**

| Status | Body |
|--------|------|
| 201 | `{ "ok": true, "id": 3 }` |
| 400 | `{ "error": "name is required" }` or `{ "error": "risk_level must be low, medium, or high" }` |
| 409 | `{ "error": "Item with this name already exists" }` |

UNIQUE constraint on `name`. Invalid risk_level returns 400.

---

## Update & Delete — `[id]/route.ts`

### `PATCH /api/watchlist/[id]`

Update specific fields. Only these 8 fields are accepted:

```
name, category, installed_version, latest_version,
risk_level, upgrade_notes, known_vulns, migration_link
```

**Request body** (any subset):

```json
{
  "installed_version": "19.2.1",
  "latest_version": "20.0.0",
  "risk_level": "high"
}
```

Auto-sets `updated_at = datetime('now')` on every update.

Risk level is validated: `low`, `medium`, or `high` only.

**Responses:**

| Status | Body |
|--------|------|
| 200 | `{ "ok": true, "item": { ...updated item... } }` |
| 400 | `{ "error": "No fields to update" }` or invalid risk_level |
| 404 | `{ "error": "Item not found" }` |

### `DELETE /api/watchlist/[id]`

Remove a watchlist item.

**Responses:**

| Status | Body |
|--------|------|
| 200 | `{ "ok": true }` |
| 404 | `{ "error": "Item not found" }` |
