-- Create table for storing Meetup stats
CREATE TABLE public.meetup_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1),
  avatar_urls TEXT[] DEFAULT '{}',
  meetup_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meetup_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view stats)
CREATE POLICY "Anyone can view meetup stats" 
ON public.meetup_stats 
FOR SELECT 
USING (true);

-- Create policy for service role to update (edge functions)
CREATE POLICY "Service role can manage meetup stats" 
ON public.meetup_stats 
FOR ALL 
USING (true)
WITH CHECK (true);