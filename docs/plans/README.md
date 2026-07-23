# Department Plans — Problems & Potential Solutions

Single source of truth for the **problems and potential solutions of Mind You**, organized by department.

This is not a dashboard backlog or a project tracker. Each department documents what is broken, slow,
costly, or missing in its area — and the candidate fixes. Solutions may later become projects,
dashboards, or process changes, but they start here as problem statements.

Each department owns a folder with a **charter** (`README.md`) and one file per problem.
Copy [`_TEMPLATE.md`](./_TEMPLATE.md) to log a new problem + potential solutions.

## Departments

| Department | Folder | Focus |
|------------|--------|-------|
| Executive | [`executive/`](./executive/) | OKRs, strategy, board |
| Marketing | [`marketing/`](./marketing/) | Campaigns, content, SEO |
| Sales | [`sales/`](./sales/) | Pipeline, hot leads, conversion |
| Finance | [`finance/`](./finance/) | Pricing, burn, AI model spend |
| HR | [`hr/`](./hr/) | Hiring, onboarding, culture |
| Operations | [`operations/`](./operations/) | Infra, runbooks, incidents |
| Admin | [`admin/`](./admin/) | Vendors, compliance, licenses |
| Health | [`health/`](./health/) | Clinical protocols, triage, care quality |
| Engineering | [`engineering/`](./engineering/) | R&D, platform, dashboards |

## Conventions

- One file per problem. Name: `short-slug.md` (e.g. `slow-lead-response.md`, `high-model-spend.md`).
- Fill the template fully — empty sections signal an unowned problem.
- Status lives in frontmatter (`open` / `exploring` / `in-progress` / `solved` / `parked`).
- AI-assisted drafting: use your opencode planning skill/agent, output here.

## Cross-references

- Pricing analysis → [`../research/pricing.md`](../research/pricing.md)
- R&D backlog → [`../guides/RnD_Technical_Tasks_Overview.md`](../guides/RnD_Technical_Tasks_Overview.md)
- Onboarding → [`../getting-started/INSTRUCTIONS.md`](../getting-started/INSTRUCTIONS.md)
- Lead flow diagram → [`../../diagrams/hotleads.md`](../../diagrams/hotleads.md)
