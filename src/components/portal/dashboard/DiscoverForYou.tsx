import { useAuth } from '@/contexts/AuthContext';
import { parseLocalDate } from '@/lib/date-utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarBlank,
  UsersThree,
  HeartStraight,
  ArrowRight,
  Compass,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  type: 'event' | 'connection' | 'match';
  title: string;
  subtitle: string;
  link: string;
  icon: typeof CalendarBlank;
  accentClass: string;
}

export function DiscoverForYou() {
  const { user } = useAuth();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['discover-for-you', user?.id],
    queryFn: async () => {
      const items: ActivityItem[] = [];
      const today = new Date().toISOString().split('T')[0];

      // Get upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, date, location')
        .gte('date', today)
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(2);

      events?.forEach((e) => {
        const dateStr = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        items.push({
          type: 'event',
          title: e.title,
          subtitle: `${dateStr}${e.location ? ` · ${e.location}` : ''}`,
          link: `/portal/events/${e.id}`,
          icon: CalendarBlank,
          accentClass: 'text-primary bg-primary/10',
        });
      });

      // Get member count for social proof
      if (user) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (count && count > 0) {
          items.push({
            type: 'connection',
            title: 'Browse the Network',
            subtitle: `${count} members to connect with`,
            link: '/portal/network',
            icon: UsersThree,
            accentClass: 'text-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold))]/10',
          });
        }
      }

      return items.slice(0, 3);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Compass size={16} weight="duotone" className="text-[hsl(var(--accent-gold))]" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-[0.12em]">Suggested for You</h2>
        </div>
      </div>
      <div className="divide-y divide-border">
        {suggestions.map((item, index) => (
          <TransitionLink
            key={index}
            to={item.link}
            className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors duration-150 group"
          >
            <div className={cn('p-2.5 rounded-xl flex-shrink-0', item.accentClass)}>
              <item.icon size={18} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
