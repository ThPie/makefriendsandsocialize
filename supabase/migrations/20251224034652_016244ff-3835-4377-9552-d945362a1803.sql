-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  image_url TEXT,
  tier membership_tier NOT NULL DEFAULT 'patron',
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view upcoming events
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

-- Only admins can manage events
CREATE POLICY "Admins can manage events"
ON public.events FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Event RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Users can view their own RSVPs
CREATE POLICY "Users can view their own RSVPs"
ON public.event_rsvps FOR SELECT
USING (user_id = auth.uid());

-- Active members can RSVP
CREATE POLICY "Active members can RSVP"
ON public.event_rsvps FOR INSERT
WITH CHECK (user_id = auth.uid() AND has_active_membership(auth.uid()));

-- Users can cancel their own RSVP
CREATE POLICY "Users can delete their own RSVP"
ON public.event_rsvps FOR DELETE
USING (user_id = auth.uid());

-- Admins can manage all RSVPs
CREATE POLICY "Admins can manage all RSVPs"
ON public.event_rsvps FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Journal posts table
CREATE TABLE public.journal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
ON public.journal_posts FOR SELECT
USING (is_published = true);

-- Admins can manage all posts
CREATE POLICY "Admins can manage all posts"
ON public.journal_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Gallery items table
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery items
CREATE POLICY "Anyone can view gallery items"
ON public.gallery_items FOR SELECT
USING (true);

-- Admins can manage gallery items
CREATE POLICY "Admins can manage gallery items"
ON public.gallery_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_journal_posts_updated_at
BEFORE UPDATE ON public.journal_posts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-assign admin role for specific email on signup
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'pngalamulume46@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign admin on user creation
CREATE TRIGGER on_auth_user_created_assign_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin_role();