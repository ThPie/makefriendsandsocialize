-- Delete all testimonials that were imported from Meetup
DELETE FROM public.testimonials WHERE source = 'meetup';