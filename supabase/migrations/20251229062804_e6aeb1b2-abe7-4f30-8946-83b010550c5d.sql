-- Add date_of_birth column to profiles table for 21+ age verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add job_title column if it doesn't exist (check schema shows it exists)
-- Add industry column if it doesn't exist (check schema shows it exists)

-- Add comment for the new column
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Member date of birth for 21+ age verification';