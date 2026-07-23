# Documentation Hub

Welcome to the centralized documentation directory for the MindYou AI Lounge repository.

This folder contains onboarding guides, architecture references, research materials, dashboard planning documents, AI tooling resources, and project audits.

---

## Recommended Reading Order for New Interns

1. **`getting-started/INSTRUCTIONS.md`** — Set up your dev environment (GitHub Copilot, opencode CLI, Gemini CLI).
2. **`../README.md`** (root) — Understand the project purpose and high-level structure.
3. **`../src/README.md`** — Learn the data pipeline flow (config → ingesters → lib → db).
4. **`../src/db/README.md`** — Understand the SQLite schema (3 tables, columns, indexes, seed data).
5. **`../src/ingesters/README.md`** — See how feed data is fetched and stored (4 ingesters, orchestrator).
6. **`../src/lib/README.md`** — Review shared utilities (DB writes, markdown append, analytics queries).
7. **`guides/developer-dashboard.md`** — Read the dashboard spec (modules, audiences, requirements).
8. **`feeds/feeds-format-guide.md`** — Learn the markdown feed format for manual entries.
9. **`tooling/agentic-coding-attribute-matrix.md`** — Understand AI coding patterns used in this repo.

---

## Getting Started

| Doc | Description |
|-----|-------------|
| `getting-started/INSTRUCTIONS.md` | Full developer onboarding: GitHub Copilot, opencode CLI, Gemini CLI, model selection, troubleshooting |
| `getting-started/AI-installation-tutorial.md` | Quick 10-minute setup for opencode and Gemini CLI tools |

---

## Core Architecture

| Doc | Description |
|-----|-------------|
| `../README.md` (root) | Project overview, high-level structure, scripts |
| `../src/README.md` | Data pipeline overview: config → ingesters → lib → db, directory relationships, quickstart commands, module status |
| `guides/File architecture update.md` | Repository folder reorganization plan and execution guide |
| `guides/RnD_Technical_Tasks_Overview.md` | R&D technical task inventory and planning overview |

---

## Database

| Doc | Description |
|-----|-------------|
| `../src/db/README.md` | SQLite layer: `better-sqlite3` with WAL mode, `getDb()` singleton, all 3 table schemas (`feed_items`, `kv_store`, `watchlist_items`) with columns, indexes, unique constraints, seed data (14 watchlist items), migration entry point |

---

## Feed Ingestion

| Doc | Description |
|-----|-------------|
| `../src/ingesters/README.md` | Full ingestion pipeline: architecture diagram, 4 ingesters (manual-feeds, rss, hacker-news, github-trending) with format/source/commands, RSS feed URL list (12 feeds, 5 categories), HN Algolia API details, orchestrator + kv_store key schema, how to add a new RSS feed |
| `../src/lib/README.md` | Shared utilities: `IngestEntry` interface, `upsertEntry()` dedup logic, `appendToFeed()` markdown writer with 500-line trim, `cn()` CSS utility |
| `feeds/feeds-format-guide.md` | Standard markdown feed entry format and manual editing rules |

---

## Analytics

| Doc | Description |
|-----|-------------|
| `../src/lib/README.md` (analytics section) | 8 analytics functions (`getTotalItems`, `getItemsToday`, `getItemsThisWeek`, `getItemsBySource`, `getItemsByCategory`, `getIngestionStatus`, `getLastGlobalIngestion`, `getGlobalIngestionStatus`) with SQL snippets and return types |

---

## Dashboard

| Doc | Description |
|-----|-------------|
| `guides/developer-dashboard.md` | Dashboard requirements specification: 3 audiences (lead devs, interns, team), 8 modules with feature descriptions, non-binding stack suggestions |

---

## Watchlist

| Doc | Description |
|-----|-------------|
| `../src/db/README.md` (watchlist_items table) | `watchlist_items` table schema: columns, risk levels, seed data (14 items) |

> No dedicated watchlist feature guide exists yet. See `internal/documentation-audit-v2.md` for the gap.

---

## Google Chat Automation

