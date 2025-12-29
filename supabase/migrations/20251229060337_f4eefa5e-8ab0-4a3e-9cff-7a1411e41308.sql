-- Fix PostgREST relationship for nested selects by pointing connections foreign keys at public.profiles
-- (PostgREST cannot build relationships to auth.users in the API schema cache)

ALTER TABLE public.connections
  DROP CONSTRAINT IF EXISTS connections_requester_id_fkey,
  DROP CONSTRAINT IF EXISTS connections_requested_id_fkey;

ALTER TABLE public.connections
  ADD CONSTRAINT connections_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT connections_requested_id_fkey
    FOREIGN KEY (requested_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID;