-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create business profile status enum
CREATE TYPE public.business_status AS ENUM ('pending', 'approved', 'featured', 'rejected');

-- Create business_profiles table
CREATE TABLE public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  industry TEXT,
  website TEXT,
  contact_email TEXT,
  location TEXT,
  services TEXT[] DEFAULT '{}'::TEXT[],
  status public.business_status NOT NULL DEFAULT 'pending',
  is_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own business profile"
ON public.business_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own business profile"
ON public.business_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own business profile"
ON public.business_profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Active members can view approved/featured businesses"
ON public.business_profiles
FOR SELECT
USING (
  (status IN ('approved', 'featured') AND is_visible = true)
  AND has_active_membership(auth.uid())
);

CREATE POLICY "Admins can manage all business profiles"
ON public.business_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON public.business_profiles(status);
CREATE INDEX idx_business_profiles_industry ON public.business_profiles(industry);

-- Create updated_at trigger
CREATE TRIGGER update_business_profiles_updated_at
BEFORE UPDATE ON public.business_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);

-- Storage policies for business logos
CREATE POLICY "Anyone can view business logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-logos');

CREATE POLICY "Users can upload their own business logo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own business logo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business logo"
ON storage.objects
FOR DELETE
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);