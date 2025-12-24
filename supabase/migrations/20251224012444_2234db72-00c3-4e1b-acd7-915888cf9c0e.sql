-- Add professional background fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN industry text,
ADD COLUMN job_title text;

-- Add professional background fields to application_waitlist table
ALTER TABLE public.application_waitlist 
ADD COLUMN industry text,
ADD COLUMN job_title text;