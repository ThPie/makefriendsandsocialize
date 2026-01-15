-- Allow anonymous/public users to insert testimonials (for reviews without signup)
CREATE POLICY "Allow public testimonial submissions"
ON public.testimonials
FOR INSERT
TO anon, authenticated
WITH CHECK (
  is_approved = false AND
  source = 'public'
);