-- Paste this entire file into Supabase Dashboard → SQL Editor → New Query → Run

-- 1. feed_items
CREATE TABLE IF NOT EXISTS feed_items (
  id           BIGSERIAL PRIMARY KEY,
  source       TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general',
  external_id  TEXT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  summary      TEXT,
  tags         TEXT,
  score        INTEGER,
  published_at TIMESTAMPTZ,
  fetched_at   TIMESTAMPTZ DEFAULT NOW(),
  is_pinned    INTEGER DEFAULT 0,
  is_read      INTEGER DEFAULT 0,
  UNIQUE (source, url)
);

CREATE INDEX IF NOT EXISTS idx_feed_category ON feed_items(category);
CREATE INDEX IF NOT EXISTS idx_feed_source ON feed_items(source);
CREATE INDEX IF NOT EXISTS idx_feed_published ON feed_items(published_at);

-- 2. kv_store
CREATE TABLE IF NOT EXISTS kv_store (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- 3. watchlist_items
CREATE TABLE IF NOT EXISTS watchlist_items (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE,
  category          TEXT,
  installed_version TEXT,
  latest_version    TEXT,
  risk_level        TEXT DEFAULT 'low',
  upgrade_notes     TEXT,
  known_vulns       TEXT,
  migration_link    TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. log_analyses
CREATE TABLE IF NOT EXISTS log_analyses (
  id                BIGSERIAL PRIMARY KEY,
  filename          TEXT NOT NULL,
  source            TEXT NOT NULL,
  uploaded_at       TIMESTAMPTZ DEFAULT NOW(),
  total_rows        INTEGER DEFAULT 0,
  error_count       INTEGER DEFAULT 0,
  unique_errors     INTEGER DEFAULT 0,
  time_range_start  TIMESTAMPTZ,
  time_range_end    TIMESTAMPTZ,
  methods           TEXT,
  executive_summary TEXT
);

-- 5. log_errors
CREATE TABLE IF NOT EXISTS log_errors (
  id          BIGSERIAL PRIMARY KEY,
  analysis_id INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  method      TEXT,
  action      TEXT,
  content     TEXT,
  error_type  TEXT,
  pattern_key TEXT,
  error_code  TEXT,
  raw_message TEXT,
  timestamp   TIMESTAMPTZ,
  is_error    INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_log_errors_analysis ON log_errors(analysis_id);

-- 6. log_patterns
CREATE TABLE IF NOT EXISTS log_patterns (
  id              BIGSERIAL PRIMARY KEY,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  pattern_key     TEXT NOT NULL,
  sample_message  TEXT,
  count           INTEGER DEFAULT 0,
  first_seen      TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ,
  severity        TEXT DEFAULT 'medium'
);

CREATE INDEX IF NOT EXISTS idx_log_patterns_analysis ON log_patterns(analysis_id);

-- 7. log_anomalies
CREATE TABLE IF NOT EXISTS log_anomalies (
  id              BIGSERIAL PRIMARY KEY,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  description     TEXT,
  severity        TEXT DEFAULT 'medium',
  detected_at     TIMESTAMPTZ,
  error_count     INTEGER,
  expected_count  REAL,
  deviation       REAL
);

CREATE INDEX IF NOT EXISTS idx_log_anomalies_analysis ON log_analyses(analysis_id);

-- 8. prompts
CREATE TABLE IF NOT EXISTS prompts (
  id                   BIGSERIAL PRIMARY KEY,
  title                TEXT NOT NULL,
  content              TEXT NOT NULL,
  category             TEXT NOT NULL,
  description          TEXT,
  input_fields         TEXT,
  output_description   TEXT,
  model_recommendation TEXT,
  usage_count          INTEGER DEFAULT 0,
  is_featured          INTEGER DEFAULT 0,
  source               TEXT DEFAULT 'curated',
  external_id          TEXT,
  source_url           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_source_extid ON prompts(source, external_id) WHERE external_id IS NOT NULL;

-- 9. repo_radar_items
CREATE TABLE IF NOT EXISTS repo_radar_items (
  id                  BIGSERIAL PRIMARY KEY,
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
  latest_release_date TIMESTAMPTZ,
  latest_release_body TEXT,
  breaking_changes    TEXT,
  security_advisory   TEXT,
  open_issues         INTEGER DEFAULT 0,
  open_prs            INTEGER DEFAULT 0,
  prs_opened_7d       INTEGER DEFAULT 0,
  prs_merged_7d       INTEGER DEFAULT 0,
  issues_opened_7d    INTEGER DEFAULT 0,
  issue_spike         INTEGER DEFAULT 0,
  last_activity_at    TIMESTAMPTZ,
  notes               TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  last_refreshed_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. user_feed_states — per-user read/pin state (replaced global is_pinned/is_read on feed_items)
CREATE TABLE IF NOT EXISTS user_feed_states (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_item_id  BIGINT NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  is_read       INTEGER DEFAULT 0,
  is_pinned     INTEGER DEFAULT 0,
  saved_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, feed_item_id)
);

ALTER TABLE user_feed_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS user_own_states ON user_feed_states
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. Helper functions for feed breakdown stats (used by homepage chart)
CREATE OR REPLACE FUNCTION get_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
AS $$
  SELECT f.category::text, COUNT(*)::bigint
  FROM feed_items f
  WHERE f.category IS NOT NULL
  GROUP BY f.category
  ORDER BY COUNT(*) DESC;
$$;

CREATE OR REPLACE FUNCTION get_source_counts()
RETURNS TABLE(source text, count bigint)
LANGUAGE sql
AS $$
  SELECT f.source::text, COUNT(*)::bigint
  FROM feed_items f
  WHERE f.source IS NOT NULL
  GROUP BY f.source
  ORDER BY COUNT(*) DESC;
$$;
