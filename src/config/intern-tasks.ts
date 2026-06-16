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
  {
    title: "Review a pull request for common bugs",
    description: "Spot missing error handling, incorrect async patterns, and logic errors in a sample PR diff.",
    difficulty: "intermediate",
  },
  {
    title: "Write a synthetic health check",
    description: "Build a script that pings `/api/feed` and alerts if the response is not 200 or takes longer than 500ms.",
    difficulty: "intermediate",
  },
  {
    title: "Replace a live RSS feed with a mock",
    description: "Create a local mock server that returns fixture RSS XML so tests don't depend on external services.",
    difficulty: "advanced",
  },
  {
    title: "Query the DB for untagged entries",
    description: "Write a SQL query to find all `feed_items` where `tags IS NULL`, then update them with appropriate labels.",
    difficulty: "beginner",
  },
  {
    title: "Create seed fixtures for the feed table",
    description: "Write a script that generates 50 fake `feed_items` rows for testing the feed UI with realistic data.",
    difficulty: "intermediate",
  },
  {
    title: "Practice a rebase workflow",
    description: "Create a feature branch, make 3 commits, then rebase onto main and resolve a simulated conflict.",
    difficulty: "beginner",
  },
  {
    title: "Investigate a spike in 500 errors",
    description: "Analyze a set of fake application logs to find the root cause of a sudden increase in server errors.",
    difficulty: "intermediate",
  },
  {
    title: "Respond to a simulated outage",
    description: "The feed stopped updating. Investigate the ingester logs, identify the failure, and write a post-mortem.",
    difficulty: "advanced",
  },
];
