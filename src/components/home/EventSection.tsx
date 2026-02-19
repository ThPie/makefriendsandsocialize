import { TransitionLink } from '@/components/ui/TransitionLink';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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

import React from 'react';

interface EventCardProps {
  event: Event;
  className?: string;
  featured?: boolean;
}

// Use forwardRef to properly handle refs and prevent React warnings
const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ event, className = '', featured = false }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col gap-0 rounded-2xl bg-[#141f17] group hover:shadow-2xl transition-all duration-500 border border-white/5 hover:border-[#d4af37]/20 hover:-translate-y-1 overflow-hidden h-full ${className}`}
      >
        <div className={`relative w-full overflow-hidden bg-[#0a0f0a] ${featured ? 'aspect-[21/9]' : 'aspect-[4/3] md:aspect-[16/9]'}`}>
          {/* Location Badge */}
          {(event.city || event.location) && (
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="text-xs font-medium text-white tracking-wide">
                {event.city || event.location}
              </span>
            </div>
          )}

          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1f1b]">
              <Calendar className="h-12 w-12 text-white/20" />
            </div>
          )}

          {/* Date Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#141f17] to-transparent pt-12">
            <p className="text-[#d4af37] font-medium text-sm flex items-center gap-2 font-display italic tracking-wide">
              <Calendar className="h-4 w-4" />
              {format(parseLocalDate(event.date), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        <div className="flex flex-col flex-grow gap-4 p-5 md:p-6 bg-[#141f17]">
          <div className="flex-1">
            <h3 className={`font-display font-medium text-white group-hover:text-[#d4af37] transition-colors leading-tight ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
              {event.title}
            </h3>

            <div className="mt-4 space-y-2 text-white/60 text-sm font-light">
              {event.venue_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#d4af37]/70" />
                  <span>{event.venue_name}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  </div>
                  <span>{event.time}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
              {event.rsvp_count && event.rsvp_count > 0 ? `${event.rsvp_count} Attending` : 'Open Invite'}
            </span>
            <TransitionLink
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#d4af37] hover:text-[#f0e6d2] transition-colors"
            >
              Details
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }
);
EventCard.displayName = 'EventCard';

const EventCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-xl bg-card border border-border overflow-hidden">
    <Skeleton className="w-full aspect-[16/9]" />
    <div className="flex flex-col gap-3 p-4 pt-0">
      <Skeleton className="h-6 w-3/4 mt-4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-24 mt-2" />
    </div>
  </div>
);

export const EventSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const queryClient = useQueryClient();

  // Fetch upcoming events from database
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['home-upcoming-events'],
    queryFn: async () => {
      // Use local date to avoid timezone issues (UTC can show wrong day)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, location, description, image_url, capacity, city, venue_name, rsvp_count')
        .gte('date', today)
        .neq('status', 'cancelled')
        .neq('status', 'past')
        .order('date', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Event[];
    },
  });

  // Subscribe to real-time updates on events table
  useEffect(() => {
    const channel = supabase
      .channel('home-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="events">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`scroll-animate mb-12 md:mb-16 ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">
            Calendar
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight text-foreground max-w-2xl">
            Upcoming <span className="italic text-primary">Gatherings</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-xl leading-relaxed font-light">
            From intimate dinners to grand galas—experience gatherings designed to inspire connection.
          </p>
        </div>

        <div className={`
          flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-6 px-6 
          md:mx-0 md:px-0 md:overflow-visible scrollbar-hide
          md:grid ${events.length === 1 ? 'md:grid-cols-1 max-w-3xl mx-auto' : events.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}
        `}>
          {isLoading ? (
            <>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
            </>
          ) : events.length > 0 ? (
            events.map((event, index) => (
              <div key={event.id} className="snap-center shrink-0 w-[85vw] md:w-auto h-full">
                <EventCard
                  event={event}
                  className={`scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''} h-full`}
                  featured={events.length === 1}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-left py-12 text-muted-foreground col-span-full">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>

        <div className={`mt-12 text-left scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Button asChild variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-colors">
            <TransitionLink to="/events" className="inline-flex items-center gap-2">
              View All Events
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </TransitionLink>
          </Button>
        </div>
      </div>
    </section>
  );
};
