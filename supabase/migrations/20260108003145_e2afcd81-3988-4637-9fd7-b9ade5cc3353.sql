-- Add ranked core values array column
ALTER TABLE public.dating_profiles 
ADD COLUMN IF NOT EXISTS core_values_ranked text[];

-- Create index for array matching
CREATE INDEX IF NOT EXISTS idx_dating_profiles_core_values_ranked 
ON public.dating_profiles USING GIN (core_values_ranked);