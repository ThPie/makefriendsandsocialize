import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CalendarBlank,
  Handshake,
  BellRinging,
  Trophy,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getTierDisplayName } from '@/lib/tier-utils';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
  const { user, membership } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return { upcoming_events: 0, connections: 0, unread_notifications: 0, badges: 0 };
      const { data, error } = await supabase.rpc('get_dashboard_stats', { _user_id: user.id });
      if (error || !data || !data[0]) return { upcoming_events: 0, connections: 0, unread_notifications: 0, badges: 0 };
      return data[0];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="col-span-2 lg:col-span-7"><Skeleton className="h-[140px] w-full rounded-2xl" /></div>
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const eventsCount = data?.upcoming_events ?? 0;
  const secondaryStats = [
    {
      label: 'Connections',
      value: data?.connections ?? 0,
      subtitle: 'Active',
      icon: Handshake,
      accentClass: 'text-[hsl(var(--accent-gold))]',
      bgClass: 'bg-[hsl(var(--accent-gold))]/8',
    },
    {
      label: 'Notifications',
      value: data?.unread_notifications ?? 0,
      subtitle: 'Unread',
      icon: BellRinging,
      accentClass: 'text-primary',
      bgClass: 'bg-primary/8',
    },
    {
      label: 'Achievements',
      value: data?.badges ?? 0,
      subtitle: getTierDisplayName(membership?.tier),
      icon: Trophy,
      accentClass: 'text-[hsl(var(--accent-gold))]',
      bgClass: 'bg-[hsl(var(--accent-gold))]/8',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Primary — Upcoming Events (60%) */}
      <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
            Upcoming Events
          </span>
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CalendarBlank size={20} weight="duotone" className="text-primary" />
          </div>
        </div>
        <div className="relative z-10">
          <h3 className="text-5xl font-display font-semibold text-foreground leading-none mb-1.5">
            {eventsCount}
          </h3>
          <span className="text-xs text-muted-foreground">
            {eventsCount === 0 ? 'Discover events below' : `${eventsCount === 1 ? '1 event' : `${eventsCount} events`} coming up`}
          </span>
        </div>
      </div>

      {/* Secondary stats (40%) */}
      <div className="lg:col-span-5 grid grid-cols-3 gap-4">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] leading-tight">
                {stat.label}
              </span>
              <div className={cn('p-1.5 rounded-lg', stat.bgClass)}>
                <stat.icon size={16} weight="duotone" className={stat.accentClass} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-foreground leading-none mb-1">
                {stat.value}
              </h3>
              <span className="text-[10px] text-muted-foreground">{stat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
