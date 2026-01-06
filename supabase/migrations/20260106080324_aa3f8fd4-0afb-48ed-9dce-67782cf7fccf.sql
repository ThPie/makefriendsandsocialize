-- Create appeal status history table
CREATE TABLE public.appeal_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appeal_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appeal_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can manage all history
CREATE POLICY "Admins can manage appeal history"
  ON public.appeal_status_history
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster lookups
CREATE INDEX idx_appeal_status_history_appeal_id ON public.appeal_status_history(appeal_id);
CREATE INDEX idx_appeal_status_history_created_at ON public.appeal_status_history(created_at DESC);