-- Add external_url column to events table for linking to Meetup events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add index for better lookups by source
CREATE INDEX IF NOT EXISTS idx_events_source ON public.events(source);

-- Clean up duplicate events - keep only the most recently updated one for each title/date combo
DELETE FROM public.events a
USING public.events b
WHERE a.id < b.id
  AND a.title = b.title
  AND a.date = b.date
  AND a.source = 'meetup';

-- Update status of events that are past their date
UPDATE public.events
SET status = 'past'
WHERE date < CURRENT_DATE AND status NOT IN ('past', 'cancelled');