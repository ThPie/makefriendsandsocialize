ALTER TABLE public.meetup_stats 
ADD COLUMN IF NOT EXISTS eventbrite_follower_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS luma_follower_count integer DEFAULT 0;