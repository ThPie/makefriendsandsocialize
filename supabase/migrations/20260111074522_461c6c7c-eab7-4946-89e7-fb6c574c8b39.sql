-- Create a security definer function that checks if two users are matched
CREATE OR REPLACE FUNCTION public.is_matched_with(_user_id uuid, _other_dating_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.dating_matches dm
    JOIN public.dating_profiles dp ON dp.id = _other_dating_profile_id
    JOIN public.dating_profiles my_dp ON my_dp.user_id = _user_id
    WHERE dm.status = 'accepted'
      AND (
        (dm.user_a_id = my_dp.id AND dm.user_b_id = _other_dating_profile_id)
        OR (dm.user_b_id = my_dp.id AND dm.user_a_id = _other_dating_profile_id)
      )
  )
$$;

-- Create a secure function that returns LIMITED safe profile fields for matched users
-- This function NEVER returns phone_number, social media URLs, or sensitive health/financial data
CREATE OR REPLACE FUNCTION public.get_matched_profile_safe(_dating_profile_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  age integer,
  gender text,
  location text,
  occupation text,
  bio text,
  photo_url text,
  core_values text,
  future_goals text,
  love_language text,
  attachment_style text,
  introvert_extrovert text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if the calling user is matched with this profile
  IF NOT public.is_matched_with(auth.uid(), _dating_profile_id) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    dp.id,
    dp.display_name,
    dp.age,
    dp.gender,
    dp.location,  -- General location only, not exact
    dp.occupation,
    dp.bio,
    dp.photo_url,
    dp.core_values,
    dp.future_goals,
    dp.love_language,
    dp.attachment_style,
    dp.introvert_extrovert
  FROM public.dating_profiles dp
  WHERE dp.id = _dating_profile_id
    AND dp.is_active = true
    AND dp.status = 'active';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_matched_profile_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_matched_with(uuid, uuid) TO authenticated;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.get_matched_profile_safe IS 
'Secure function to retrieve limited dating profile information for matched users. 
NEVER exposes: phone_number, social media URLs (linkedin, instagram, facebook, twitter), 
health data (smoking, drinking, drug use), financial data (debt_status), or detailed relationship history.
Only returns basic profile info needed for initial connection.';