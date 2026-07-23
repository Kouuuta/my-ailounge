import { getDb } from "./client";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS feed_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source       TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general',
  external_id  TEXT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  summary      TEXT,
  tags         TEXT,
  score        INTEGER,
  published_at TEXT,
  fetched_at   TEXT DEFAULT (datetime('now')),
  is_pinned    INTEGER DEFAULT 0,
  is_read      INTEGER DEFAULT 0,
  UNIQUE (source, url)
);

CREATE INDEX IF NOT EXISTS idx_feed_category ON feed_items(category);
CREATE INDEX IF NOT EXISTS idx_feed_source ON feed_items(source);
CREATE INDEX IF NOT EXISTS idx_feed_published ON feed_items(published_at);

CREATE TABLE IF NOT EXISTS kv_store (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL UNIQUE,
  category          TEXT,
  installed_version TEXT,
  latest_version    TEXT,
  risk_level        TEXT DEFAULT 'low',
  upgrade_notes     TEXT,
  known_vulns       TEXT,
  migration_link    TEXT,
  updated_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS log_analyses (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  filename          TEXT NOT NULL,
  source            TEXT NOT NULL,
  uploaded_at       TEXT DEFAULT (datetime('now')),
  total_rows        INTEGER DEFAULT 0,
  error_count       INTEGER DEFAULT 0,
  unique_errors     INTEGER DEFAULT 0,
  time_range_start  TEXT,
  time_range_end    TEXT,
  methods           TEXT,
  executive_summary TEXT
);

CREATE TABLE IF NOT EXISTS log_errors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  method      TEXT,
  action      TEXT,
  content     TEXT,
  error_type  TEXT,
  pattern_key TEXT,
  error_code  TEXT,
  raw_message TEXT,
  timestamp   TEXT,
  is_error    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS log_patterns (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  pattern_key     TEXT NOT NULL,
  sample_message  TEXT,
  count           INTEGER DEFAULT 0,
  first_seen      TEXT,
  last_seen       TEXT,
  severity        TEXT DEFAULT 'medium'
);

CREATE TABLE IF NOT EXISTS log_anomalies (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  description     TEXT,
  severity        TEXT DEFAULT 'medium',
  detected_at     TEXT,
  error_count     INTEGER,
  expected_count  REAL,
  deviation       REAL
);

CREATE INDEX IF NOT EXISTS idx_log_errors_analysis ON log_errors(analysis_id);
CREATE INDEX IF NOT EXISTS idx_log_patterns_analysis ON log_patterns(analysis_id);
CREATE INDEX IF NOT EXISTS idx_log_anomalies_analysis ON log_anomalies(analysis_id);

CREATE TABLE IF NOT EXISTS prompts (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  title                TEXT NOT NULL,
  content              TEXT NOT NULL,
  category             TEXT NOT NULL,
  description          TEXT,
  input_fields         TEXT,
  output_description   TEXT,
  model_recommendation TEXT,
  usage_count          INTEGER DEFAULT 0,
  is_featured          INTEGER DEFAULT 0,
  created_at           TEXT DEFAULT (datetime('now')),
  updated_at           TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);

CREATE TABLE IF NOT EXISTS repo_radar_items (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  owner               TEXT NOT NULL,
  repo                TEXT NOT NULL,
  full_name           TEXT NOT NULL UNIQUE,
  description         TEXT,
  url                 TEXT NOT NULL,
  language            TEXT,
  stars               INTEGER DEFAULT 0,
  stars_gained        INTEGER DEFAULT 0,
  latest_release      TEXT,
  latest_release_url  TEXT,
  latest_release_date TEXT,
  latest_release_body TEXT,
  breaking_changes    TEXT,
  security_advisory   TEXT,
  open_issues         INTEGER DEFAULT 0,
  open_prs            INTEGER DEFAULT 0,
  prs_opened_7d       INTEGER DEFAULT 0,
  prs_merged_7d       INTEGER DEFAULT 0,
  issues_opened_7d    INTEGER DEFAULT 0,
  issue_spike         INTEGER DEFAULT 0,
  last_activity_at    TEXT,
  notes               TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  last_refreshed_at   TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const SEED_WATCHLIST = [
  { name: "Next.js", category: "framework" },
  { name: "React", category: "framework" },
  { name: "Django", category: "framework" },
  { name: "DRF", category: "framework" },
  { name: "PostgreSQL", category: "database" },
  { name: "Redis", category: "database" },
  { name: "Docker", category: "infra" },
  { name: "AWS", category: "cloud" },
  { name: "Celery", category: "infra" },
  { name: "GitHub Actions", category: "infra" },
  { name: "Sentry", category: "infra" },
  { name: "OpenAI SDK", category: "ai-sdk" },
  { name: "Anthropic SDK", category: "ai-sdk" },
  { name: "DeepSeek SDK", category: "ai-sdk" },
];

export function migrate(): void {
  const db = getDb();
  db.exec(SCHEMA_SQL);

  try { db.exec("ALTER TABLE log_errors ADD COLUMN pattern_key TEXT"); } catch {}
  try { db.exec("ALTER TABLE log_patterns ADD COLUMN pattern_key TEXT"); } catch {}

  // Add source columns to prompts table
  try { db.exec("ALTER TABLE prompts ADD COLUMN source TEXT DEFAULT 'curated'"); } catch {}
  try { db.exec("ALTER TABLE prompts ADD COLUMN external_id TEXT"); } catch {}
  try { db.exec("ALTER TABLE prompts ADD COLUMN source_url TEXT"); } catch {}
  try { db.exec("UPDATE prompts SET source = 'curated' WHERE source IS NULL"); } catch {}
  try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_source_extid ON prompts(source, external_id) WHERE external_id IS NOT NULL"); } catch {}

  const existing = db.prepare("SELECT COUNT(*) as count FROM watchlist_items").get() as { count: number };
  if (existing.count === 0) {
    const insert = db.prepare("INSERT INTO watchlist_items (name, category) VALUES (@name, @category)");
    for (const item of SEED_WATCHLIST) {
      try {
        insert.run(item);
      } catch {
        // ignore duplicates
      }
    }
    console.log(`Seeded ${SEED_WATCHLIST.length} watchlist items.`);
  }

  const radarExisting = db.prepare("SELECT COUNT(*) as count FROM repo_radar_items").get() as { count: number };
  if (radarExisting.count === 0) {
    const insert = db.prepare(
      "INSERT INTO repo_radar_items (owner, repo, full_name, url) VALUES (@owner, @repo, @full_name, @url)",
    );
    const seed = [
      { owner: "vercel", repo: "next.js", full_name: "vercel/next.js", url: "https://github.com/vercel/next.js" },
      { owner: "django", repo: "django", full_name: "django/django", url: "https://github.com/django/django" },
      { owner: "encode", repo: "django-rest-framework", full_name: "encode/django-rest-framework", url: "https://github.com/encode/django-rest-framework" },
      { owner: "celery", repo: "celery", full_name: "celery/celery", url: "https://github.com/celery/celery" },
      { owner: "postgres", repo: "postgres", full_name: "postgres/postgres", url: "https://github.com/postgres/postgres" },
      { owner: "langchain-ai", repo: "langchain", full_name: "langchain-ai/langchain", url: "https://github.com/langchain-ai/langchain" },
      { owner: "openai", repo: "openai-python", full_name: "openai/openai-python", url: "https://github.com/openai/openai-python" },
      { owner: "anthropics", repo: "anthropic-sdk-python", full_name: "anthropics/anthropic-sdk-python", url: "https://github.com/anthropics/anthropic-sdk-python" },
      { owner: "shadcn-ui", repo: "ui", full_name: "shadcn-ui/ui", url: "https://github.com/shadcn-ui/ui" },
      { owner: "vercel", repo: "ai", full_name: "vercel/ai", url: "https://github.com/vercel/ai" },
      { owner: "calcom", repo: "cal.com", full_name: "calcom/cal.com", url: "https://github.com/calcom/cal.com" },
      { owner: "getsentry", repo: "sentry", full_name: "getsentry/sentry", url: "https://github.com/getsentry/sentry" },
      { owner: "supabase", repo: "supabase", full_name: "supabase/supabase", url: "https://github.com/supabase/supabase" },
      { owner: "anomalyco", repo: "opencode", full_name: "anomalyco/opencode", url: "https://github.com/anomalyco/opencode" },
    ];
    for (const item of seed) {
      try {
        insert.run(item);
      } catch {
        // ignore duplicates
      }
    }
    console.log(`Seeded ${seed.length} repo radar items.`);
  }

  const promptsExisting = db.prepare("SELECT COUNT(*) as count FROM prompts").get() as { count: number };
  if (promptsExisting.count === 0) {
    const insert = db.prepare(`
      INSERT INTO prompts (title, content, category, description, input_fields, output_description, model_recommendation, is_featured)
      VALUES (@title, @content, @category, @description, @input_fields, @output_description, @model_recommendation, @is_featured)
    `);
    const SEED_PROMPTS = [
      {
        title: "Architecture Sanity Check",
        content: "Read @file:{file_path} and the route/URL files in each module. List 3-5 design risks (e.g., coupling, caching, authentication). For each, show the minimal change that reduces risk and link to lines by file:line. Return a prioritized plan and an estimate of touched files.",
        category: "architecture",
        description: "Audit a codebase for design risks before writing code",
        input_fields: '["file path to main module", "route/url file glob pattern"]',
        output_description: "Prioritized list of 3-5 design risks with minimal fixes and file:line references",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 1,
      },
      {
        title: "API Contract → Server + Client",
        content: "From @file:{openapi_spec}, generate server-side serializers/views and a typed client. Include validation, error mapping, and tests. Keep each change in a separate patch.",
        category: "code_review",
        description: "Generate backend and client code from an OpenAPI spec",
        input_fields: '["path to OpenAPI spec file"]',
        output_description: "Server serializers + viewsets, typed client, validation, error mapping, tests",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Database Migration Audit",
        content: "Audit {migration_file} for encoding, indexing, and rollback risks. If safe, propose a patch; else output a checklist. Generate a verification script that samples rows and asserts invariants.",
        category: "code_review",
        description: "Audit migration safety before applying to production",
        input_fields: '["path to migration file"]',
        output_description: "Safety assessment, patch or checklist, verification script",
        model_recommendation: "Claude Sonnet 4",
        is_featured: 0,
      },
      {
        title: "Quick Security Pass",
        content: "Run a security review on the current diff. Flag authentication boundaries (e.g., permissions.py, custom auth classes), cookie/CSRF settings, header parsing, and secret exposure. Provide line-anchored fixes with rationale.",
        category: "security_audit",
        description: "Fast security review of a diff for common vulnerabilities",
        input_fields: '["git diff output or branch name"]',
        output_description: "Line-anchored security findings with fixes and rationale",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Tests That Pay Rent",
        content: "Given changes in {module_path} (e.g., models, views, tasks), propose table-driven tests that cover nulls, timeouts, idempotency, and retries for both synchronous and async operations. Prefer failing first, then provide patches to make them pass.",
        category: "code_review",
        description: "Generate robust test coverage for a module",
        input_fields: '["path to module directory"]',
        output_description: "Table-driven tests covering edge cases + patches to make them pass",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Performance Triage",
        content: "Profile the hot path in {file_path}. Identify 2 bottlenecks with line references, estimate complexity, and propose the smallest safe improvement. Don't micro-optimize; aim for p95 wins.",
        category: "debugging",
        description: "Find the biggest performance bottlenecks without over-optimizing",
        input_fields: '["path to hot-path file or profiler output"]',
        output_description: "2 bottleneck analyses with line refs, complexity, and minimal fixes",
        model_recommendation: "Claude Sonnet 4",
        is_featured: 0,
      },
      {
        title: "PR Ready-to-Merge Summary",
        content: "Summarize this PR in 5 bullet points: problem, approach, risks, tests, rollout. If risky, suggest a feature flag and rollback plan.",
        category: "documentation",
        description: "Generate a concise, actionable PR summary",
        input_fields: '["PR diff or branch name"]',
        output_description: "5-bullet PR summary with risk assessment and rollback plan",
        model_recommendation: "Any (GPT-4o mini, Claude Haiku)",
        is_featured: 0,
      },
      {
        title: "Incident Root Cause Analysis",
        content: "Given this incident timeline and logs, produce a root cause analysis: (1) timeline of events, (2) root cause, (3) blast radius, (4) remediation steps taken, (5) prevention plan. Flag any monitoring gaps that delayed detection.",
        category: "incident_analysis",
        description: "Systematic incident post-mortem from logs and timeline",
        input_fields: '["incident timeline text", "log snippets or file paths"]',
        output_description: "Full RCA with timeline, root cause, blast radius, remediation, and prevention plan",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Refactoring Impact Assessment",
        content: "Analyze the proposed refactoring of {component_name}. Identify: (1) callers affected, (2) interface breakage, (3) test coverage gaps, (4) migration path. Provide a step-by-step refactoring plan that keeps the codebase green at each commit.",
        category: "refactoring",
        description: "Safe refactoring plan with caller impact analysis",
        input_fields: '["component/module name", "proposed change description"]',
        output_description: "Caller impact map, breakage analysis, test gaps, step-by-step green refactoring plan",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Onboarding Task for Intern",
        content: "Create a safe learning task for an intern based on {topic}. Include: (1) mock API/data setup, (2) clear acceptance criteria, (3) hints if stuck, (4) expected solution approach. Must touch no production data or real credentials.",
        category: "intern_mentoring",
        description: "Generate safe, productive learning tasks for junior developers",
        input_fields: '["topic or skill to practice", "stack/language"]',
        output_description: "Complete intern task brief with mock setup, acceptance criteria, hints, solution approach",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Stakeholder Update Draft",
        content: "Draft a stakeholder email about {topic}. Include: (1) what happened, (2) impact, (3) what's being done, (4) ETA. Tone: transparent but confident. Avoid jargon. Include an escalation path if the reader is not satisfied.",
        category: "stakeholder_emails",
        description: "Draft clear, jargon-free stakeholder communications",
        input_fields: '["topic (outage, delay, change)", "relevant details/context"]',
        output_description: "Professional stakeholder email with situation, impact, action, ETA, escalation path",
        model_recommendation: "Claude Sonnet 4, GPT-4o, Claude Haiku",
        is_featured: 0,
      },
      {
        title: "Debugging a Silent Failure",
        content: "I have a {component} that {symptom}. No error logs are produced. Walk me through a systematic debugging approach: (1) hypothesis generation, (2) instrumentation points, (3) minimal reproduction case, (4) root cause isolation. Include specific checkpoints to add and what each rules out.",
        category: "debugging",
        description: "Systematic approach to debug silent failures with no error logs",
        input_fields: '["component name", "observed symptom", "relevant code paths"]',
        output_description: "Debugging checklist with hypothesis tree, instrumentation points, reproduction steps",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Architecture Decision Record",
        content: "Write an ADR for {decision}. Follow MADR format: context, decision drivers, options considered (with pros/cons), chosen option with rationale, consequences, and compliance notes. Keep it to one page.",
        category: "documentation",
        description: "Generate a lightweight Architecture Decision Record",
        input_fields: '["architectural decision topic", "context and constraints"]',
        output_description: "One-page ADR in MADR format with options, rationale, and consequences",
        model_recommendation: "Claude Sonnet 4, GPT-4o, Claude Haiku",
        is_featured: 0,
      },
      {
        title: "SQL Query Optimization",
        content: "This query is slow: ```sql {query} ```. Analyze its execution plan, identify the bottleneck (full scan, temp file, missing index, row estimate), and rewrite it. Show EXPLAIN ANALYZE before/after and index recommendations if applicable.",
        category: "debugging",
        description: "Optimize slow SQL queries with execution plan analysis",
        input_fields: '["slow SQL query", "table schema (optional)"]',
        output_description: "Bottleneck analysis, rewritten query, EXPLAIN ANALYZE comparison, index recommendations",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
      {
        title: "Code Review Checklist",
        content: "Review this diff against our team's standards: {diff_or_branch}. Check for: correctness, security (injection, auth, data exposure), error handling, logging, test coverage, naming, and API compatibility. Categorize each finding as blocker / should-fix / nit. Provide a summary score.",
        category: "code_review",
        description: "Systematic code review against team standards",
        input_fields: '["diff or branch name", "team standards (optional)"]',
        output_description: "Categorized findings (blocker/should-fix/nit) with summary score",
        model_recommendation: "Claude Sonnet 4, GPT-4o",
        is_featured: 0,
      },
    ];
    for (const prompt of SEED_PROMPTS) {
      try {
        insert.run(prompt);
      } catch {
        // ignore duplicates
      }
    }
    console.log(`Seeded ${SEED_PROMPTS.length} prompts.`);
  }

  console.log("Database migrated successfully.");
}
