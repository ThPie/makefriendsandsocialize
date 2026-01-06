-- Create business introduction requests table
CREATE TABLE public.business_introduction_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(business_id, requester_id)
);

-- Enable RLS
ALTER TABLE public.business_introduction_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own requests"
ON public.business_introduction_requests
FOR SELECT
USING (requester_id = auth.uid());

CREATE POLICY "Business owners can view requests for their business"
ON public.business_introduction_requests
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Active members can create introduction requests"
ON public.business_introduction_requests
FOR INSERT
WITH CHECK (
  requester_id = auth.uid() 
  AND has_active_membership(auth.uid())
  AND (get_membership_tier(auth.uid()) = 'fellow' OR get_membership_tier(auth.uid()) = 'founder')
);

CREATE POLICY "Business owners can update requests for their business"
ON public.business_introduction_requests
FOR UPDATE
USING (
  business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all requests"
ON public.business_introduction_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_business_intro_requests_business ON public.business_introduction_requests(business_id);
CREATE INDEX idx_business_intro_requests_requester ON public.business_introduction_requests(requester_id);
CREATE INDEX idx_business_intro_requests_status ON public.business_introduction_requests(status);