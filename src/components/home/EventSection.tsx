import { Link } from 'react-router-dom';
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

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard = ({ event, className = '' }: EventCardProps) => {
  return (
    <div className={`flex flex-col gap-4 rounded-xl bg-card group hover:shadow-elegant transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-2 overflow-hidden ${className}`}>
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4 pt-0 z-10 bg-card">
        <p className="font-display text-xl font-medium leading-normal text-card-foreground mt-4 line-clamp-2">
          {event.title}
        </p>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(parseLocalDate(event.date), 'MMMM d, yyyy')}
            {event.time && ` • ${event.time}`}
          </div>
          {(event.venue_name || event.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue_name || event.location}
              {event.city && ` • ${event.city}`}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.rsvp_count && event.rsvp_count > 0 
              ? `${event.rsvp_count} attending`
              : event.capacity 
                ? `${event.capacity} spots`
                : 'Open event'
            }
          </div>
        </div>
        <Link
          to={`/events/${event.id}`}
          className="group/link inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity min-h-[44px] py-2"
        >
          View Details
          <span className="material-symbols-outlined transition-transform group-hover/link:translate-x-1 text-lg">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
};

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
      const today = new Date().toISOString().split('T')[0];
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
        <div className={`scroll-animate text-center mb-12 md:mb-16 ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            Upcoming <span className="text-primary">Gatherings</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">
            From intimate dinners to grand galas—experience gatherings designed to inspire.
          </p>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible scrollbar-hide">
          {isLoading ? (
            <>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
              <div className="snap-center shrink-0 w-[85vw] md:w-auto"><EventCardSkeleton /></div>
            </>
          ) : events.length > 0 ? (
            events.map((event, index) => (
              <div key={event.id} className="snap-center shrink-0 w-[85vw] md:w-auto">
                <EventCard 
                  event={event} 
                  className={`scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
        <div className={`mt-10 text-center scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity group min-h-[44px] py-2"
          >
            View All Events
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-lg">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
