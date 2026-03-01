import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function UpcomingSchedule() {
    const { user } = useAuth();

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['dashboard-schedule', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('event_rsvps')
                .select(`
                    event_id,
                    events (id, title, date, time, location, image_url, tier)
                `)
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

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6">
                <Skeleton className="h-5 w-40 mb-6" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-40" />
                <h3 className="font-display text-lg mb-1 text-foreground">No Upcoming Events</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                    Explore and RSVP to upcoming events to see them here.
                </p>
                <Button size="sm" asChild>
                    <TransitionLink to="/portal/events">
                        Browse Events <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </TransitionLink>
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Schedule</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 px-2" asChild>
                    <TransitionLink to="/portal/events">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </TransitionLink>
                </Button>
            </div>

            {/* Table-like rows */}
            <div className="divide-y divide-border">
                {events.map((event) => {
                    const dateObj = new Date(event.date);
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const day = dateObj.getDate();
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                        <TransitionLink
                            key={event.id}
                            to={`/portal/events/${event.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors duration-150"
                        >
                            {/* Date block */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                                <span className="text-[9px] font-bold text-primary tracking-wider leading-none">{month}</span>
                                <span className="text-lg font-display font-semibold text-foreground leading-none">{day}</span>
                            </div>

                            {/* Event info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                    {event.location && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                            {event.location}
                                        </span>
                                    )}
                                    {event.time && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                            {event.time}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tier badge */}
                            <Badge variant="secondary" className="text-[10px] capitalize hidden sm:inline-flex">
                                {event.tier}
                            </Badge>
                        </TransitionLink>
                    );
                })}
            </div>
        </div>
    );
}
