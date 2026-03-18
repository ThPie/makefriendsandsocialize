
-- Backfill missing memberships for existing users
INSERT INTO public.memberships (user_id, tier, status, started_at)
SELECT p.id, 'patron', 'active', NOW()
FROM public.profiles p
LEFT JOIN public.memberships m ON p.id = m.user_id
WHERE m.id IS NULL
ON CONFLICT (user_id) DO NOTHING;
