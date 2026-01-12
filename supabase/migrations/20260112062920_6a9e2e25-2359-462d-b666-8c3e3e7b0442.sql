-- Drop the insecure database functions that use hardcoded encryption keys
-- All encryption should now go through the secure edge function 'encrypt-sensitive-data'
-- which uses proper environment variables for key management

DROP FUNCTION IF EXISTS public.encrypt_sensitive_field(text, text);
DROP FUNCTION IF EXISTS public.decrypt_sensitive_field(text, text);

-- Add a comment explaining the security improvement
COMMENT ON TABLE public.dating_profile_sensitive_data IS 'Sensitive dating profile data encrypted using the encrypt-sensitive-data edge function with AES-256-GCM. Database-level encryption functions have been removed in favor of secure key management through environment variables.';