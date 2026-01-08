-- Add normalized JSONB columns to dating_profiles for pre-processed data
ALTER TABLE dating_profiles
ADD COLUMN IF NOT EXISTS conflict_style_normalized JSONB,
ADD COLUMN IF NOT EXISTS connection_style_normalized JSONB,
ADD COLUMN IF NOT EXISTS lifestyle_normalized JSONB,
ADD COLUMN IF NOT EXISTS compatibility_dimensions JSONB,
ADD COLUMN IF NOT EXISTS last_preprocessed_at TIMESTAMPTZ;

-- Add match_dimensions to dating_matches for storing dimensional scores
ALTER TABLE dating_matches
ADD COLUMN IF NOT EXISTS match_dimensions JSONB;