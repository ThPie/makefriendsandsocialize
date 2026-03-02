-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.dating_profiles;

-- Drop the old restrictive policy 
DROP POLICY IF EXISTS "Users can view their own dating profile" ON public.dating_profiles;

-- Create a security definer function to get matched profile IDs without recursion
CREATE OR REPLACE FUNCTION public.get_matched_dating_profile_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN dm.user_a_id = dp.id THEN dm.user_b_id 
    ELSE dm.user_a_id 
  END
  FROM public.dating_matches dm
  JOIN public.dating_profiles dp ON dp.user_id = _user_id
  WHERE dm.user_a_id = dp.id OR dm.user_b_id = dp.id;
$$;

-- Create new policy that allows viewing own profile + matched profiles
CREATE POLICY "Users can view own and matched profiles"
ON public.dating_profiles
FOR SELECT
USING (
  user_id = auth.uid()
  OR id IN (SELECT public.get_matched_dating_profile_ids(auth.uid()))
);