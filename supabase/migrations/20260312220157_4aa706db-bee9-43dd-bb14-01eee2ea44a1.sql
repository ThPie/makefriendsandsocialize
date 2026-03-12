
-- Add columns to track cross-platform event sources and merged attendees
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS eventbrite_id text,
  ADD COLUMN IF NOT EXISTS luma_id text,
  ADD COLUMN IF NOT EXISTS meetup_rsvp_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eventbrite_rsvp_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS luma_rsvp_count integer DEFAULT 0;

-- Create index for deduplication lookups
CREATE INDEX IF NOT EXISTS idx_events_eventbrite_id ON public.events(eventbrite_id) WHERE eventbrite_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_luma_id ON public.events(luma_id) WHERE luma_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_source ON public.events(source);
