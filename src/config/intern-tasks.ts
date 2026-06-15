export interface InternTask {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const INTERN_TASKS: InternTask[] = [
  {
    title: "Set up a local dev environment",
    description: "Clone the repo, install dependencies, run `npm run dev` and confirm the dashboard loads.",
    difficulty: "beginner",
  },
  {
    title: "Write a test for an ingester",
    description: "Add a unit test for the Hacker News ingester that verifies URL parsing works correctly.",
    difficulty: "intermediate",
  },
  {
    title: "Add a new RSS feed source",
    description: "Research a relevant blog/RSS feed, add it to the ingester config, and run `npm run ingest` to verify.",
    difficulty: "intermediate",
  },
  {
    title: "Build a chart for feed volume",
    description: "Create a simple bar chart showing how many items per source were ingested in the last 7 days.",
    difficulty: "advanced",
  },
  {
    title: "Review and tag unclassified entries",
    description: "Go through entries with category 'general' and assign appropriate tags/categories.",
    difficulty: "beginner",
  },
];
