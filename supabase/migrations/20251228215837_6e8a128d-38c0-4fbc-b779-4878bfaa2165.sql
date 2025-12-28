-- Create dating_profiles table for matchmaking
CREATE TABLE public.dating_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Basics
  display_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  location text,
  occupation text,
  
  -- Preferences
  target_gender text NOT NULL,
  age_range_min integer NOT NULL DEFAULT 18,
  age_range_max integer NOT NULL DEFAULT 99,
  
  -- Deep Questions
  conflict_resolution text,
  emotional_connection text,
  tuesday_night_test text,
  dealbreakers text,
  core_values text,
  
  -- System
  status text NOT NULL DEFAULT 'pending',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dating_matches table for AI-generated matches
CREATE TABLE public.dating_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid REFERENCES public.dating_profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_id uuid REFERENCES public.dating_profiles(id) ON DELETE CASCADE NOT NULL,
  
  compatibility_score integer NOT NULL,
  match_reason text NOT NULL,
  
  status text DEFAULT 'pending',
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_a_id, user_b_id)
);

-- Enable RLS
ALTER TABLE public.dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dating_profiles
CREATE POLICY "Users can view their own dating profile"
ON public.dating_profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own dating profile"
ON public.dating_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dating profile"
ON public.dating_profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all dating profiles"
ON public.dating_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for dating_matches
CREATE POLICY "Users can view matches they're part of"
ON public.dating_matches FOR SELECT
USING (
  user_a_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  OR user_b_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all matches"
ON public.dating_matches FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_dating_profiles_user_id ON public.dating_profiles(user_id);
CREATE INDEX idx_dating_profiles_status ON public.dating_profiles(status);
CREATE INDEX idx_dating_matches_user_a ON public.dating_matches(user_a_id);
CREATE INDEX idx_dating_matches_user_b ON public.dating_matches(user_b_id);

-- Trigger for updated_at
CREATE TRIGGER update_dating_profiles_updated_at
  BEFORE UPDATE ON public.dating_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_dating_matches_updated_at
  BEFORE UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();