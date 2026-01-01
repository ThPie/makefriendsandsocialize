-- Create enum for scan types and severity levels
CREATE TYPE public.security_scan_type AS ENUM ('automatic', 'manual', 'periodic');
CREATE TYPE public.security_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.security_status AS ENUM ('pending', 'clean', 'flagged', 'under_review', 'cleared', 'suspended');
CREATE TYPE public.security_recommendation AS ENUM ('approve', 'investigate', 'suspend', 'remove');

-- Create member security reports table
CREATE TABLE public.member_security_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scan_type security_scan_type NOT NULL DEFAULT 'manual',
    status security_status NOT NULL DEFAULT 'pending',
    severity security_severity DEFAULT 'low',
    findings JSONB DEFAULT '{}'::jsonb,
    red_flags TEXT[] DEFAULT '{}'::text[],
    positive_signals TEXT[] DEFAULT '{}'::text[],
    identity_score INTEGER CHECK (identity_score >= 0 AND identity_score <= 100),
    social_consistency_score INTEGER CHECK (social_consistency_score >= 0 AND social_consistency_score <= 100),
    risk_assessment TEXT,
    ai_recommendation security_recommendation,
    admin_decision TEXT,
    admin_notes TEXT,
    sources_checked TEXT[] DEFAULT '{}'::text[],
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_security_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin-only access)
CREATE POLICY "Admins can manage all security reports"
ON public.member_security_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_member_security_reports_updated_at
BEFORE UPDATE ON public.member_security_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_member_security_reports_user_id ON public.member_security_reports(user_id);
CREATE INDEX idx_member_security_reports_status ON public.member_security_reports(status);
CREATE INDEX idx_member_security_reports_severity ON public.member_security_reports(severity);