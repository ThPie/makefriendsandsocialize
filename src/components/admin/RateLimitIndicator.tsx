import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetAt: string | null;
  usagePercent: number;
}

interface RateLimitIndicatorProps {
  endpoint: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function RateLimitIndicator({ endpoint, showLabel = false, compact = false }: RateLimitIndicatorProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRateLimitStatus();
    
    // Refresh every minute
    const interval = setInterval(fetchRateLimitStatus, 60000);
    return () => clearInterval(interval);
  }, [endpoint]);

  const fetchRateLimitStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limiter', {
        body: { action: 'check', endpoint }
      });

      if (!error && data) {
        setStatus({
          limit: data.limit,
          remaining: data.remaining,
          resetAt: data.resetAt,
          usagePercent: Math.round((1 - data.remaining / data.limit) * 100)
        });
      }
    } catch (error) {
      console.error('Failed to fetch rate limit status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) {
    return null;
  }

  const isWarning = status.usagePercent >= 80;
  const isCritical = status.usagePercent >= 95;

  const getProgressColor = () => {
    if (isCritical) return 'bg-destructive';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary';
  };

  const formatResetTime = (resetAt: string | null) => {
    if (!resetAt) return 'Unknown';
    return format(new Date(resetAt), 'h:mm a');
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              {isCritical ? (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              ) : (
                <Activity className={`w-4 h-4 ${isWarning ? 'text-amber-500' : 'text-muted-foreground'}`} />
              )}
              <span className={`text-xs ${isCritical ? 'text-destructive' : isWarning ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {status.remaining}/{status.limit}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">API Rate Limit</p>
              <p>Requests remaining: {status.remaining} of {status.limit}</p>
              <p>Resets at: {formatResetTime(status.resetAt)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">API Rate Limit</span>
          <span className={`${isCritical ? 'text-destructive' : isWarning ? 'text-amber-500' : ''}`}>
            {status.remaining}/{status.limit} requests
          </span>
        </div>
      )}
      <Progress 
        value={status.usagePercent} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
      {(isWarning || isCritical) && (
        <p className="text-xs text-muted-foreground">
          Resets at {formatResetTime(status.resetAt)}
        </p>
      )}
    </div>
  );
}

export function RateLimitDashboard() {
  const [statuses, setStatuses] = useState<Record<string, RateLimitStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStatuses();
    const interval = setInterval(fetchAllStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllStatuses = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limiter', {
        body: { action: 'status' }
      });

      if (!error && data?.statuses) {
        setStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Failed to fetch rate limit statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-24 bg-muted rounded-lg" />;
  }

  const endpointLabels: Record<string, string> = {
    applications: 'Applications',
    members: 'Member Profiles',
    dating: 'Dating Profiles',
    security: 'Security Reports',
    exports: 'Data Exports'
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Activity className="w-4 h-4" />
        API Rate Limits
      </h3>
      <div className="grid gap-3">
        {Object.entries(statuses).map(([endpoint, status]) => (
          <div key={endpoint} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{endpointLabels[endpoint] || endpoint}</span>
              <span className={`${status.usagePercent >= 80 ? 'text-amber-500' : ''}`}>
                {status.remaining}/{status.limit}
              </span>
            </div>
            <Progress 
              value={status.usagePercent} 
              className="h-1.5"
              indicatorClassName={
                status.usagePercent >= 95 
                  ? 'bg-destructive' 
                  : status.usagePercent >= 80 
                    ? 'bg-amber-500' 
                    : 'bg-primary'
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
