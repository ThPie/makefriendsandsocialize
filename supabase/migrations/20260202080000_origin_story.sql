-- Add origin_story column to dating_matches for the Cinematic Reveal feature
ALTER TABLE dating_matches ADD COLUMN IF NOT EXISTS origin_story TEXT;
