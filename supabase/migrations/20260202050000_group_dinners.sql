-- Create group_dinners table
CREATE TABLE IF NOT EXISTS public.group_dinners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  location_name text,
  location_address text,
  status text DEFAULT 'proposed', -- proposed, confirmed, cancelled
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create group_dinner_members table
CREATE TABLE IF NOT EXISTS public.group_dinner_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_dinner_id uuid NOT NULL REFERENCES public.group_dinners(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- pending, accepted, declined
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_dinner_id, user_id)
);

-- RLS Policies
ALTER TABLE public.group_dinners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_dinner_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group dinners they are part of" 
ON public.group_dinners FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_dinner_members 
    WHERE group_dinner_id = public.group_dinners.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own dinner membership" 
ON public.group_dinner_members FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own dinner status" 
ON public.group_dinner_members FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE TRIGGER handle_group_dinners_updated_at
  BEFORE UPDATE ON public.group_dinners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
