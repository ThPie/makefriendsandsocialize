import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, UserPlus, Award, CheckCircle, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  metadata: {
    event_id?: string;
    event_title?: string;
    first_name?: string;
    badge_type?: string;
  };
  created_at: string;
  profile?: {
    first_name: string | null;
    avatar_urls: string[] | null;
  };
}

const ACTIVITY_CONFIG = {
  rsvp: {
    icon: Calendar,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getMessage: (metadata: Activity['metadata'], firstName: string) =>
      `${firstName} RSVPd to ${metadata.event_title || 'an event'}`,
  },
  checkin: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    getMessage: (metadata: Activity['metadata'], firstName: string) =>
      `${firstName} checked in at ${metadata.event_title || 'an event'}`,
  },
  join: {
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    getMessage: (metadata: Activity['metadata'], firstName: string) =>
      `${metadata.first_name || firstName} just joined the club!`,
  },
  badge_earned: {
    icon: Award,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    getMessage: (metadata: Activity['metadata'], firstName: string) =>
      `${firstName} earned a new badge`,
  },
};

interface ActivityFeedProps {
  limit?: number;
  compact?: boolean;
}

export function ActivityFeed({ limit = 10, compact = false }: ActivityFeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('activity_feed')
        .select('id, user_id, activity_type, metadata, created_at')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_urls')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return (data || []).map((activity: any) => ({
        ...activity,
        profile: profileMap.get(activity.user_id),
      })) as Activity[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  if (isLoading) {
    return (
      <Card className={compact ? 'border-0 shadow-none bg-transparent' : ''}>
        {!compact && (
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Happening Now
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-0' : ''}>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card className={compact ? 'border-0 shadow-none bg-transparent' : ''}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Happening Now
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-0' : ''}>
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.activity_type as keyof typeof ACTIVITY_CONFIG];
            if (!config) return null;

            const Icon = config.icon;
            const firstName = activity.profile?.first_name || 'A member';
            const message = config.getMessage(activity.metadata, firstName);
            const avatar = activity.profile?.avatar_urls?.[0];
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center ${config.bgColor}`}
                  >
                    <Icon className={`h-2.5 w-2.5 ${config.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{message}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
