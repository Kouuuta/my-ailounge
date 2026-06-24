export interface SeedRepo {
  owner: string;
  repo: string;
  category: string;
}

export const SEED_REPOS: SeedRepo[] = [
  { owner: "vercel", repo: "next.js", category: "framework" },
  { owner: "django", repo: "django", category: "framework" },
  { owner: "encode", repo: "django-rest-framework", category: "framework" },
  { owner: "celery", repo: "celery", category: "infra" },
  { owner: "postgres", repo: "postgres", category: "database" },
  { owner: "langchain-ai", repo: "langchain", category: "ai" },
  { owner: "openai", repo: "openai-python", category: "ai" },
  { owner: "anthropics", repo: "anthropic-sdk-python", category: "ai" },
  { owner: "shadcn-ui", repo: "ui", category: "tool" },
  { owner: "vercel", repo: "ai", category: "ai" },
  { owner: "calcom", repo: "cal.com", category: "tool" },
  { owner: "getsentry", repo: "sentry", category: "infra" },
  { owner: "supabase", repo: "supabase", category: "database" },
  { owner: "anomalyco", repo: "opencode", category: "tool" },
];
