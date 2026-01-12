-- Create a separate admin-only table for sensitive applicant contact information
-- This prevents email harvesting by moving sensitive data out of the main applications table

CREATE TABLE public.circle_application_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES public.circle_applications(id) ON DELETE CASCADE,
  email_encrypted TEXT NOT NULL,
  instagram_linkedin_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.circle_application_contacts ENABLE ROW LEVEL SECURITY;

-- Only admins can access contact information
CREATE POLICY "Only admins can view application contacts"
ON public.circle_application_contacts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update application contacts"
ON public.circle_application_contacts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow insert during application creation (will be handled by edge function)
CREATE POLICY "Service role can insert application contacts"
ON public.circle_application_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.circle_applications ca 
    WHERE ca.id = application_id 
    AND ca.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_circle_application_contacts_updated_at
  BEFORE UPDATE ON public.circle_application_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a secure function for admins to get decrypted contact info
CREATE OR REPLACE FUNCTION public.get_application_contact_safe(_application_id UUID)
RETURNS TABLE (
  email TEXT,
  instagram_linkedin TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    cac.email_encrypted as email,
    cac.instagram_linkedin_encrypted as instagram_linkedin
  FROM public.circle_application_contacts cac
  WHERE cac.application_id = _application_id;
END;
$$;