-- Create lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'converted', 'dismissed');

-- Create leads table for storing discovered leads
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_platform TEXT NOT NULL,
    source_url TEXT,
    lead_name TEXT,
    lead_email TEXT,
    lead_location TEXT,
    lead_interests TEXT[] DEFAULT '{}'::text[],
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    status lead_status NOT NULL DEFAULT 'new',
    outreach_suggestion TEXT,
    raw_content TEXT,
    notes TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Only admins can manage leads
CREATE POLICY "Admins can manage all leads"
ON public.leads
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_relevance_score ON public.leads(relevance_score DESC);
CREATE INDEX idx_leads_discovered_at ON public.leads(discovered_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_leads_updated_at();