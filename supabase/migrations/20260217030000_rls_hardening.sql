-- Migration: Granular RLS Hardening
-- Created: 2026-02-17
-- Purpose: Revoke excessive permissions on materialized views and sensitive columns

-- 1. Secure Materialized View: active_dating_profiles
-- This view was granted to authenticated users but contains compatibility data that should not be scraped.
-- It is currently unused by the frontend.
REVOKE SELECT ON public.active_dating_profiles FROM authenticated, anon;
GRANT SELECT ON public.active_dating_profiles TO service_role;

-- 2. Secure Sensitive Columns: dating_matches
-- Users should be able to see their matches, but NEVER the admin_notes recorded by the matching team.
REVOKE SELECT (admin_notes) ON public.dating_matches FROM authenticated, anon;
GRANT SELECT (admin_notes) ON public.dating_matches TO service_role;

-- 3. Secure Sensitive Columns: memberships
-- Stripe IDs are sensitive and should not be exposed to the browser.
-- They are only needed by edge functions (service_role) for billing syncing.
REVOKE SELECT (stripe_customer_id, stripe_subscription_id) ON public.memberships FROM authenticated, anon;
GRANT SELECT (stripe_customer_id, stripe_subscription_id) ON public.memberships TO service_role;

-- 4. Secure Sensitive Columns: application_waitlist
-- Admin notes on applications should also be protected.
REVOKE SELECT (admin_notes) ON public.application_waitlist FROM authenticated, anon;
GRANT SELECT (admin_notes) ON public.application_waitlist TO service_role;

-- Note: Admins accessing via the Supabase Dashboard or API with service_role will still have full access.
