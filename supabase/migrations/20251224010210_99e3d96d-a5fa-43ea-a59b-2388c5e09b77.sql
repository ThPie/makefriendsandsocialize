-- Create enum for membership tiers
CREATE TYPE public.membership_tier AS ENUM ('patron', 'fellow', 'founder');

-- Create enum for membership status
CREATE TYPE public.membership_status AS ENUM ('pending', 'active', 'cancelled', 'expired');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for connection status
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'declined');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  signature_style TEXT,
  favorite_brands TEXT[] DEFAULT '{}',
  avatar_urls TEXT[] DEFAULT '{}',
  values_in_partner TEXT,
  interests TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier membership_tier NOT NULL DEFAULT 'patron',
  status membership_status NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create application_waitlist table
CREATE TABLE public.application_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  style_description TEXT,
  favorite_brands TEXT[] DEFAULT '{}',
  values_in_partner TEXT,
  interests TEXT[] DEFAULT '{}',
  status application_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create connections table for introductions
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (requester_id, requested_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user membership tier
CREATE OR REPLACE FUNCTION public.get_membership_tier(_user_id UUID)
RETURNS membership_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier
  FROM public.memberships
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;

-- Create function to check if user has active membership
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Active members can view visible profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  is_visible = true 
  AND public.has_active_membership(auth.uid())
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for memberships
CREATE POLICY "Users can view their own membership"
ON public.memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all memberships"
ON public.memberships FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for application_waitlist
CREATE POLICY "Users can view their own application"
ON public.application_waitlist FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own application"
ON public.application_waitlist FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending application"
ON public.application_waitlist FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all applications"
ON public.application_waitlist FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for connections
CREATE POLICY "Users can view connections they're part of"
ON public.connections FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR requested_id = auth.uid());

CREATE POLICY "Active fellow/founder members can request introductions"
ON public.connections FOR INSERT
TO authenticated
WITH CHECK (
  requester_id = auth.uid()
  AND public.get_membership_tier(auth.uid()) IN ('fellow', 'founder')
);

CREATE POLICY "Users can update connections they received"
ON public.connections FOR UPDATE
TO authenticated
USING (requested_id = auth.uid());

CREATE POLICY "Users can delete their own requests"
ON public.connections FOR DELETE
TO authenticated
USING (requester_id = auth.uid());

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile and membership on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  -- Create membership with pending status
  INSERT INTO public.memberships (user_id, status)
  VALUES (NEW.id, 'pending');
  
  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();