
-- Add circle_tags to event_photos for filtering photos by circle
ALTER TABLE public.event_photos ADD COLUMN IF NOT EXISTS circle_tags text[] DEFAULT '{}';

-- Create index for efficient circle tag filtering
CREATE INDEX IF NOT EXISTS idx_event_photos_circle_tags ON public.event_photos USING GIN(circle_tags);

-- Create index on events tags for circle filtering
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
