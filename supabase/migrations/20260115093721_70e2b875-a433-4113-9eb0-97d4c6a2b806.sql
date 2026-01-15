-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Create a more restrictive policy that only allows inserting with required fields
-- and ensures is_active defaults properly (prevents someone from inserting with is_active=false to bypass)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (
  -- Ensure required email field is provided and not empty
  email IS NOT NULL 
  AND length(trim(email)) > 0
  -- Ensure is_active is true for new subscriptions
  AND is_active = true
  -- Ensure unsubscribed_at is null for new subscriptions
  AND unsubscribed_at IS NULL
);