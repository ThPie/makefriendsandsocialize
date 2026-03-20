
-- Delete related data first (foreign key dependencies), then events
DELETE FROM public.event_rsvps WHERE event_id IN (SELECT id FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled'));
DELETE FROM public.event_waitlist WHERE event_id IN (SELECT id FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled'));
DELETE FROM public.event_reminders WHERE event_id IN (SELECT id FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled'));
DELETE FROM public.event_photos WHERE event_id IN (SELECT id FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled'));
DELETE FROM public.gallery_items WHERE event_id IN (SELECT id FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled'));
DELETE FROM public.events WHERE date < CURRENT_DATE OR status IN ('past', 'cancelled');
