-- Create circle_applications table
CREATE TABLE public.circle_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  circle_name TEXT NOT NULL CHECK (circle_name IN ('the-gentlemen', 'les-amis')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('explorer', 'member', 'fellow')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  
  -- The Gentlemen specific fields
  instagram_linkedin TEXT,
  reason_to_join TEXT,
  style_preference TEXT CHECK (style_preference IN ('classic', 'modern-classic', 'other') OR style_preference IS NULL),
  dress_code_commitment BOOLEAN,
  
  -- Les Amis specific fields
  french_level TEXT CHECK (french_level IN ('beginner', 'intermediate', 'advanced', 'native') OR french_level IS NULL),
  improvement_goals TEXT,
  comfortable_speaking BOOLEAN
);

-- Enable RLS
ALTER TABLE public.circle_applications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own applications
CREATE POLICY "Users can create their own circle applications"
ON public.circle_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view their own circle applications"
ON public.circle_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all circle applications"
ON public.circle_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications
CREATE POLICY "Admins can update circle applications"
ON public.circle_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_circle_applications_updated_at
BEFORE UPDATE ON public.circle_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();