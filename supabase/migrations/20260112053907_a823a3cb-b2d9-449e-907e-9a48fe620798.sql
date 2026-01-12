-- Continue fixing remaining RLS issues - drop the overly permissive "Service role can manage referrals" policy
DROP POLICY IF EXISTS "Service role can manage referrals" ON public.referrals;