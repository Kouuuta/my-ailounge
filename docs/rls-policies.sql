-- ═══════════════════════════════════════════════════════════════════════
-- Role-Based Access Control Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════

-- 1. user_roles table
-- Associates auth.users with a role. New users auto-get 'intern'.
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'intern' CHECK (role IN ('intern', 'lead')),
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
DROP POLICY IF EXISTS user_roles_self ON user_roles;

CREATE POLICY user_roles_self ON user_roles FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS user_roles_lead_select ON user_roles;

-- 2. Auto-assign role on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'intern');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- Roles: intern = read + limited write | lead = full CRUD
-- anon = can read public data (feed_items, prompts, kv_store)
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- Helper: is_lead() — SECURITY DEFINER to bypass RLS recursion
-- ───────────────────────────────────────
CREATE OR REPLACE FUNCTION is_lead()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'lead'
  );
$$;

-- ───────────────────────────────────────
-- 1. feed_items — public read, lead write
-- ───────────────────────────────────────
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feed_items_select ON feed_items;

CREATE POLICY feed_items_select ON feed_items FOR
SELECT USING (true);
-- anon + authenticated can read

DROP POLICY IF EXISTS feed_items_insert ON feed_items;

CREATE POLICY feed_items_insert ON feed_items FOR INSERT
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS feed_items_update ON feed_items;

CREATE POLICY feed_items_update ON feed_items FOR
UPDATE USING (is_lead ())
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS feed_items_delete ON feed_items;

CREATE POLICY feed_items_delete ON feed_items FOR DELETE USING (is_lead ());

-- ───────────────────────────────────────
-- 2. kv_store — public read, lead write
-- ───────────────────────────────────────
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kv_store_select ON kv_store;

CREATE POLICY kv_store_select ON kv_store FOR SELECT USING (true);

DROP POLICY IF EXISTS kv_store_insert ON kv_store;

CREATE POLICY kv_store_insert ON kv_store FOR INSERT
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS kv_store_update ON kv_store;

CREATE POLICY kv_store_update ON kv_store FOR
UPDATE USING (is_lead ())
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS kv_store_delete ON kv_store;

CREATE POLICY kv_store_delete ON kv_store FOR DELETE USING (is_lead ());

-- ───────────────────────────────────────
-- 3. watchlist_items — auth read, intern write, lead delete
-- ───────────────────────────────────────
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS watchlist_items_select ON watchlist_items;

CREATE POLICY watchlist_items_select ON watchlist_items FOR
SELECT USING (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS watchlist_items_insert ON watchlist_items;

CREATE POLICY watchlist_items_insert ON watchlist_items FOR INSERT
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS watchlist_items_update ON watchlist_items;

CREATE POLICY watchlist_items_update ON watchlist_items FOR
UPDATE USING (
    auth.role () = 'authenticated'
)
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS watchlist_items_delete ON watchlist_items;

CREATE POLICY watchlist_items_delete ON watchlist_items FOR DELETE USING (is_lead ());

-- ───────────────────────────────────────
-- 4-7. log tables — auth read, lead write/delete
-- ───────────────────────────────────────
ALTER TABLE log_analyses ENABLE ROW LEVEL SECURITY;

ALTER TABLE log_errors ENABLE ROW LEVEL SECURITY;

ALTER TABLE log_patterns ENABLE ROW LEVEL SECURITY;

ALTER TABLE log_anomalies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  EXECUTE (
    SELECT string_agg(format(
      'DROP POLICY IF EXISTS %I ON %I; CREATE POLICY %I ON %I FOR SELECT USING (auth.role() = ''authenticated'');',
      'log_select', t, 'log_select', t
    ), E'\n') || E'\n' ||
    string_agg(format(
      'DROP POLICY IF EXISTS %I ON %I; CREATE POLICY %I ON %I FOR INSERT WITH CHECK (is_lead());',
      'log_insert', t, 'log_insert', t
    ), E'\n') || E'\n' ||
    string_agg(format(
      'DROP POLICY IF EXISTS %I ON %I; CREATE POLICY %I ON %I FOR UPDATE USING (is_lead()) WITH CHECK (is_lead());',
      'log_update', t, 'log_update', t
    ), E'\n') || E'\n' ||
    string_agg(format(
      'DROP POLICY IF EXISTS %I ON %I; CREATE POLICY %I ON %I FOR DELETE USING (is_lead());',
      'log_delete', t, 'log_delete', t
    ), E'\n')
    FROM (VALUES ('log_analyses'), ('log_errors'), ('log_patterns'), ('log_anomalies')) AS t(t)
  );
END $$;

-- ───────────────────────────────────────
-- 8. prompts — public read, lead write
-- ───────────────────────────────────────
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prompts_select ON prompts;

CREATE POLICY prompts_select ON prompts FOR SELECT USING (true);

DROP POLICY IF EXISTS prompts_insert ON prompts;

CREATE POLICY prompts_insert ON prompts FOR INSERT
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS prompts_update ON prompts;

CREATE POLICY prompts_update ON prompts FOR
UPDATE USING (is_lead ())
WITH
    CHECK (is_lead ());

DROP POLICY IF EXISTS prompts_delete ON prompts;

CREATE POLICY prompts_delete ON prompts FOR DELETE USING (is_lead ());

-- ───────────────────────────────────────
-- 9. repo_radar_items — auth read, intern write, lead delete
-- ───────────────────────────────────────
ALTER TABLE repo_radar_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS repo_radar_items_select ON repo_radar_items;

CREATE POLICY repo_radar_items_select ON repo_radar_items FOR
SELECT USING (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS repo_radar_items_insert ON repo_radar_items;

CREATE POLICY repo_radar_items_insert ON repo_radar_items FOR INSERT
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS repo_radar_items_update ON repo_radar_items;

CREATE POLICY repo_radar_items_update ON repo_radar_items FOR
UPDATE USING (
    auth.role () = 'authenticated'
)
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

DROP POLICY IF EXISTS repo_radar_items_delete ON repo_radar_items;

CREATE POLICY repo_radar_items_delete ON repo_radar_items FOR DELETE USING (is_lead ());

-- ───────────────────────────────────────
-- 10. user_feed_states — user-scoped (existing)
-- ───────────────────────────────────────
ALTER TABLE user_feed_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_feed_states_select ON user_feed_states;

CREATE POLICY user_feed_states_select ON user_feed_states FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS user_feed_states_insert ON user_feed_states;

CREATE POLICY user_feed_states_insert ON user_feed_states FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS user_feed_states_update ON user_feed_states;

CREATE POLICY user_feed_states_update ON user_feed_states FOR
UPDATE USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS user_feed_states_delete ON user_feed_states;

CREATE POLICY user_feed_states_delete ON user_feed_states FOR DELETE USING (auth.uid () = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Make yourself lead
-- Replace '<your-auth-user-id>' with your actual UUID from Auth → Users
-- ═══════════════════════════════════════════════════════════════════════
-- INSERT INTO user_roles (user_id, role) VALUES ('<your-auth-user-id>', 'lead')
--   ON CONFLICT (user_id) DO UPDATE SET role = 'lead';