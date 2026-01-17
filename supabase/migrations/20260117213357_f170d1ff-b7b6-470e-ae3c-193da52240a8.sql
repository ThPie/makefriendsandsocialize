-- Fix Security Vulnerabilities: Stricter RLS Policies
-- Using existing has_role function for admin checks

-- =============================================================================
-- 1. CIRCLE_APPLICATIONS TABLE: Protect applicant contact info
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit a circle application" ON public.circle_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.circle_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.circle_applications;
DROP POLICY IF EXISTS "Anyone can submit circle application" ON public.circle_applications;
DROP POLICY IF EXISTS "Users can view own circle applications" ON public.circle_applications;
DROP POLICY IF EXISTS "Admins can view all circle applications" ON public.circle_applications;
DROP POLICY IF EXISTS "Admins can update circle applications" ON public.circle_applications;

-- Allow authenticated users to submit applications
CREATE POLICY "Anyone can submit circle application"
ON public.circle_applications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view only their own applications
CREATE POLICY "Users can view own circle applications"
ON public.circle_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all applications using has_role function
CREATE POLICY "Admins can view all circle applications"
ON public.circle_applications FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications (for review)
CREATE POLICY "Admins can update circle applications"
ON public.circle_applications FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================================================
-- 2. Create secure view for public profile display (minimal info)
-- =============================================================================

-- Drop existing view if exists
DROP VIEW IF EXISTS public.profiles_public;

-- Create a minimal public view that excludes sensitive data
CREATE VIEW public.profiles_public
WITH (security_invoker = on)
AS SELECT 
  id,
  first_name,
  bio,
  is_visible,
  created_at
FROM public.profiles
WHERE is_visible = true;