-- Add venue metadata to concierge_availability
ALTER TABLE public.concierge_availability 
ADD COLUMN IF NOT EXISTS location_description text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Index for tags to allow faster searching (though the table is likely small)
CREATE INDEX IF NOT EXISTS idx_concierge_availability_tags ON public.concierge_availability USING GIN (tags);

-- Add some initial tags to existing rows if needed
UPDATE public.concierge_availability 
SET tags = ARRAY['quiet', 'coffee', 'cozy'] 
WHERE location_name ILIKE '%coffee%' OR location_name ILIKE '%cafe%';

UPDATE public.concierge_availability 
SET tags = ARRAY['vibrant', 'dinner', 'cocktails'] 
WHERE location_name ILIKE '%restaurant%' OR location_name ILIKE '%bar%';
