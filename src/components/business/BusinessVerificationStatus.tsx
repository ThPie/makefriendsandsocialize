import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Globe,
  Building2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BusinessVerificationStatusProps {
  businessId: string;
  className?: string;
}

interface VerificationReport {
  id: string;
  business_id: string;
  verification_score: number | null;
  status: string;
  findings: any;
  sources_checked: string[] | null;
  positive_signals: string[] | null;
  red_flags: string[] | null;
  ai_recommendation: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function BusinessVerificationStatus({ businessId, className }: BusinessVerificationStatusProps) {
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['business-verification', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_verification_reports')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as VerificationReport | null;
    },
    enabled: !!businessId,
  });

  const triggerVerification = useMutation({
    mutationFn: async () => {
      setIsVerifying(true);
      const { data, error } = await supabase.functions.invoke('verify-business-profile', {
        body: { business_id: businessId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Verification started! This may take a few minutes.');
      queryClient.invalidateQueries({ queryKey: ['business-verification', businessId] });
    },
    onError: (error) => {
      console.error('Verification error:', error);
      toast.error('Failed to start verification. Please try again.');
    },
    onSettled: () => {
      setIsVerifying(false);
    },
  });

  const getStatusConfig = (status: string, score: number | null) => {
    if (status === 'pending' || status === 'processing') {
      return {
        label: 'Verification in Progress',
        icon: Clock,
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        description: 'Our system is verifying your business information.',
      };
    }
    
    if (status === 'completed') {
      if (score && score >= 80) {
        return {
          label: 'Verified',
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-500 border-green-500/20',
          description: 'Your business has been verified successfully.',
        };
      }
      if (score && score >= 50) {
        return {
          label: 'Partially Verified',
          icon: AlertTriangle,
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          description: 'Some information could not be fully verified.',
        };
      }
      return {
        label: 'Needs Review',
        icon: AlertTriangle,
        className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        description: 'Your business needs additional verification.',
      };
    }

    if (status === 'failed') {
      return {
        label: 'Verification Failed',
        icon: XCircle,
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        description: 'Verification could not be completed. Please try again.',
      };
    }

    return {
      label: 'Not Verified',
      icon: Shield,
      className: 'bg-muted text-muted-foreground',
      description: 'Start verification to build trust with other members.',
    };
  };

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const statusConfig = report 
    ? getStatusConfig(report.status, report.verification_score) 
    : getStatusConfig('none', null);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Business Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('gap-1', statusConfig.className)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>
          {report?.verification_score !== null && report?.verification_score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{report.verification_score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{statusConfig.description}</p>

        {/* Score Progress */}
        {report?.verification_score !== null && report?.verification_score !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Verification Score</span>
              <span className="font-medium">{report.verification_score}%</span>
            </div>
            <Progress 
              value={report.verification_score} 
              className={cn(
                'h-2',
                report.verification_score >= 80 && '[&>div]:bg-green-500',
                report.verification_score >= 50 && report.verification_score < 80 && '[&>div]:bg-amber-500',
                report.verification_score < 50 && '[&>div]:bg-orange-500'
              )}
            />
          </div>
        )}

        {/* Positive Signals */}
        {report?.positive_signals && report.positive_signals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Positive Signals
            </p>
            <div className="flex flex-wrap gap-1.5">
              {report.positive_signals.slice(0, 4).map((signal, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-green-500/5 text-green-600 border-green-500/20">
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {report?.red_flags && report.red_flags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-orange-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Areas of Concern
            </p>
            <div className="flex flex-wrap gap-1.5">
              {report.red_flags.slice(0, 3).map((flag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-orange-500/5 text-orange-600 border-orange-500/20">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sources Checked */}
        {report?.sources_checked && report.sources_checked.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>Sources checked: {report.sources_checked.join(', ')}</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => triggerVerification.mutate()}
          disabled={isVerifying || report?.status === 'pending' || report?.status === 'processing'}
          className="w-full"
          variant={report?.status === 'completed' ? 'outline' : 'default'}
        >
          {isVerifying || report?.status === 'pending' || report?.status === 'processing' ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : report?.status === 'completed' ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-verify Business
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Start Verification
            </>
          )}
        </Button>

        {report?.created_at && (
          <p className="text-xs text-muted-foreground text-center">
            Last verified: {new Date(report.created_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
