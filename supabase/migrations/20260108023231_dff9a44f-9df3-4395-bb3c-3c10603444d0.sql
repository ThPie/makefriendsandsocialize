-- Table to track daily notification counts per user
CREATE TABLE public.notification_throttle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notifications_sent INTEGER NOT NULL DEFAULT 0,
  bundled_count INTEGER NOT NULL DEFAULT 0,
  last_notification_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_date)
);

-- Table to track pending notifications for bundling
CREATE TABLE public.pending_notification_bundle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  bundled_into UUID REFERENCES notification_queue(id)
);

-- Table to track date confirmations
CREATE TABLE public.date_confirmation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_proposal_id UUID NOT NULL REFERENCES meeting_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  confirmation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  response_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS
ALTER TABLE public.notification_throttle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_notification_bundle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_confirmation_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_throttle_log
CREATE POLICY "Service role can manage throttle logs"
ON public.notification_throttle_log FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for pending_notification_bundle
CREATE POLICY "Service role can manage pending bundles"
ON public.pending_notification_bundle FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for date_confirmation_requests
CREATE POLICY "Service role can manage confirmation requests"
ON public.date_confirmation_requests FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own confirmation requests"
ON public.date_confirmation_requests FOR SELECT
USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_throttle_log_user_date ON public.notification_throttle_log(user_id, notification_date);
CREATE INDEX idx_pending_bundle_user ON public.pending_notification_bundle(user_id) WHERE processed_at IS NULL;
CREATE INDEX idx_confirmation_token ON public.date_confirmation_requests(confirmation_token);
CREATE INDEX idx_confirmation_status ON public.date_confirmation_requests(status) WHERE status = 'pending';