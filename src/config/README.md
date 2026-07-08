# `src/config/` — Seed Data & Configuration

Seed data for the Developer Dashboard features. Currently contains intern task definitions for Module 8 (Intern Safe Task Board).

## Files

### `intern-tasks.ts`

Provides a static array of safe, self-contained tasks that interns can pick up without touching production systems.

**Interface:**

```ts
interface InternTask {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "synthetic-data" | "mock-apis" | "local-db" | "code-review" | "docs-research" | "git-workflow";
  learningObjective: string;
  safeEnvironment: string;
  expectedOutput: string;
  resources: string[];
}
```

**Data:** 13 tasks across 6 categories:

| Category | Count |
|----------|-------|
| synthetic-data | 1 |
| mock-apis | 3 |
| local-db | 3 |
| code-review | 2 |
| docs-research | 2 |
| git-workflow | 2 |

**How it's consumed:**

Two consumers:

1. **Homepage widget** (`components/briefing/intern-tasks.tsx`) — day-based rotation, shows today's task + tomorrow's preview with category + difficulty badges and a "View all" link.
2. **Full page** (`app/intern-tasks/page.tsx`) — filterable grid with category pills, difficulty select, sort controls, and expandable cards showing all task detail fields.

**How to add a task:**

```ts
{
  title: "Task name",
  description: "Brief description of what to do",
  difficulty: "beginner", // or "intermediate" | "advanced"
  category: "mock-apis", // one of 6 categories
  learningObjective: "What the intern will learn",
  safeEnvironment: "Why it's safe",
  expectedOutput: "What success looks like",
  resources: ["Link 1", "Link 2"],
}
```
