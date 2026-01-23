-- Add new profile fields for enhanced onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS community_goals text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS target_industries text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS community_offering text;