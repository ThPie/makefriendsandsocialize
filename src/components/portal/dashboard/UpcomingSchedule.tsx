import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarBlank, MapPin, Clock, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { parseLocalDate } from '@/lib/date-utils';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function UpcomingSchedule() {
  const { user } = useAuth();

  // User's confirmed events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['dashboard-schedule', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`event_id, events (id, title, date, time, location, image_url, tier)`)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('events.date', today)
        .order('events(date)', { ascending: true })
        .limit(5);
      if (error) return [];
      return data.map(item => item.events).filter(e => e !== null) as any[];
    },
    enabled: !!user,
  });

  // Recommended events (shown when user has no upcoming events)
  const { data: recommended = [] } = useQuery({
    queryKey: ['recommended-events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, location, image_url, tier')
        .gte('date', today)
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(3);
      if (error) return [];
      return data;
    },
    enabled: !!user && events.length === 0,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  // "Discover for You" when no events
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Sparkle size={16} weight="duotone" className="text-[hsl(var(--accent-gold))]" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Discover for You</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 px-2" asChild>
            <TransitionLink to="/portal/events">
              View All <ArrowRight size={12} className="ml-1" />
            </TransitionLink>
          </Button>
        </div>

        {recommended.length > 0 ? (
          <div className="divide-y divide-border">
            {recommended.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CalendarBlank size={32} weight="duotone" className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-display text-lg mb-1 text-foreground">No Events Yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              New events are being planned. Check back soon.
            </p>
            <Button size="sm" asChild>
              <TransitionLink to="/portal/events">
                Browse Events <ArrowRight size={14} className="ml-2" />
              </TransitionLink>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <CalendarBlank size={16} weight="duotone" className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Schedule</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 px-2" asChild>
          <TransitionLink to="/portal/events">
            View All <ArrowRight size={12} className="ml-1" />
          </TransitionLink>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: any }) {
  const dateObj = parseLocalDate(event.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  return (
    <TransitionLink
      to={`/portal/events/${event.id}`}
      className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-muted/30 transition-colors duration-150"
    >
      <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
        <span className="text-[9px] font-bold text-primary tracking-wider leading-none">{month}</span>
        <span className="text-base sm:text-lg font-display font-semibold text-foreground leading-none">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{event.title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          {event.location && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </span>
          )}
          {event.time && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} className="flex-shrink-0" />
              {event.time}
            </span>
          )}
        </div>
      </div>
    </TransitionLink>
  );
}
