import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, Clock, Loader2, MinusCircle } from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
  eventbrite: 'EB',
  luma: 'LU',
  meetup: 'MU',
  posh: 'PO',
  partiful: 'PA',
  facebook: 'FB',
  linkedin: 'LI',
};

const PLATFORM_NAMES: Record<string, string> = {
  eventbrite: 'Eventbrite',
  luma: 'Luma',
  meetup: 'Meetup',
  posh: 'Posh',
  partiful: 'Partiful',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

interface PlatformSyncStatusProps {
  eventId: string;
  compact?: boolean;
}

export function PlatformSyncStatus({ eventId, compact = true }: PlatformSyncStatusProps) {
  const { data: syncRecords } = useQuery({
    queryKey: ['event-sync-status', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_platform_sync')
        .select('*')
        .eq('event_id', eventId);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  if (!syncRecords || syncRecords.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-destructive" />;
      case 'publishing':
        return <Loader2 className="h-3 w-3 text-primary animate-spin" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-500" />;
      case 'skipped':
        return <MinusCircle className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {syncRecords.map((record: any) => (
          <Tooltip key={record.platform}>
            <TooltipTrigger asChild>
              <a
                href={record.external_url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  record.status === 'published'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                    : record.status === 'failed'
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : 'bg-muted border-border text-muted-foreground'
                } ${!record.external_url ? 'pointer-events-none' : 'cursor-pointer'}`}
              >
                {getStatusIcon(record.status)}
                {compact && <span>{PLATFORM_LABELS[record.platform] || record.platform}</span>}
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{PLATFORM_NAMES[record.platform] || record.platform}</p>
              <p className="text-xs capitalize">{record.status}</p>
              {record.error_message && (
                <p className="text-xs text-destructive max-w-48 break-words">{record.error_message}</p>
              )}
              {record.external_url && (
                <p className="text-xs text-primary">Click to open</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
