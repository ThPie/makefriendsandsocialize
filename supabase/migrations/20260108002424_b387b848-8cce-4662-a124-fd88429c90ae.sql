-- Add new research-backed fields to dating_profiles table
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS family_relationship text,
ADD COLUMN IF NOT EXISTS family_involvement_expectation text,
ADD COLUMN IF NOT EXISTS screen_time_habits text,
ADD COLUMN IF NOT EXISTS debt_status text,
ADD COLUMN IF NOT EXISTS career_ambition text,
ADD COLUMN IF NOT EXISTS communication_style text,
ADD COLUMN IF NOT EXISTS repair_attempt_response text,
ADD COLUMN IF NOT EXISTS stress_response text,
ADD COLUMN IF NOT EXISTS past_relationship_learning text,
ADD COLUMN IF NOT EXISTS trust_fidelity_views text,
ADD COLUMN IF NOT EXISTS political_issues text[],
ADD COLUMN IF NOT EXISTS religious_practice text,
ADD COLUMN IF NOT EXISTS raise_children_faith text,
ADD COLUMN IF NOT EXISTS geographic_flexibility text,
ADD COLUMN IF NOT EXISTS ten_year_vision text,
ADD COLUMN IF NOT EXISTS accountability_reflection text,
ADD COLUMN IF NOT EXISTS ex_admiration text,
ADD COLUMN IF NOT EXISTS growth_work text;

-- Add comment for documentation
COMMENT ON COLUMN public.dating_profiles.family_relationship IS 'Relationship with family of origin - patterns repeat in marriages';
COMMENT ON COLUMN public.dating_profiles.repair_attempt_response IS 'Gottman research - 90%+ divorce predictor';
COMMENT ON COLUMN public.dating_profiles.communication_style IS 'Gottman-inspired communication assessment';
COMMENT ON COLUMN public.dating_profiles.political_issues IS 'Specific political issues that matter - better predictor than party affiliation';