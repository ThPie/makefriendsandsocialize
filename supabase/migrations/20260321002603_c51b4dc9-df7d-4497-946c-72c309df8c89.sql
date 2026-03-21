
-- Create event_platform_sync table
CREATE TABLE public.event_platform_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  external_id text,
  external_url text,
  error_message text,
  enabled boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, platform)
);

ALTER TABLE public.event_platform_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event platform sync"
  ON public.event_platform_sync
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create platform_connections table
CREATE TABLE public.platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  connection_type text NOT NULL DEFAULT 'webhook',
  webhook_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform connections"
  ON public.platform_connections
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add publish_status to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS publish_status text NOT NULL DEFAULT 'draft';
