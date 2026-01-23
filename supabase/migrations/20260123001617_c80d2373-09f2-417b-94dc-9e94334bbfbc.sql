-- Add onboarding step tracking for progress persistence
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1;