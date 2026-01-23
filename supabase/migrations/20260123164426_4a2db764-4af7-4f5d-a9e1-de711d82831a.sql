-- Create lead_followup_reminders table to track which reminders have been sent
CREATE TABLE public.lead_followup_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '48h', '72h')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate reminders
CREATE UNIQUE INDEX idx_lead_reminder_unique ON public.lead_followup_reminders(lead_id, reminder_type);

-- Create index for efficient querying
CREATE INDEX idx_lead_reminders_lead ON public.lead_followup_reminders(lead_id);
CREATE INDEX idx_lead_reminders_business ON public.lead_followup_reminders(business_id);

-- Enable RLS
ALTER TABLE public.lead_followup_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all reminders"
  ON public.lead_followup_reminders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can view their reminders"
  ON public.lead_followup_reminders FOR SELECT
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

-- Enable realtime for business_leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_leads;