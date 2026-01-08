-- Add columns for profile pausing when users match
ALTER TABLE public.dating_profiles 
ADD COLUMN IF NOT EXISTS paused_reason TEXT,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;