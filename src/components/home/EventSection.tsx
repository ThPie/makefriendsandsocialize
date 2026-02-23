import { TransitionLink } from '@/components/ui/TransitionLink';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin } from 'lucide-react';
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

export const EventSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['home-upcoming-events'],
    queryFn: async () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, location, description, image_url, capacity, city, venue_name, rsvp_count')
        .gte('date', today)
        .neq('status', 'cancelled')
        .neq('status', 'past')
        .order('date', { ascending: true })
        .limit(4);
      if (error) throw error;
      return data as Event[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('home-events-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, () => {
        queryClient.invalidateQueries({ queryKey: ['home-upcoming-events'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const featured = events[0];
  const upcoming = events.slice(1);

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="events">
      <div ref={ref} className={`mx-auto max-w-[1200px] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        <div className="mb-12">
          <span className="section-label mb-3 block">Calendar</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground">
            Upcoming <span className="italic text-[hsl(var(--gold))]">Gatherings</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <>
            {/* Featured event — editorial layout */}
            {featured && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Image */}
                <div className="md:col-span-7 relative aspect-video rounded-2xl overflow-hidden bg-surface">
                  {featured.image_url ? (
                    <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Date pill */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[hsl(var(--gold))] text-background text-xs font-medium">
                    {format(parseLocalDate(featured.date), 'MMM d')}
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-5 flex flex-col justify-center py-4">
                  <span className="section-label mb-3 block">Featured Event</span>
                  <h3 className="font-display text-2xl md:text-[32px] text-foreground leading-tight mb-4">
                    {featured.title}
                  </h3>
                  {featured.venue_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 text-[hsl(var(--gold))]/70" />
                      <span>{featured.venue_name}</span>
                    </div>
                  )}
                  {featured.time && (
                    <p className="text-sm text-muted-foreground mb-4">{featured.time}</p>
                  )}
                  {featured.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                      {featured.description}
                    </p>
                  )}
                  <TransitionLink
                    to={`/events/${featured.id}`}
                    className="text-sm font-medium text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-light))] transition-colors duration-200"
                  >
                    View Details →
                  </TransitionLink>
                </div>
              </div>
            )}

            {/* Upcoming event chips */}
            {upcoming.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {upcoming.map((event) => (
                  <TransitionLink
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-center gap-4 min-w-[300px] h-20 px-4 rounded-xl bg-surface border border-border hover:border-[hsl(var(--gold))]/40 transition-colors duration-200 shrink-0"
                  >
                    <div className="text-center shrink-0 w-12">
                      <p className="text-xs text-[hsl(var(--gold))] font-medium uppercase">
                        {format(parseLocalDate(event.date), 'MMM')}
                      </p>
                      <p className="text-xl font-display text-foreground">
                        {format(parseLocalDate(event.date), 'd')}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.venue_name || event.city || ''}</p>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            )}

            {/* View all link */}
            <div className="flex justify-end mt-6">
              <TransitionLink
                to="/events"
                className="text-sm font-medium text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-light))] transition-colors duration-200"
              >
                View all events →
              </TransitionLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
