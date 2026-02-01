-- Create instagram_settings table for storing sync configuration
CREATE TABLE public.instagram_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_username text NOT NULL,
  last_synced_at timestamp with time zone,
  auto_sync_enabled boolean NOT NULL DEFAULT false,
  default_category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage instagram settings
CREATE POLICY "Admins can manage instagram settings"
ON public.instagram_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add source tracking columns to event_photos table
ALTER TABLE public.event_photos 
ADD COLUMN IF NOT EXISTS instagram_post_id text,
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Add unique constraint on instagram_post_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS event_photos_instagram_post_id_unique 
ON public.event_photos (instagram_post_id) 
WHERE instagram_post_id IS NOT NULL;

-- Create trigger for updated_at on instagram_settings
CREATE TRIGGER update_instagram_settings_updated_at
BEFORE UPDATE ON public.instagram_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();