import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRef } from 'react';

export function UpcomingSchedule() {
    const { user } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['dashboard-schedule', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            // Get user RSVPs joined with events
            const { data, error } = await supabase
                .from('event_rsvps')
                .select(`
          event_id,
          events (
            id,
            title,
            date,
            time,
            location,
            image_url,
            tier
          )
        `)
                .eq('user_id', user.id)
                .eq('status', 'confirmed')
                .gte('events.date', today)
                .order('events(date)', { ascending: true })
                .limit(5);

            if (error) {
                console.error('Error fetching schedule:', error);
                return [];
            }

            // Filter out null events (where join might fail if event deleted) and flatten
            return data
                .map(item => item.events)
                .filter(e => e !== null) as any[]; // Type assertion for brevity
        },
        enabled: !!user,
    });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="h-64 rounded-xl border border-border/50 bg-card/30 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        );
    }

    // If no upcoming events, show empty state (optional: or recommendations)
    if (events.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/30">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-display text-xl mb-2 text-foreground">Your Schedule is Empty</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't RSVP'd to any upcoming events completely yet. Explore the calendar to find your next gathering.
                </p>
                <Button asChild>
                    <TransitionLink to="/portal/events">
                        Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                    </TransitionLink>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold">Your Upcoming Schedule</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full border-border/50 hover:bg-muted">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full border-border/50 hover:bg-muted">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {events.map((event) => {
                    // Format date: "OCT 12"
                    const dateObj = new Date(event.date);
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const day = dateObj.getDate();

                    return (
                        <Card key={event.id} className="min-w-[300px] md:min-w-[350px] snap-start group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
                            <div className="relative h-40 overflow-hidden">
                                {event.image_url ? (
                                    <img
                                        src={event.image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Calendar className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                {/* Date Badge */}
                                <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg p-2 text-center min-w-[3.5rem] shadow-lg">
                                    <div className="text-[10px] font-bold tracking-wider uppercase leading-none mb-1">{month}</div>
                                    <div className="text-xl font-bold leading-none">{day}</div>
                                </div>

                                {/* Tier Badge */}
                                <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur border-none hover:bg-black/60 capitalize">
                                    {event.tier}
                                </Badge>
                            </div>

                            <CardContent className="p-5">
                                <h3 className="font-display text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text truncate">
                                    {event.title}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                                        <span className="truncate">{event.location || 'Location TBD'}</span>
                                    </div>
                                    {event.time && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 mr-2 text-primary" />
                                            <span>{event.time}</span>
                                        </div>
                                    )}
                                </div>

                                <Button className="w-full group-hover:bg-primary/90 transition-colors" asChild>
                                    <TransitionLink to={`/portal/events/${event.id}`}>
                                        View Details
                                    </TransitionLink>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
