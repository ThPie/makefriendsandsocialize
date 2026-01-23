-- Fix permissive RLS policy for business_leads insert - require service role
DROP POLICY IF EXISTS "Service role can insert leads" ON public.business_leads;

CREATE POLICY "Service role can insert leads"
  ON public.business_leads FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Also allow authenticated users to insert leads (for public contact form via edge function)
CREATE POLICY "Anon can submit leads via edge function"
  ON public.business_leads FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'anon'::text OR (auth.jwt() ->> 'role'::text) = 'authenticated'::text);