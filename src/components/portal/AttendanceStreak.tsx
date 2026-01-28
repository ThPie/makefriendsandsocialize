import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Calendar, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AttendanceStats {
  total_events: number;
  events_last_30_days: number;
  events_last_7_days: number;
  last_attended: string | null;
}

const STREAK_BADGES = [
  { threshold: 1, name: 'First Timer', icon: '🎉' },
  { threshold: 3, name: 'Hat Trick', icon: '🎯' },
  { threshold: 5, name: 'Social Star', icon: '⭐' },
  { threshold: 10, name: 'Event Master', icon: '👑' },
];

export function AttendanceStreak() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['attendance-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('member_attendance_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AttendanceStats | null;
    },
    enabled: !!user,
  });

  // Fetch upcoming events count
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, date')
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const eventsLast30 = stats?.events_last_30_days || 0;
  const totalEvents = stats?.total_events || 0;

  // Calculate current badge and next badge
  const currentBadgeIndex = STREAK_BADGES.findIndex((b) => b.threshold > eventsLast30) - 1;
  const currentBadge = currentBadgeIndex >= 0 ? STREAK_BADGES[currentBadgeIndex] : null;
  const nextBadge = STREAK_BADGES[currentBadgeIndex + 1] || STREAK_BADGES[STREAK_BADGES.length - 1];
  const progress = nextBadge
    ? Math.min(100, (eventsLast30 / nextBadge.threshold) * 100)
    : 100;

  // Calculate days since last event
  const daysSinceLast = stats?.last_attended
    ? Math.floor((Date.now() - new Date(stats.last_attended).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Next event date
  const nextEvent = upcomingEvents[0];
  const daysUntilNext = nextEvent
    ? Math.ceil((new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-foreground">Your Streak</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">Build your streak by attending events! Each event you attend in a 30-day period increases your streak count and unlocks badges.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-primary">{eventsLast30}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Events in 30 days</p>
            {currentBadge && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <span>{currentBadge.icon}</span>
                <span className="text-xs font-medium">{currentBadge.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress to next badge */}
        {eventsLast30 < 10 && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {nextBadge.threshold - eventsLast30} more for "{nextBadge.name}"
              </span>
              <span className="font-medium">{nextBadge.icon}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Streak motivator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            {daysSinceLast !== null && daysSinceLast <= 14 ? (
              <span>
                Keep your streak!{' '}
                {daysUntilNext !== null && (
                  <span className="text-primary font-medium">
                    Next event in {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
            ) : daysUntilNext !== null ? (
              <span>
                Start your streak!{' '}
                <span className="text-primary font-medium">
                  Next event in {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                No upcoming events scheduled
              </span>
            )}
          </div>
        </div>

        {/* Total stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm">
              <span className="font-medium">{totalEvents}</span>{' '}
              <span className="text-muted-foreground">total events</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
