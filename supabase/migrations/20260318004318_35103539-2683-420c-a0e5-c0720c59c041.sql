
CREATE TABLE public.content_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  circle TEXT,
  source_platform TEXT NOT NULL,
  trend_summary TEXT NOT NULL,
  key_insights TEXT[] DEFAULT '{}',
  suggested_title TEXT,
  suggested_angle TEXT,
  relevance_score INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'new',
  used_in_post_id UUID REFERENCES public.journal_posts(id),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage research" ON public.content_research
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_content_research_status ON public.content_research(status);
CREATE INDEX idx_content_research_created ON public.content_research(created_at DESC);
