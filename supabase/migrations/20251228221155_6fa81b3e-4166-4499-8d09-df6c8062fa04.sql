-- Add new columns to dating_profiles for enhanced intake form
ALTER TABLE public.dating_profiles 
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS support_style text,
  ADD COLUMN IF NOT EXISTS apology_language text,
  ADD COLUMN IF NOT EXISTS vulnerability_check text,
  ADD COLUMN IF NOT EXISTS defining_enough text,
  ADD COLUMN IF NOT EXISTS friendship_benchmark text,
  ADD COLUMN IF NOT EXISTS unpopular_opinion text,
  ADD COLUMN IF NOT EXISTS current_curiosity text,
  ADD COLUMN IF NOT EXISTS financial_philosophy text,
  ADD COLUMN IF NOT EXISTS politics_stance text,
  ADD COLUMN IF NOT EXISTS religion_stance text,
  ADD COLUMN IF NOT EXISTS future_goals text;

-- Update the status column to use new values (new, vetted, matched)
-- First, update existing records to use new status values
UPDATE public.dating_profiles 
SET status = 'new' 
WHERE status = 'pending';

UPDATE public.dating_profiles 
SET status = 'vetted' 
WHERE status = 'approved';

-- Note: 'rejected' status remains as 'rejected' and 'matched' is new