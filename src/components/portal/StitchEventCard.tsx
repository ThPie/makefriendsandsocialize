import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MapPin, Clock, Users } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string | null;
    location: string | null;
    description: string | null;
    image_url: string | null;
    tier: 'patron' | 'fellow' | 'founder';
    capacity: number | null;
    venue_name: string | null;
    city: string | null;
    status: string;
    rsvp_count: number | null;
}

interface StitchEventCardProps {
    event: Event;
    canAccess: boolean;
    isRSVPd: boolean;
    isFull: boolean;
    attending: number;
    waitlistCount: number;
    waitlistEntry?: any;
    isRSVPPending: boolean;
    isWaitlistPending: boolean;
    onRSVP: (event: Event) => void;
    onLeaveWaitlist: (eventId: string) => void;
    onClaimSpot: (eventId: string) => void;
}

export function StitchEventCard({
    event,
    canAccess,
    isRSVPd,
    isFull,
    attending,
    waitlistCount,
    waitlistEntry,
    isRSVPPending,
    isWaitlistPending,
    onRSVP,
    onLeaveWaitlist,
    onClaimSpot,
}: StitchEventCardProps) {
    const eventDate = new Date(event.date);
    const month = format(eventDate, 'MMM');
    const day = format(eventDate, 'd');

    const tierColors = {
        patron: 'bg-primary/90 text-white',
        fellow: 'bg-[#d4af37]/90 text-white',
        founder: 'bg-emerald-600/90 text-white',
    };

    const formattedTime = event.time ?
        new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'TBD';

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white dark:bg-[#1e251f] shadow-lg dark:shadow-none transition-transform duration-300 hover:scale-[1.01]">
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Date Badge */}
                <div className="absolute top-4 left-4 flex flex-col items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-white shadow-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                    <span className="font-display text-xl font-bold leading-none">{day}</span>
                </div>

                {/* Status/Tier Badge */}
                <div className={cn(
                    "absolute top-4 right-4 rounded-full backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/10",
                    tierColors[event.tier] || "bg-white/10 text-white"
                )}>
                    {event.tier} Access
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="font-display text-2xl font-bold text-white drop-shadow-md">{event.title}</h2>
                    <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{event.venue_name || event.location || 'Secret Location'}, {event.city}</span>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-col gap-4 p-5 flex-1">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-[#a2b4a6]">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium">{formattedTime}</span>
                    </div>

                    {/* Attendees Preview (Mock for now, or ideally passed in) */}
                    <div className="flex -space-x-2 overflow-hidden">
                        {/* We could pass attending users here if we had them, for now just showing count if > 0 */}
                        {attending > 0 && (
                            <span className="flex h-6 px-2 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 ring-2 ring-white dark:ring-[#1e251f] text-[10px] font-medium text-slate-500 dark:text-white">
                                {attending} attending
                            </span>
                        )}
                    </div>
                </div>

                {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}

                <div className="mt-auto">
                    {isRSVPd ? (
                        <Button
                            variant="outline"
                            className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600"
                            onClick={() => onRSVP(event)}
                            disabled={isRSVPPending}
                        >
                            {isRSVPPending ? 'Updating...' : 'RSVP Confirmed (Tap to Cancel)'}
                        </Button>
                    ) : isFull ? (
                        waitlistEntry ? (
                            <Button
                                variant="secondary"
                                className="w-full bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                onClick={() => onLeaveWaitlist(event.id)}
                                disabled={isWaitlistPending}
                            >
                                {isWaitlistPending ? 'Updating...' : `On Waitlist (#${waitlistEntry.position})`}
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => onRSVP(event)} // Handles join waitlist logic internally in parent
                                disabled={isWaitlistPending}
                            >
                                {isWaitlistPending ? 'Updating...' : 'Join Waitlist'}
                            </Button>
                        )
                    ) : (
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            onClick={() => onRSVP(event)}
                            disabled={isRSVPPending}
                        >
                            {isRSVPPending ? 'Confirming...' : 'RSVP Now'}
                        </Button>
                    )}

                    {!isFull && event.capacity && (
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            {event.capacity - attending} spots left
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
