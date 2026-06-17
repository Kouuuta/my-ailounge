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
}
```

**Data:** 13 tasks covering:
- Dev environment setup
- Writing tests for ingesters
- Adding RSS feed sources
- Building charts for feed volume
- Reviewing PRs for common bugs
- Writing health checks
- Mocking external services
- Database queries for untagged entries
- Creating seed fixtures
- Git workflow practice
- Incident investigation exercises

**How it's consumed:**

The Engineering Briefing homepage (`app/page.tsx`) rotates through the task array using a day-based index, displaying today's task and tomorrow's preview.

**How to add a task:**

```ts
{
  title: "Task name",
  description: "Brief description of what to do",
  difficulty: "beginner", // or "intermediate" | "advanced"
}
```
