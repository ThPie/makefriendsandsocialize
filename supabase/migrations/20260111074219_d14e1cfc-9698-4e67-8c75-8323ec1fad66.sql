-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Active members can view visible profiles" ON public.profiles;

-- Create a security definer function to check if users are connected
CREATE OR REPLACE FUNCTION public.is_connected_with(_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connections
    WHERE status = 'accepted'
      AND (
        (requester_id = _user_id AND requested_id = _other_user_id)
        OR (requester_id = _other_user_id AND requested_id = _user_id)
      )
  )
$$;

-- Create new restrictive policy: users can only view profiles of people they're connected with
CREATE POLICY "Users can view profiles of their connections"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  id = auth.uid()
  -- Users can see profiles of people they have accepted connections with
  OR (is_visible = true AND public.is_connected_with(auth.uid(), id))
);

-- Keep admin policy intact (already exists)
-- Admins can view all profiles: has_role(auth.uid(), 'admin'::app_role)