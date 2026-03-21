import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedCard, AnimatedCardContent } from '@/components/ui/animated-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Globe, CheckCircle, Settings, Loader2, TestTube, Plug,
} from 'lucide-react';

const PLATFORMS = [
  {
    id: 'eventbrite',
    name: 'Eventbrite',
    description: 'Direct API integration — events are created and published via the Eventbrite API.',
    type: 'api' as const,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'luma',
    name: 'Luma',
    description: 'Webhook integration — sends event data to your Zapier/Make automation.',
    type: 'webhook' as const,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'meetup',
    name: 'Meetup',
    description: 'Webhook integration — dispatches events to your Meetup group via automation.',
    type: 'webhook' as const,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'posh',
    name: 'Posh',
    description: 'Webhook integration — popular in Utah/US event scene.',
    type: 'webhook' as const,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'partiful',
    name: 'Partiful',
    description: 'Webhook integration — social event invitations.',
    type: 'webhook' as const,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'facebook',
    name: 'Facebook Events',
    description: 'Webhook integration — publish to your Facebook Page events.',
    type: 'webhook' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Events',
    description: 'Webhook integration — publish to your LinkedIn company page.',
    type: 'webhook' as const,
    color: 'text-sky-600',
    bgColor: 'bg-sky-600/10',
  },
];

interface PlatformConnection {
  id: string;
  platform: string;
  connection_type: string;
  webhook_url: string | null;
  is_active: boolean;
}

export default function AdminIntegrations() {
  const queryClient = useQueryClient();
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  const { data: connections, isLoading } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*');
      if (error) throw error;
      return (data || []) as PlatformConnection[];
    },
  });

  const connectionMap = new Map(
    (connections || []).map((c) => [c.platform, c])
  );

  const saveMutation = useMutation({
    mutationFn: async ({ platform, webhookUrl, isActive }: {
      platform: string;
      webhookUrl: string;
      isActive: boolean;
    }) => {
      const existing = connectionMap.get(platform);
      if (existing) {
        const { error } = await supabase
          .from('platform_connections')
          .update({
            webhook_url: webhookUrl || null,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_connections')
          .insert({
            platform,
            connection_type: 'webhook',
            webhook_url: webhookUrl || null,
            is_active: isActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-connections'] });
      toast.success('Connection saved');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save');
    },
  });

  const handleToggle = (platform: string, isActive: boolean) => {
    const existing = connectionMap.get(platform);
    const url = editingUrls[platform] ?? existing?.webhook_url ?? '';
    saveMutation.mutate({ platform, webhookUrl: url, isActive });
  };

  const handleSaveUrl = (platform: string) => {
    const existing = connectionMap.get(platform);
    const url = editingUrls[platform] ?? existing?.webhook_url ?? '';
    const isActive = existing?.is_active ?? false;
    saveMutation.mutate({ platform, webhookUrl: url, isActive });
  };

  const handleTestWebhook = async (platform: string) => {
    const existing = connectionMap.get(platform);
    const url = editingUrls[platform] ?? existing?.webhook_url;
    if (!url) {
      toast.error('No webhook URL configured');
      return;
    }

    setTestingPlatform(platform);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          event: {
            id: 'test-event-id',
            title: 'Test Event from Admin Dashboard',
            description: 'This is a test event to verify the webhook connection.',
            date: new Date().toISOString().split('T')[0],
            time: '19:00',
            location: 'Test Venue',
            capacity: 50,
            ticket_price: 0,
            currency: 'USD',
          },
          target_platform: platform,
          callback_url: 'https://example.com/callback',
        }),
      });

      if (res.ok) {
        toast.success(`Test webhook sent to ${platform} successfully!`);
      } else {
        toast.error(`Webhook test failed: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      toast.error(`Webhook test failed: ${err.message}`);
    } finally {
      setTestingPlatform(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="font-display text-3xl text-foreground">Platform Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect event platforms to enable "Publish Everywhere"
        </p>
      </motion.div>

      <div className="grid gap-4">
        {PLATFORMS.map((platform, index) => {
          const connection = connectionMap.get(platform.id);
          const isActive = connection?.is_active ?? false;
          const currentUrl = editingUrls[platform.id] ?? connection?.webhook_url ?? '';
          const isApi = platform.type === 'api';

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AnimatedCard hoverScale={1.005}>
                <AnimatedCardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-xl ${platform.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Globe className={`h-5 w-5 ${platform.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{platform.name}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            {isApi ? 'API' : 'Webhook'}
                          </Badge>
                          {isActive && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>

                        {isApi ? (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm text-foreground">
                                API key configured — direct integration active
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={currentUrl}
                                onChange={(e) =>
                                  setEditingUrls((prev) => ({
                                    ...prev,
                                    [platform.id]: e.target.value,
                                  }))
                                }
                                placeholder="https://hook.us1.make.com/... or https://hooks.zapier.com/..."
                                className="rounded-xl text-sm"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveUrl(platform.id)}
                                disabled={saveMutation.isPending}
                                className="rounded-xl"
                              >
                                Save
                              </Button>
                              {currentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestWebhook(platform.id)}
                                  disabled={testingPlatform === platform.id}
                                  className="rounded-xl"
                                >
                                  {testingPlatform === platform.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <TestTube className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${platform.id}`} className="text-xs text-muted-foreground">
                        {isActive ? 'Active' : 'Inactive'}
                      </Label>
                      <Switch
                        id={`toggle-${platform.id}`}
                        checked={isActive}
                        onCheckedChange={(checked) => handleToggle(platform.id, checked)}
                        disabled={isApi ? false : !currentUrl}
                      />
                    </div>
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          );
        })}
      </div>

      {/* Info card */}
      <AnimatedCard>
        <AnimatedCardContent className="p-6">
          <div className="flex items-start gap-3">
            <Plug className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">How Webhooks Work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For platforms other than Eventbrite, we send a structured JSON payload to your
                webhook URL (from Zapier, Make.com, or n8n). Your automation then creates the
                event on the target platform and can optionally call back to update the sync status.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Payload includes:</strong> event title, description, date/time, location,
                capacity, price, image URL, and tags.
              </p>
            </div>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>
    </div>
  );
}
