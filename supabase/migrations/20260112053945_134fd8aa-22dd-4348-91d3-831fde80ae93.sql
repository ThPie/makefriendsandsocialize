-- Drop remaining overly permissive RLS policies
-- These tables should only be accessed by service role (edge functions) - no anon/authenticated write access needed

-- The policies with "true" conditions for INSERT/UPDATE/DELETE are security risks
DROP POLICY IF EXISTS "Service role can manage confirmation requests" ON public.date_confirmation_requests;
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.event_reminders;
DROP POLICY IF EXISTS "Service role can manage reveal purchases" ON public.match_reveal_purchases;
DROP POLICY IF EXISTS "Service role can manage reveals" ON public.match_reveals;
DROP POLICY IF EXISTS "Service role can manage meetup stats" ON public.meetup_stats;
DROP POLICY IF EXISTS "Service role can manage trials" ON public.membership_trials;
DROP POLICY IF EXISTS "Service role can manage throttle logs" ON public.notification_throttle_log;
DROP POLICY IF EXISTS "Service role can manage pending bundles" ON public.pending_notification_bundle;