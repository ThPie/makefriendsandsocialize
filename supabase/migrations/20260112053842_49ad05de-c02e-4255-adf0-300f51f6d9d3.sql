-- Drop the duplicate policy that was just partially created
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;