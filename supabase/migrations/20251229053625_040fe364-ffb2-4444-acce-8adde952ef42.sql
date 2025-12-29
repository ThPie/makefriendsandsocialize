-- Add social media and verification columns
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS social_verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS social_verification_notes text;

-- Add relationship intention columns
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS relationship_type text,
ADD COLUMN IF NOT EXISTS marriage_timeline text;

-- Add family & background columns
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS children_details text,
ADD COLUMN IF NOT EXISTS wants_children text,
ADD COLUMN IF NOT EXISTS been_married boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marriage_history text;

-- Add lifestyle habits columns
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS smoking_status text,
ADD COLUMN IF NOT EXISTS drinking_status text,
ADD COLUMN IF NOT EXISTS drug_use text,
ADD COLUMN IF NOT EXISTS exercise_frequency text,
ADD COLUMN IF NOT EXISTS diet_preference text;

-- Add additional matching columns
ALTER TABLE public.dating_profiles
ADD COLUMN IF NOT EXISTS love_language text,
ADD COLUMN IF NOT EXISTS attachment_style text,
ADD COLUMN IF NOT EXISTS introvert_extrovert text,
ADD COLUMN IF NOT EXISTS morning_night_person text;