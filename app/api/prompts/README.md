# `app/api/prompts/` — Prompt Library API

4 route groups for the Prompt Library: listing/creating prompts, featured rotation, single-item CRUD, and usage tracking.

## Route Table

| Method | Path | File | Description |
|--------|------|------|-------------|
| `GET` | `/api/prompts` | `route.ts` | List prompts (filters: category, source, search) |
| `POST` | `/api/prompts` | `route.ts` | Create a prompt |
| `GET` | `/api/prompts/featured` | `featured/route.ts` | Daily rotating featured prompt |
| `GET` | `/api/prompts/{id}` | `[id]/route.ts` | Get single prompt |
| `PATCH` | `/api/prompts/{id}` | `[id]/route.ts` | Update prompt fields |
| `DELETE` | `/api/prompts/{id}` | `[id]/route.ts` | Delete a prompt |
| `POST` | `/api/prompts/{id}/use` | `[id]/use/route.ts` | Increment usage_count |

## GET /api/prompts

Query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category code (e.g. `code_review`) |
| `source` | string | Filter by source (`curated`, `community`, `ui_design`) |
| `search` | string | LIKE search on title and description |

Default ordering: **curated first**, then by `usage_count DESC`, then `created_at DESC`.

Response: `{ items: PromptItem[] }`

## POST /api/prompts

Creates a new prompt. Required fields: `title`, `content`, `category`. Optional: `description`, `input_fields`, `output_description`, `model_recommendation`.

Returns `{ ok: true, item }` with status 201 on success, `{ error }` with 400/500 on failure.

## GET /api/prompts/featured

Returns one daily-rotating featured prompt:

1. Counts prompts where `is_featured = 1 AND source = 'curated'`
2. If none: fallback to `most used curated prompt`
3. Otherwise: `offset = dayOfYear % count` for deterministic daily rotation

Response: `{ item: PromptItem | null }`

## PATCH /api/prompts/{id}

Partial update. Accepts any subset of: `title`, `content`, `category`, `description`, `input_fields`, `output_description`, `model_recommendation`, `is_featured`.

Sets `updated_at = datetime('now')` automatically.

Returns 404 if not found, `{ ok: true, item }` on success.

## DELETE /api/prompts/{id}

Hard-deletes a prompt. Returns 404 if not found, `{ ok: true }` on success.

## POST /api/prompts/{id}/use

Increments `usage_count` by 1 for the given prompt ID. Sets `updated_at = datetime('now')`.

Returns 404 if not found, `{ ok: true, item }` on success.

## Data Flow

```
PromptsPage → GET /api/prompts (on mount / filter change)
            → POST /api/prompts (add form)
            → POST /api/prompts/{id}/use (on copy)

Homepage    → GET /api/prompts/featured (FeaturedPrompt widget)
```
