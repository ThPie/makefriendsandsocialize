-- Fix the overly permissive INSERT policy for circle_applications
-- Require that the user_id matches the authenticated user OR is null (for unauthenticated submissions)

DROP POLICY IF EXISTS "Anyone can submit circle application" ON public.circle_applications;

-- Create a more restrictive policy
CREATE POLICY "Users can submit their own circle application"
ON public.circle_applications FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());