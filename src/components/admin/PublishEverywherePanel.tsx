import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Clock, Loader2, Send, Globe, ExternalLink,
} from 'lucide-react';

const PLATFORMS = [
  { id: 'eventbrite', name: 'Eventbrite', type: 'api', color: 'text-orange-500' },
  { id: 'luma', name: 'Luma', type: 'webhook', color: 'text-purple-500' },
  { id: 'meetup', name: 'Meetup', type: 'webhook', color: 'text-red-500' },
  { id: 'posh', name: 'Posh', type: 'webhook', color: 'text-pink-500' },
  { id: 'partiful', name: 'Partiful', type: 'webhook', color: 'text-blue-500' },
  { id: 'facebook', name: 'Facebook Events', type: 'webhook', color: 'text-blue-600' },
  { id: 'linkedin', name: 'LinkedIn Events', type: 'webhook', color: 'text-sky-600' },
];

interface PublishEverywherePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

export function PublishEverywherePanel({
  open, onOpenChange, eventId, eventTitle,
}: PublishEverywherePanelProps) {
  const queryClient = useQueryClient();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());

  // Fetch active platform connections
  const { data: connections } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch existing sync status for this event
  const { data: syncRecords, refetch: refetchSync } = useQuery({
    queryKey: ['event-sync-status', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_platform_sync')
        .select('*')
        .eq('event_id', eventId);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
    refetchInterval: open ? 3000 : false,
  });

  const connectedPlatformIds = new Set(
    (connections || []).map((c: any) => c.platform)
  );
  // Eventbrite is always "connected" since we have the API key
  connectedPlatformIds.add('eventbrite');

  // Initialize selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPlatforms(new Set(connectedPlatformIds));
    }
  }, [open, connections]);

  const syncMap = new Map(
    (syncRecords || []).map((r: any) => [r.platform, r])
  );

  const publishMutation = useMutation({
    mutationFn: async () => {
      const platforms = Array.from(selectedPlatforms).filter((p) =>
        connectedPlatformIds.has(p)
      );
      if (platforms.length === 0) {
        throw new Error('No platforms selected');
      }

      const { data, error } = await supabase.functions.invoke('publish-event', {
        body: { event_id: eventId, platforms },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Publish failed');
      return data;
    },
    onSuccess: (data) => {
      const results = data.results || {};
      const published = Object.entries(results).filter(([, r]: any) => r.status === 'published').length;
      const failed = Object.entries(results).filter(([, r]: any) => r.status === 'failed').length;
      const pending = Object.entries(results).filter(([, r]: any) => r.status === 'pending').length;

      if (failed === 0) {
        toast.success(`Published to ${published} platform${published !== 1 ? 's' : ''}${pending > 0 ? `, ${pending} pending webhook callback` : ''}`);
      } else {
        toast.warning(`${published} published, ${failed} failed. Check details below.`);
      }

      queryClient.invalidateQueries({ queryKey: ['event-sync-status', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      refetchSync();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to publish');
    },
  });

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
      }
      return next;
    });
  };

  const getStatusDisplay = (platformId: string) => {
    const record = syncMap.get(platformId);
    if (!record) return null;

    switch (record.status) {
      case 'published':
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">Published</span>
            {record.external_url && (
              <a href={record.external_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive" title={record.error_message || ''}>
              Failed
            </span>
          </div>
        );
      case 'publishing':
        return (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <span className="text-xs text-primary">Publishing...</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-amber-500">Awaiting callback</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Globe className="h-5 w-5 text-primary" />
            Publish Everywhere
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Publishing: <span className="font-medium text-foreground">{eventTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {PLATFORMS.map((platform) => {
            const isConnected = connectedPlatformIds.has(platform.id);
            const isSelected = selectedPlatforms.has(platform.id);
            const statusDisplay = getStatusDisplay(platform.id);

            return (
              <div
                key={platform.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isConnected
                    ? 'border-border bg-card'
                    : 'border-border/50 bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isSelected && isConnected}
                    onCheckedChange={() => togglePlatform(platform.id)}
                    disabled={!isConnected || publishMutation.isPending}
                  />
                  <div>
                    <Label className={`font-medium ${platform.color}`}>
                      {platform.name}
                    </Label>
                    {!isConnected && (
                      <p className="text-xs text-muted-foreground">
                        Not connected — add webhook in Integrations
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusDisplay}
                  {isConnected && !statusDisplay && (
                    <Badge variant="outline" className="text-[10px]">
                      {platform.type === 'api' ? 'API' : 'Webhook'}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {selectedPlatforms.size} platform{selectedPlatforms.size !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={() => publishMutation.mutate()}
            disabled={
              publishMutation.isPending ||
              selectedPlatforms.size === 0
            }
            className="rounded-xl"
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publish Selected
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
