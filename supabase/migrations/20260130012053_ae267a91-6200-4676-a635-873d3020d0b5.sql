-- Add intimacy expectations and finding love fear columns to dating_profiles
ALTER TABLE public.dating_profiles 
ADD COLUMN IF NOT EXISTS intimacy_expectations text,
ADD COLUMN IF NOT EXISTS finding_love_fear text;