-- Issue 13: Blog/Journal enhancements

-- Add new fields to journal_posts
ALTER TABLE public.journal_posts
ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Community',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create blog comments table
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.journal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create blog likes table
CREATE TABLE public.blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.journal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create blog bookmarks table
CREATE TABLE public.blog_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.journal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Issue 14: Architecture optimizations - Add cache metadata table
CREATE TABLE public.cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  cache_data jsonb NOT NULL,
  ttl_seconds integer NOT NULL DEFAULT 300,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view approved comments"
ON public.blog_comments FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can create comments"
ON public.blog_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.blog_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.blog_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
ON public.blog_comments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blog_likes
CREATE POLICY "Anyone can view like counts"
ON public.blog_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like posts"
ON public.blog_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.blog_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for blog_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.blog_bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark posts"
ON public.blog_bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks"
ON public.blog_bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for cache_metadata
CREATE POLICY "Edge functions can manage cache"
ON public.cache_metadata FOR ALL
USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_post_view_count(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.journal_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = _post_id;
END;
$$;

-- Function to calculate reading time from content
CREATE OR REPLACE FUNCTION public.calculate_reading_time(_content text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  word_count integer;
BEGIN
  IF _content IS NULL OR _content = '' THEN
    RETURN 1;
  END IF;
  word_count := array_length(regexp_split_to_array(trim(_content), E'\\s+'), 1);
  RETURN GREATEST(1, CEIL(word_count::float / 200));
END;
$$;

-- Trigger to auto-calculate reading time on insert/update
CREATE OR REPLACE FUNCTION public.update_reading_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.reading_time_minutes := public.calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_reading_time
BEFORE INSERT OR UPDATE ON public.journal_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_reading_time();

-- Function to get or set cache with TTL
CREATE OR REPLACE FUNCTION public.get_cached_data(_cache_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cached_row record;
BEGIN
  SELECT * INTO cached_row
  FROM public.cache_metadata
  WHERE cache_key = _cache_key
    AND expires_at > now();
  
  IF cached_row.id IS NOT NULL THEN
    RETURN cached_row.cache_data;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_cached_data(_cache_key text, _data jsonb, _ttl_seconds integer DEFAULT 300)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.cache_metadata (cache_key, cache_data, ttl_seconds, expires_at)
  VALUES (_cache_key, _data, _ttl_seconds, now() + (_ttl_seconds || ' seconds')::interval)
  ON CONFLICT (cache_key) DO UPDATE SET
    cache_data = EXCLUDED.cache_data,
    ttl_seconds = EXCLUDED.ttl_seconds,
    expires_at = EXCLUDED.expires_at,
    created_at = now();
END;
$$;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.cache_metadata WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Issue 14: Add missing indexes for performance at 400K scale
CREATE INDEX IF NOT EXISTS idx_journal_posts_published ON public.journal_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_posts_category ON public.journal_posts(category);
CREATE INDEX IF NOT EXISTS idx_journal_posts_tags ON public.journal_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON public.blog_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_user ON public.blog_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expiry ON public.cache_metadata(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_key ON public.cache_metadata(cache_key);

-- Additional performance indexes for 400K scale
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events(date, status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_business_profiles_visible ON public.business_profiles(is_visible, status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_active ON public.dating_profiles(is_active, status);
CREATE INDEX IF NOT EXISTS idx_memberships_active ON public.memberships(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending ON public.notification_queue(status, created_at) WHERE status = 'pending';