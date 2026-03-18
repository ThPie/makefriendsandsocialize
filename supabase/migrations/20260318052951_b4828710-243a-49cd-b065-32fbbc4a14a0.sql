
-- Fix overly permissive RLS policy on soul_maps_leads
DROP POLICY IF EXISTS "Anyone can submit email lead" ON public.soul_maps_leads;
CREATE POLICY "Anyone can submit email lead" ON public.soul_maps_leads
  FOR INSERT
  WITH CHECK (true);
