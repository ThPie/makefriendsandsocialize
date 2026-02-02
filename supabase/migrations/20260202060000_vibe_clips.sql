-- Add vibe clip fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vibe_clip_url text,
ADD COLUMN IF NOT EXISTS vibe_clip_status text DEFAULT 'pending_verification'; -- pending_verification, verified, rejected

-- INDEX for status
CREATE INDEX IF NOT EXISTS idx_profiles_vibe_clip_status ON public.profiles(vibe_clip_status);
