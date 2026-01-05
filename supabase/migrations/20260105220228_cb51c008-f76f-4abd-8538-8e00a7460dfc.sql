-- Event Reminders Table
CREATE TABLE public.event_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT DEFAULT '24h',
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_reminders
CREATE POLICY "Users can view their own reminders" ON public.event_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage reminders" ON public.event_reminders
  FOR ALL USING (true);

-- Create index for efficient querying
CREATE INDEX idx_event_reminders_event_id ON public.event_reminders(event_id);
CREATE INDEX idx_event_reminders_user_status ON public.event_reminders(user_id, status);

-- Referrals Table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referred_email TEXT,
  referred_user_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  reward_type TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Service role can manage referrals" ON public.referrals
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Add referral columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Create unique index on referral_code
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_code TEXT;
  random_suffix TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Use first name or 'MEMBER' if not set
  base_code := UPPER(COALESCE(SUBSTRING(NEW.first_name FROM 1 FOR 6), 'MEMBER'));
  
  -- Keep trying until we get a unique code
  LOOP
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    final_code := base_code || '-' || random_suffix;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = final_code) INTO code_exists;
    
    IF NOT code_exists THEN
      NEW.referral_code := final_code;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- Function to update referral code when first_name changes (optional regeneration)
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a referral is converted, increment the referrer's count
  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status <> 'converted') THEN
    UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE id = NEW.referrer_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for referral count updates
CREATE TRIGGER update_referral_count_trigger
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_count();

-- Add referral badges to member_badges tracking
-- (The badge definitions are in code, this just ensures the system supports them)