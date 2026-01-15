-- Issue 18: Payment improvements - add tracking fields and invoice history

-- Add payment tracking fields to memberships table
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS failed_payment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_error text,
ADD COLUMN IF NOT EXISTS last_payment_attempt_at timestamptz,
ADD COLUMN IF NOT EXISTS dunning_status text DEFAULT 'none' CHECK (dunning_status IN ('none', 'retry_1', 'retry_2', 'retry_3', 'failed'));

-- Create invoice history table
CREATE TABLE IF NOT EXISTS public.invoice_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  stripe_invoice_id text UNIQUE,
  stripe_customer_id text,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  pdf_url text,
  hosted_invoice_url text,
  invoice_number text,
  description text,
  period_start timestamptz,
  period_end timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_history
ALTER TABLE public.invoice_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices"
  ON public.invoice_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage invoices (for webhook updates)
CREATE POLICY "Service role can manage invoices"
  ON public.invoice_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create dunning_retry_log table to track retry attempts
CREATE TABLE IF NOT EXISTS public.dunning_retry_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  membership_id uuid REFERENCES public.memberships(id) ON DELETE CASCADE,
  stripe_invoice_id text,
  retry_number integer NOT NULL,
  scheduled_at timestamptz NOT NULL,
  executed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on dunning_retry_log
ALTER TABLE public.dunning_retry_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage dunning logs
CREATE POLICY "Service role can manage dunning logs"
  ON public.dunning_retry_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for invoice_history
CREATE INDEX IF NOT EXISTS idx_invoice_history_user ON public.invoice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_history_status ON public.invoice_history(status);
CREATE INDEX IF NOT EXISTS idx_invoice_history_created ON public.invoice_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_history_stripe_id ON public.invoice_history(stripe_invoice_id);

-- Create indexes for dunning_retry_log
CREATE INDEX IF NOT EXISTS idx_dunning_retry_scheduled ON public.dunning_retry_log(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_dunning_retry_user ON public.dunning_retry_log(user_id);

-- Analytics tracking table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  session_id text,
  event_name text NOT NULL,
  event_properties jsonb DEFAULT '{}',
  page_url text,
  referrer text,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read analytics
CREATE POLICY "Service role can manage analytics"
  ON public.analytics_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can insert their own events
CREATE POLICY "Users can insert their own analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events(session_id);

-- Update trigger for invoice_history
CREATE TRIGGER update_invoice_history_updated_at
  BEFORE UPDATE ON public.invoice_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();