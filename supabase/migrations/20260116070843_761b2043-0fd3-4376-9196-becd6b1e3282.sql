-- Create daily_quotes table to store AI-generated motivational quotes
CREATE TABLE public.daily_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  quote_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read quotes (public feature)
CREATE POLICY "Anyone can view daily quotes"
  ON public.daily_quotes
  FOR SELECT
  USING (true);

-- Only service role can insert/update (edge functions)
CREATE POLICY "Service role can manage quotes"
  ON public.daily_quotes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for fast date lookups
CREATE INDEX idx_daily_quotes_date ON public.daily_quotes(quote_date DESC);