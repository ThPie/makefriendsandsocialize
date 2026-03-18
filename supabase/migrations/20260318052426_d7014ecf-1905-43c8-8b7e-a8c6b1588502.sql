
-- Update handle_new_user to also create a default free-tier membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Create default free-tier (Socialite) membership
  INSERT INTO public.memberships (user_id, tier, status, started_at)
  VALUES (NEW.id, 'patron', 'active', NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;
