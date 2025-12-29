-- Add location fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN country text,
ADD COLUMN state text,
ADD COLUMN city text;

-- Add search_radius to dating_profiles table (default 25, max 100)
ALTER TABLE public.dating_profiles
ADD COLUMN search_radius integer DEFAULT 25 CHECK (search_radius >= 10 AND search_radius <= 100);