-- Create concierge_availability table
CREATE TABLE IF NOT EXISTS public.concierge_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  location_name text,
  location_address text,
  max_slots integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add concierge_slot_id to meeting_proposals
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_proposals' AND column_name = 'concierge_slot_id') THEN
    ALTER TABLE public.meeting_proposals ADD COLUMN concierge_slot_id uuid REFERENCES public.concierge_availability(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update RLS for concierge_availability
ALTER TABLE public.concierge_availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view active concierge availability
CREATE POLICY "Anyone can view active concierge availability"
ON public.concierge_availability
FOR SELECT
USING (is_active = true);

-- Only admins can manage concierge availability
CREATE POLICY "Admins can manage concierge availability"
ON public.concierge_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_concierge_availability_updated_at
BEFORE UPDATE ON public.concierge_availability
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Initial sample data (example slots for a Monday and Wednesday)
-- INSERT INTO public.concierge_availability (date, start_time, end_time, location_name, location_address)
-- VALUES 
--   ('2026-02-09', '18:00', '19:00', 'The Library Lounge', '123 Elite Way'),
--   ('2026-02-09', '19:30', '20:30', 'The Library Lounge', '123 Elite Way'),
--   ('2026-02-11', '18:30', '19:30', 'The Rooftop Garden', '456 Skyline Blvd');
