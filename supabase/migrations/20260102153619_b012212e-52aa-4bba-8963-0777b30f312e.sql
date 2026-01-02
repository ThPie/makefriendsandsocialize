-- Add audience segment and automation tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS audience_segment TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS discovery_run_id UUID;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.audience_segment IS 
  'Target audience: singles, couples, new_in_town, professionals, expats, empty_nesters, newly_single';