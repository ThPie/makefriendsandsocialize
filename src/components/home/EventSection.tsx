import { TransitionLink } from '@/components/ui/TransitionLink';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useEffect } from 'react';
import { parseLocalDate } from '@/lib/date-utils';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  capacity: number | null;
  city: string | null;
  venue_name: string | null;
  rsvp_count: number | null;
}

const EventCard = ({ event, className = '' }: { event: Event, className?: string }) => {
  return (
    <TransitionLink
      to={`/events/${event.id}`}
      className={`rounded-2xl overflow-hidden group border border-border hover:border-[hsl(var(--accent-gold))] bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[hsl(var(--accent-gold))]/20 block ${className}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3">
        <h3 className="font-display text-lg md:text-xl text-foreground leading-tight">{event.title}</h3>

        <div className="flex flex-col gap-1.5 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--accent-gold))] shrink-0" />
            <span>{format(parseLocalDate(event.date), 'MMM d, yyyy')}{event.time ? ` · ${event.time}` : ''}</span>
          </div>

          {(event.venue_name || event.location || event.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[hsl(var(--accent-gold))] shrink-0" />
              <span className="truncate">{event.venue_name || event.city || event.location}</span>
            </div>
          )}

          {event.rsvp_count != null && event.rsvp_count > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[hsl(var(--accent-gold))] shrink-0" />
              <span>{event.rsvp_count} attending</span>
            </div>
          )}
        </div>

        <span className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 mt-1">
          View Details →
        </span>
      </div>
    </TransitionLink>
  );
};

export const EventSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['home-upcoming-events'],
    queryFn: async () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const { data, error } = await supabase.
        from('events').
        select('id, title, date, time, location, description, image_url, capacity, city, venue_name, rsvp_count').
        gte('date', today).
        neq('status', 'cancelled').
        neq('status', 'past').
        order('date', { ascending: true }).
        limit(3);

      if (error) throw error;
      return data as Event[];
    }
  });

  useEffect(() => {
    const channel = supabase.
      channel('home-events-realtime').
      on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        () => { queryClient.invalidateQueries({ queryKey: ['home-upcoming-events'] }); }
      ).
      subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return (
    <section className="py-16 md:py-20 bg-card border-t border-border" id="events">
      <div ref={ref} className="content-container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))] text-gold">Calendar</span>
          <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1]">
            Upcoming <span className="italic">Gatherings</span>
          </h2>
        </div>

        {isLoading ?
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) =>
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton className="w-full aspect-[16/10]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}
          </div> :
          events.length === 0 ?
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 mx-auto opacity-40" />
              <p className="text-lg font-light">No upcoming events at the moment.</p>
            </div> :
            <>
              {/* Mobile: Horizontal scroll */}
              <div className={`md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 -mx-4 px-4 transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {events.map((event) => (
                  <EventCard key={event.id} event={event} className="w-[72vw] min-w-[280px] snap-center shrink-0" />
                ))}
              </div>

              {/* Desktop: 3-Card Grid */}
              <div className={`hidden md:grid grid-cols-3 gap-6 transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* View all link */}
              <div className="mt-12 text-center">
                <TransitionLink
                  to="/events"
                  className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150">
                  View All Events →
                </TransitionLink>
              </div>
            </>
        }
      </div>
    </section>
  );
};
