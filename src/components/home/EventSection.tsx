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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        () => { queryClient.invalidateQueries({ queryKey: ['home-upcoming-events'] }); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const featured = events[0];
  const upcoming = events.slice(1, 4);

  return (
    <section className="section-spacing bg-background" id="events">
      <div ref={ref} className="content-container">
        {/* Header */}
        <span className="eyebrow block mb-3">Calendar</span>
        <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1] mb-12 md:mb-16">
          Upcoming <span className="italic">Gatherings</span>
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7"><Skeleton className="w-full aspect-[16/9] rounded-2xl" /></div>
            <div className="md:col-span-5 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        ) : !featured ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 mx-auto opacity-40" />
            <p className="text-lg font-light">No upcoming events at the moment.</p>
          </div>
        ) : (
          <>
            {/* Featured event — editorial panel */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Left — cover image 60% */}
              <div className="md:col-span-7">
                <TransitionLink to={`/events/${featured.id}`} className="block">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group">
                    {featured.image_url ? (
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full bg-card flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </TransitionLink>
              </div>

              {/* Right — event details 40% */}
              <div className="md:col-span-5 flex flex-col justify-center">
                {(featured.city || featured.location) && (
                  <span className="eyebrow mb-3 text-[hsl(var(--accent-gold))]">
                    {featured.city || featured.location}
                  </span>
                )}

                <h3 className="font-display text-2xl md:text-[32px] text-foreground leading-[1.15] mb-4">
                  {featured.title}
                </h3>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                    {format(parseLocalDate(featured.date), 'EEEE, MMMM d, yyyy')}
                    {featured.time && ` · ${featured.time}`}
                  </p>
                  {featured.venue_name && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                      {featured.venue_name}
                    </p>
                  )}
                </div>

                {featured.description && (
                  <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 mb-6">
                    {featured.description}
                  </p>
                )}

                <TransitionLink
                  to={`/events/${featured.id}`}
                  className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 inline-flex items-center gap-1"
                >
                  View Details →
                </TransitionLink>

                {featured.rsvp_count && featured.rsvp_count > 0 && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {featured.rsvp_count} attending
                  </p>
                )}
              </div>
            </div>

            {/* Event chips strip */}
            {upcoming.length > 0 && (
              <div className="mt-10 flex flex-col md:flex-row gap-3">
                {upcoming.map((event, i) => (
                  <TransitionLink
                    key={event.id}
                    to={`/events/${event.id}`}
                    className={`
                      flex items-center gap-4 px-5 py-4 rounded-xl bg-card border border-border
                      hover:border-[hsl(var(--accent-gold))]/40 transition-all duration-200
                      flex-1
                      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                    style={{ transitionDelay: `${(i + 1) * 150 + 300}ms` }}
                  >
                    {/* Date block */}
                    <div className="flex flex-col items-center min-w-[44px]">
                      <span className="text-xs uppercase text-[hsl(var(--accent-gold))] font-medium">
                        {format(parseLocalDate(event.date), 'MMM')}
                      </span>
                      <span className="text-xl font-display text-foreground">
                        {format(parseLocalDate(event.date), 'd')}
                      </span>
                    </div>
                    {/* Title + venue */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-light truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.venue_name || event.location || ''}</p>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            )}

            {/* View all link */}
            <div className="mt-8 text-right">
              <TransitionLink
                to="/events"
                className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150"
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
