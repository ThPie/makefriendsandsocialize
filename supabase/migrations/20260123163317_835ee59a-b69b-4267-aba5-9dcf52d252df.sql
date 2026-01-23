-- Add slug column to business_profiles for URL-friendly landing pages
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate URL-friendly slug
CREATE OR REPLACE FUNCTION generate_business_slug(business_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(regexp_replace(business_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g'); -- Remove multiple hyphens
  base_slug := trim(both '-' from base_slug); -- Trim leading/trailing hyphens
  
  final_slug := base_slug;
  
  -- Check for conflicts and append number if needed
  WHILE EXISTS (SELECT 1 FROM business_profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_business_slug(NEW.business_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_set_business_slug ON business_profiles;
CREATE TRIGGER trigger_set_business_slug
  BEFORE INSERT OR UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_business_slug();

-- Update existing business_profiles with slugs
UPDATE business_profiles 
SET slug = generate_business_slug(business_name) 
WHERE slug IS NULL;

-- Create business_lead_packages table for tier definitions
CREATE TABLE public.business_lead_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  package_type text NOT NULL DEFAULT 'basic' CHECK (package_type IN ('basic', 'pro', 'premium')),
  leads_per_month integer NOT NULL DEFAULT 10,
  priority_matching boolean NOT NULL DEFAULT false,
  price_monthly integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  stripe_subscription_id text,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create business_leads table for storing leads
CREATE TABLE public.business_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  company_name text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  source text NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'ai_matched', 'referral')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  location text,
  category_interest text,
  matched_at timestamp with time zone,
  contacted_at timestamp with time zone,
  converted_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create business_lead_usage table for tracking monthly allocation
CREATE TABLE public.business_lead_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES business_lead_packages(id) ON DELETE SET NULL,
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: "2026-01"
  leads_allocated integer NOT NULL DEFAULT 10,
  leads_received integer NOT NULL DEFAULT 0,
  leads_matched integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(business_id, month_year)
);

-- Enable RLS on all tables
ALTER TABLE public.business_lead_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_lead_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_lead_packages
CREATE POLICY "Business owners can view their own packages"
  ON public.business_lead_packages FOR SELECT
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all packages"
  ON public.business_lead_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for business_leads
CREATE POLICY "Business owners can view their own leads"
  ON public.business_leads FOR SELECT
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Business owners can update their own leads"
  ON public.business_leads FOR UPDATE
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all leads"
  ON public.business_leads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert leads"
  ON public.business_leads FOR INSERT
  WITH CHECK (true);

-- RLS Policies for business_lead_usage
CREATE POLICY "Business owners can view their own usage"
  ON public.business_lead_usage FOR SELECT
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all usage"
  ON public.business_lead_usage FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get business lead stats
CREATE OR REPLACE FUNCTION get_business_lead_stats(p_business_id uuid)
RETURNS TABLE (
  total_leads bigint,
  new_leads bigint,
  contacted_leads bigint,
  converted_leads bigint,
  lost_leads bigint,
  conversion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_leads,
    COUNT(*) FILTER (WHERE status = 'new')::bigint as new_leads,
    COUNT(*) FILTER (WHERE status = 'contacted')::bigint as contacted_leads,
    COUNT(*) FILTER (WHERE status = 'converted')::bigint as converted_leads,
    COUNT(*) FILTER (WHERE status = 'lost')::bigint as lost_leads,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status IN ('converted', 'lost')) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'converted')::numeric / 
                  COUNT(*) FILTER (WHERE status IN ('converted', 'lost'))::numeric) * 100, 1)
      ELSE 0 
    END as conversion_rate
  FROM business_leads
  WHERE business_id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if business can receive leads
CREATE OR REPLACE FUNCTION can_receive_leads(p_business_id uuid)
RETURNS boolean AS $$
DECLARE
  current_month text;
  usage_record record;
  allocation integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get or create usage record for current month
  SELECT * INTO usage_record 
  FROM business_lead_usage 
  WHERE business_id = p_business_id AND month_year = current_month;
  
  IF usage_record IS NULL THEN
    -- Get allocation from active package or default
    SELECT COALESCE(
      (SELECT leads_per_month FROM business_lead_packages 
       WHERE business_id = p_business_id AND is_active = true 
       ORDER BY created_at DESC LIMIT 1),
      5 -- Default free allocation
    ) INTO allocation;
    
    INSERT INTO business_lead_usage (business_id, month_year, leads_allocated, leads_received)
    VALUES (p_business_id, current_month, allocation, 0)
    RETURNING * INTO usage_record;
  END IF;
  
  RETURN usage_record.leads_received < usage_record.leads_allocated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment lead count
CREATE OR REPLACE FUNCTION increment_lead_count(p_business_id uuid, p_is_matched boolean DEFAULT false)
RETURNS void AS $$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  UPDATE business_lead_usage
  SET 
    leads_received = leads_received + 1,
    leads_matched = CASE WHEN p_is_matched THEN leads_matched + 1 ELSE leads_matched END
  WHERE business_id = p_business_id AND month_year = current_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create updated_at trigger for new tables
CREATE TRIGGER update_business_lead_packages_updated_at
  BEFORE UPDATE ON business_lead_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_leads_updated_at
  BEFORE UPDATE ON business_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_business_leads_business_id ON business_leads(business_id);
CREATE INDEX idx_business_leads_status ON business_leads(status);
CREATE INDEX idx_business_leads_created_at ON business_leads(created_at DESC);
CREATE INDEX idx_business_lead_packages_business_id ON business_lead_packages(business_id);
CREATE INDEX idx_business_profiles_slug ON business_profiles(slug);