| Doc | Description |
|-----|-------------|
| `gchat-automation/gchat-automation-docs/architecture.md` | System architecture: Google Apps Script, Chat webhooks, time-based triggers |
| `gchat-automation/gchat-automation-docs/google-chat-tech-updates-automation.md` | Problem statement, requirements, and solution design for daily tech updates automation |
| `gchat-automation/gchat-automation-docs/deployment-guide.md` | Deployment steps for Google Chat Automation: prerequisites, setup, configuration |
| `gchat-automation/gchat-automation-docs/developer-intelligence-feed-google-api-notes.md` | Feasibility notes applying Google Chat API patterns to the Developer Intelligence Feed |
| `gchat-automation/gchat-automation-docs/progress-reporting-investigation.md` | Investigation into automatic progress report generation from daily updates |

---

## AI Tooling & Prompt Engineering

| Doc | Description |
|-----|-------------|
| `tooling/oh-my-opencode-models.md` | Agent role definitions and model selection guide for opencode (Sisyphus, Architect, etc.) |
| `tooling/reference-prompts.md` | Curated prompts for AI agents in Django/DRF/Celery workflows |
| `tooling/CONTEXT-ENGINEERING.md` | Principles and practices for designing AI-readable documentation and repository context |
| `tooling/WARP.md` | Warp.dev terminal integration and agent workflow guidance |
| `tooling/agentic-coding-attribute-matrix.md` | AI coding patterns and attributes used in the repo |

---

## Research & Analysis

| Doc | Description |
|-----|-------------|
| `research/research.md` | Research opportunities, tools, articles, and best practices for AI development |
| `research/pricing.md` | AI model pricing comparisons and cost analysis |
| `research/deepseek-gemini-claude-comparison.md` | Model capability comparison across DeepSeek, Gemini, and Claude |
| `research/vibe-coding-vs-legacy.md` | Analysis of AI-assisted coding vs traditional development approaches |

---

## Plans

| Doc | Description |
|-----|-------------|
| `plans/README.md` | Department-level problem statements and potential solutions (executive, marketing, sales, finance, HR, engineering, operations, admin, health) |
| `plans/_TEMPLATE.md` | Template for documenting new problems and solutions |

---

## Internal Audits & Roadmaps

| Doc | Description |
|-----|-------------|
| `internal/documentation-audit.md` | Original documentation audit: full inventory of features, pages, API routes, database tables, analytics, widgets, ingestion system, watchlist system, missing documentation |
| `internal/documentation-audit-v2.md` | Re-evaluated audit after creation of `src/*/README.md` files: updated statuses, covered gaps, duplicate recommendations removed |
| `internal/documentation-roadmap.md` | Prioritized documentation production plan: 12 proposed docs grouped by priority, with dependencies and implementation phases |

---

## Where to Add New Documentation

| If you are documenting... | Place it in... |
|---------------------------|----------------|
| **Code modules** (`src/config/`, `src/db/`, `src/ingesters/`, `src/lib/`) | A `README.md` in the same directory (e.g., `src/ingesters/README.md`) |
| **UI pages** (`app/`, `components/`) | `docs/guides/` with a descriptive name (e.g., `docs/guides/feed-page.md`) |
| **API routes** (`app/api/`) | `docs/guides/` with a descriptive name |
| **Features, dashboards, specs** (watchlist, theme, dashboard widgets) | `docs/guides/` (e.g., `docs/guides/<feature-name>.md`) |
| **Deployment or operations** | `docs/` root with a descriptive name (e.g., `docs/deployment.md`) |
| **Google Chat or other automations** | `docs/gchat-automation/gchat-automation-docs/` or a new `docs/<automation-name>/` folder |
| **Department plans** | `docs/plans/<department>/` |
| **Research, comparisons, evaluations** | `docs/research/` (e.g., `docs/research/<topic>.md`) |
| **AI prompts, model guides, context engineering** | `docs/tooling/` (e.g., `docs/tooling/<name>.md`) |
| **Documentation audits and roadmaps** | `docs/internal/` (e.g., `docs/internal/documentation-<topic>.md`) |
| **Developer onboarding, setup guides** | `docs/getting-started/` (e.g., `docs/getting-started/<guide-name>.md`) |

### Rules

1. Add a link to this index when you add a major document.
2. Prefer Markdown (`.md`) format.
3. Keep documentation concise and navigable — prefer linking to source READMEs over duplicating their content.
4. If a document belongs to a code module, put it next to the code (e.g., `src/ingesters/README.md`), not in `docs/`.
