-- Add indexes for profiles table scalability
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles (first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles (last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);

-- Add index for events table on date column for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);