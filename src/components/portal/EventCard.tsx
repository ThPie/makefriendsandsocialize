import { Calendar, MapPin, Clock, Crown, Users, AlertCircle, Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventAttendeePreview } from './EventAttendeePreview';
import { parseLocalDate } from '@/lib/date-utils';

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
}

interface EventCardProps {
    event: Event;
    canAccess: boolean;
    isRSVPd: boolean;
    isFull: boolean;
    attending: number;
    waitlistCount: number;
    waitlistEntry?: { position: number; status: string };
    isRSVPPending: boolean;
    isWaitlistPending: boolean;
    onRSVP: (event: Event) => void;
    onLeaveWaitlist: (eventId: string) => void;
    onClaimSpot: (eventId: string) => void;
}

export const EventCard = ({
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
}: EventCardProps) => {
    const getTierBadge = (tier: 'patron' | 'fellow' | 'founder') => {
        const colors = {
            patron: 'bg-muted text-muted-foreground',
            fellow: 'bg-accent/10 text-accent-foreground',
            founder: 'bg-primary/10 text-primary',
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[tier]}`}>
                {tier === 'founder' && <Crown className="h-3 w-3" />}
                {tier.charAt(0).toUpperCase() + tier.slice(1)} & Above
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return parseLocalDate(dateStr).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <Card className="overflow-hidden group">
            {/* Image */}
            <div className="aspect-[16/9] relative overflow-hidden">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                    alt={event.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!canAccess ? 'opacity-50' : ''
                        }`}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {getTierBadge(event.tier)}
                    {isFull && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Sold Out
                        </Badge>
                    )}
                </div>
                {!canAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Crown className="h-12 w-12 text-primary" />
                    </div>
                )}
            </div>

            <CardContent className="p-6">
                <h3 className="font-display text-xl text-foreground mb-3">{event.title}</h3>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {event.venue_name || event.location}
                            {event.city && `, ${event.city}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {(() => {
                            const spotsLeft = event.capacity ? event.capacity - attending : null;
                            if (isFull) {
                                return (
                                    <span className="text-destructive font-medium">
                                        Sold Out
                                        {waitlistCount > 0 && (
                                            <span className="text-amber-600 ml-2">({waitlistCount} on waitlist)</span>
                                        )}
                                    </span>
                                );
                            }
                            if (spotsLeft !== null && spotsLeft <= 5) {
                                return (
                                    <span className="text-amber-500 font-medium">
                                        {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
                                        {waitlistCount > 0 && (
                                            <span className="text-muted-foreground ml-2">({waitlistCount} on waitlist)</span>
                                        )}
                                    </span>
                                );
                            }
                            return (
                                <span>
                                    {attending} / {event.capacity || '∞'} attending
                                    {waitlistCount > 0 && (
                                        <span className="text-amber-600 ml-2">({waitlistCount} on waitlist)</span>
                                    )}
                                </span>
                            );
                        })()}
                    </div>
                </div>

                {/* Who's Going Preview */}
                <div className="mb-4">
                    <EventAttendeePreview eventId={event.id} totalCount={attending} />
                </div>

                {event.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                )}

                {/* Waitlist status */}
                {waitlistEntry && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-600">
                            <Clock3 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {waitlistEntry.status === 'notified'
                                    ? 'A spot opened up! Claim it now.'
                                    : `#${waitlistEntry.position} on waitlist`}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                {waitlistEntry ? (
                    <div className="flex gap-2">
                        {waitlistEntry.status === 'notified' ? (
                            <Button
                                className="flex-1"
                                onClick={() => onClaimSpot(event.id)}
                                disabled={isRSVPPending}
                            >
                                Claim Your Spot
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => onLeaveWaitlist(event.id)}
                                disabled={isWaitlistPending}
                            >
                                Leave Waitlist
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button
                        variant={isRSVPd ? 'outline' : canAccess ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => onRSVP(event)}
                        disabled={isRSVPPending || isWaitlistPending}
                    >
                        {!canAccess ? (
                            <>
                                <Crown className="h-4 w-4 mr-2" />
                                Upgrade to RSVP
                            </>
                        ) : isRSVPd ? (
                            'Cancel RSVP'
                        ) : isFull ? (
                            <>
                                <Clock3 className="h-4 w-4 mr-2" />
                                Join Waitlist
                            </>
                        ) : (
                            'RSVP Now'
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
