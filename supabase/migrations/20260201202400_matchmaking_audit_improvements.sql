-- Migration: Add rate limiting and matching optimizations
-- Created: 2026-02-01
-- Purpose: Implements audit recommendations for rate limiting, indexes, triggers, and RLS

-- ===========================================
-- 1. RATE LIMITING TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS match_api_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast rate limit lookups
CREATE INDEX IF NOT EXISTS idx_match_api_calls_profile_time 
ON match_api_calls (profile_id, created_at DESC);

-- Auto-cleanup: Delete records older than 24 hours (run via pg_cron if available)
-- For manual cleanup: DELETE FROM match_api_calls WHERE created_at < NOW() - INTERVAL '24 hours';

-- ===========================================
-- 2. OPTIMIZED INDEXES FOR MATCHING
-- ===========================================

-- Index for active dating profiles (frequently queried in matching)
CREATE INDEX IF NOT EXISTS idx_dating_profiles_matching 
ON dating_profiles (status, is_active, gender, age)
WHERE is_active = true AND status IN ('approved', 'vetted');

-- Index for match lookups (both directions)
CREATE INDEX IF NOT EXISTS idx_dating_matches_user_a 
ON dating_matches (user_a_id, status);

CREATE INDEX IF NOT EXISTS idx_dating_matches_user_b 
ON dating_matches (user_b_id, status);

-- Composite index for match existence checks
CREATE INDEX IF NOT EXISTS idx_dating_matches_pair 
ON dating_matches (user_a_id, user_b_id);

-- ===========================================
-- 3. RE-PREPROCESSING TRIGGER
-- ===========================================

-- Function to flag profile for re-preprocessing when key fields change
CREATE OR REPLACE FUNCTION flag_profile_for_reprocessing()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if key compatibility fields changed
  IF (
    OLD.communication_style IS DISTINCT FROM NEW.communication_style
    OR OLD.core_values_ranked IS DISTINCT FROM NEW.core_values_ranked
    OR OLD.conflict_resolution IS DISTINCT FROM NEW.conflict_resolution
    OR OLD.attachment_style IS DISTINCT FROM NEW.attachment_style
    OR OLD.repair_attempt_response IS DISTINCT FROM NEW.repair_attempt_response
    OR OLD.stress_response IS DISTINCT FROM NEW.stress_response
    OR OLD.wants_children IS DISTINCT FROM NEW.wants_children
    OR OLD.relationship_type IS DISTINCT FROM NEW.relationship_type
  ) THEN
    NEW.last_preprocessed_at := NULL; -- Force re-preprocessing
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS profile_update_trigger ON dating_profiles;
CREATE TRIGGER profile_update_trigger
BEFORE UPDATE ON dating_profiles
FOR EACH ROW EXECUTE FUNCTION flag_profile_for_reprocessing();

-- ===========================================
-- 4. RLS POLICIES FOR DATING MATCHES
-- ===========================================

-- Enable RLS on dating_matches if not already enabled
ALTER TABLE dating_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS matches_own_select ON dating_matches;
DROP POLICY IF EXISTS matches_own_update ON dating_matches;

-- Users can only see their own matches
CREATE POLICY matches_own_select ON dating_matches
FOR SELECT USING (
  user_a_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
  OR user_b_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
);

-- Users can only update their own response fields
CREATE POLICY matches_own_update ON dating_matches
FOR UPDATE USING (
  user_a_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
  OR user_b_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
);

-- ===========================================
-- 5. MATERIALIZED VIEW FOR ACTIVE PROFILES
-- ===========================================

-- Create materialized view for faster matching queries
CREATE MATERIALIZED VIEW IF NOT EXISTS active_dating_profiles AS
SELECT 
  id, 
  user_id, 
  display_name, 
  age, 
  gender, 
  target_gender,
  age_range_min, 
  age_range_max, 
  location, 
  is_active, 
  status,
  core_values_ranked, 
  communication_style, 
  attachment_style,
  wants_children, 
  smoking_status,
  relationship_type,
  dealbreakers
FROM dating_profiles
WHERE status IN ('approved', 'vetted') AND is_active = true;

-- Index on the materialized view
CREATE INDEX IF NOT EXISTS idx_active_profiles_gender_age 
ON active_dating_profiles (gender, age);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_active_profiles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_dating_profiles;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 6. BIAS MONITORING VIEWS
-- ===========================================

-- View for monitoring match score distribution by age
CREATE OR REPLACE VIEW match_bias_by_age AS
SELECT 
  CASE 
    WHEN dp.age < 30 THEN '21-29'
    WHEN dp.age < 40 THEN '30-39'
    WHEN dp.age < 50 THEN '40-49'
    ELSE '50+'
  END as age_bucket,
  AVG(dm.compatibility_score) as avg_score,
  COUNT(*) as match_count
FROM dating_matches dm
JOIN dating_profiles dp ON dm.user_a_id = dp.id
GROUP BY age_bucket
ORDER BY age_bucket;

-- View for monitoring match score distribution by gender
CREATE OR REPLACE VIEW match_bias_by_gender AS
SELECT 
  dp.gender,
  AVG(dm.compatibility_score) as avg_score,
  COUNT(*) as match_count
FROM dating_matches dm
JOIN dating_profiles dp ON dm.user_a_id = dp.id
GROUP BY dp.gender;

-- Grant access to authenticated users for their own data
GRANT SELECT ON active_dating_profiles TO authenticated;
GRANT SELECT ON match_bias_by_age TO service_role;
GRANT SELECT ON match_bias_by_gender TO service_role;
